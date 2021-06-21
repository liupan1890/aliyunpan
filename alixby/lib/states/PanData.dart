import 'package:alixby/api/AliFile.dart';
import 'package:alixby/models/FileItem.dart';
import 'package:alixby/states/Global.dart';

class PanData {
  static FileItem root = FileItem.newFileItem("box", "root", "", "根目录");
  static FileItem trash = FileItem.newFileItem("box", "trash", "", "回收站");
  static FileItem favorite = FileItem.newFileItem("box", "favorite", "", "收藏夹");

  static FileItem xiangce = FileItem.newFileItem("xiangce", "root", "", "相册");
  static FileItem trash2 = FileItem.newFileItem("xiangce", "trash", "", "回收站");
  static FileItem favorite2 = FileItem.newFileItem("xiangce", "favorite", "", "收藏夹");

  static FileItem safebox = FileItem.newFileItem("sbox", "safebox", "", "保险箱");

  // ignore: non_constant_identifier_names
  static FileItem? getFileItem(String box, String key, {FileItem? parent}) {
    FileItem? _found;

    if (box == "box" && key == "trash") return trash;
    if (box == "box" && key == "favorite") return favorite;
    if (box == "xiangce" && key == "trash") return trash2;
    if (box == "xiangce" && key == "favorite") return favorite2;

    List<FileItem> _children = parent == null ? [root] : parent.children;
    if (box == "xiangce") {
      _children = parent == null ? [xiangce] : parent.children;
    } else if (box == "safebox") {
      _children = parent == null ? [safebox] : parent.children;
    }

    Iterator iter = _children.iterator;
    while (iter.moveNext()) {
      FileItem child = iter.current;
      if (child.key == key) {
        _found = child;
        break;
      } else {
        if (child.isFile == false) {
          _found = getFileItem(box, key, parent: child);
          if (_found != null) {
            break;
          }
        }
      }
    }
    return _found;
  }

  //最后一次触发加载文件夹的文件列表的dirkey--用来避免多次重复加载同一个文件夹的文件列表
  static Map<String, bool> loading = {};

  static Map<String, int> loadDataTime = {}; //用来抛弃无效的续增
  //网络回调附加子文件列表
  static apiFileListCallBack(FileListModel loadData) {
    var loadkey = loadData.box + loadData.key;
    if (loadData.next_marker == "error") {
      loading[loadkey] = false;
      return;
    }
    if (loadData.isMarker && loadDataTime[loadkey] != loadData.time) return; //无效的续增

    FileItem? file = getFileItem(loadData.box, loadData.key);
    if (file == null) {
      loading[loadkey] = false;
      return; //无效的数据，不可能发生
    }

    //保存数据
    if (loadData.isMarker == true) {
      file.children.addAll(loadData.list);
    } else {
      file.children = loadData.list;
    }
    //更新显示

    Global.getTreeState(loadData.box).notifyFileListChanged(loadData.key);
    Global.getFileState(loadData.box).notifyFileListChanged(loadData.box, loadData.key);

    //如果还有next_marker，继续加载
    if (loadData.next_marker != "") {
      if (loadData.isMarker == false) {
        loadDataTime[loadkey] = loadData.time; //第一次拉取时标记一下
      }

      AliFile.apiFileList(loadData.time, loadData.box, loadData.key, loadData.name, marker: loadData.next_marker)
          .then((data) {
        apiFileListCallBack(data);
      });
    } else {
      loading[loadkey] = false;
    }
  }

  //点击文件树时会触发这里加载文件列表
  //点击--PanTreeState.expandedNode--PanData.loadFileList--PanData.apiFileListCallBack--panFileState.notifyFileListChanged+PanTreeState.notifyFileListChanged
  static loadFileList(String box, String parentkey, String name) {
    var loadkey = box + parentkey;
    if (!loading.containsKey(loadkey) || loading[loadkey] == false) {
      loading[loadkey] = true;
      AliFile.apiFileList(DateTime.now().millisecondsSinceEpoch, box, parentkey, name).then((data) {
        apiFileListCallBack(data);
      });
    }
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
    xiangce.children = [];
  }
}
