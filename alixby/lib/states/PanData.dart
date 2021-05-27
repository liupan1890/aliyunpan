import 'package:alixby/api/AliFile.dart';
import 'package:alixby/models/FileItem.dart';
import 'package:alixby/states/Global.dart';

class PanData {
  static FileItem root = FileItem.newFileItem("root", "", "根目录");
  static FileItem trash = FileItem.newFileItem("trash", "", "回收站");
  static FileItem favorite = FileItem.newFileItem("favorite", "", "收藏夹");
  static FileItem safebox = FileItem.newFileItem("safebox", "", "保险箱");
  static FileItem calendar = FileItem.newFileItem("calendar", "", "最近访问");

  // ignore: non_constant_identifier_names
  static FileItem? getFileItem(String key, {FileItem? parent}) {
    FileItem? _found;

    switch (key) {
      case "trash":
        return trash;
      case "favorite":
        return favorite;
      case "safebox":
        return safebox;
      case "calendar":
        return calendar;
    }

    List<FileItem> _children = parent == null ? [root] : parent.children;
    Iterator iter = _children.iterator;
    while (iter.moveNext()) {
      FileItem child = iter.current;
      if (child.key == key) {
        _found = child;
        break;
      } else {
        if (child.isFile == false) {
          _found = getFileItem(key, parent: child);
          if (_found != null) {
            break;
          }
        }
      }
    }
    return _found;
  }

  static Map<String, int> loadDataTime = {}; //用来抛弃无效的续增
  //网络回调附加子文件列表
  static apiFileListCallBack(FileListModel loadData) {
    if (loadData.key == "error") return;
    if (loadData.isMarker && loadDataTime[loadData.key] != loadData.time) return; //无效的续增

    FileItem? file = getFileItem(loadData.key);
    if (file == null) return; //无效的数据，不可能发生

    //保存数据
    if (loadData.isMarker == true) {
      file.children.addAll(loadData.list);
    } else {
      file.children = loadData.list;
    }
    //更新显示
    Global.panTreeState.notifyFileListChanged(loadData.key);
    Global.panFileState.notifyFileListChanged(loadData.key);

    //如果还有next_marker，继续加载
    if (loadData.next_marker != "") {
      if (loadData.isMarker == false) {
        loadDataTime[loadData.key] = loadData.time; //第一次拉取时标记一下
      }

      AliFile.apiFileList(loadData.time, loadData.key, loadData.name, marker: loadData.next_marker).then((data) {
        print('load next_marker  for network ok ' + loadData.key);
        apiFileListCallBack(data);
      });
    }
  }

  //点击文件树时会触发这里加载文件列表
  //点击--PanTreeState.expandedNode--PanData.loadFileList--PanData.apiFileListCallBack--panFileState.notifyFileListChanged+PanTreeState.notifyFileListChanged
  static loadFileList(String parentkey, String name) {
    print('load  for network ' + name + " " + parentkey);
    AliFile.apiFileList(DateTime.now().millisecondsSinceEpoch, parentkey, name).then((data) {
      print('load  for network ok ' + name + " " + parentkey);
      apiFileListCallBack(data);
    });
  }

  //删除文件时，要调用这里，刷新
  static clearTrash() {
    trash.children = [];
  }

  //收藏文件时，要调用这里，刷新
  static clearFavor() {
    favorite.children = [];
  }

//用户退出时清理全部
  static clearAll() {
    root.children = [];
    trash.children = [];
    favorite.children = [];
    safebox.children = [];
    calendar.children = [];
  }
}
