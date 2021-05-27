import 'package:alixby/models/FileItem.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';

import 'PanData.dart';

class PanFileState extends ChangeNotifier {
  PanFileState();

  //右侧顶部的 文件夹路径导航
  InlineSpan pageRightDirPath = TextSpan(style: TextStyle(fontSize: 13), children: []);
  //右侧真正绑定显示的文件列表
  List<PageRightFileItem> pageRightFileList = [];
  //基准的文件列表，用来生成排序后的文件列表
  List<PageRightFileItem> pageRightFileList0 = [];
  //排序方式
  String pageRightFileOrderBy = "文件名 从小到大";
  //绑定显示的 选中文件数
  String get pageRightFileSelectedDes =>
      "共 " + pageRightFileSelectedCount.toString() + " / " + pageRightFileList0.length.toString() + " 个";
  //当前选中的文件数
  int pageRightFileSelectedCount = 0;
  //当前正在显示的文件列表是属于哪一个文件夹
  String pageRightDirKey = "";
  //最后一次点击的文件key，shift多选时用到
  String pageRightLastClickKey = "";
  //当前正在显示的文件列表是属于哪一个页面（file/trash/favorite/safebox/calendar）顶部菜单关联显示用到
  String get getPageName {
    var key = pageRightDirKey;
    if (key == "trash" || key == "favorite" || key == "safebox" || key == "calendar")
      return key;
    else
      return "file";
  }

  //页面调用，更改排序方式
  pageChangeOrderBy(String order) {
    FileItem? file = PanData.getFileItem(pageRightDirKey);
    if (file != null) {
      pageRightFileOrderBy = order;
      _updateFileOrder();
      notifyListeners();
    }
  }

  //网络回调更新子文件列表
  notifyFileListChanged(String loadKey) {
    if (pageRightDirKey == loadKey) {
      FileItem? file = PanData.getFileItem(loadKey);
      if (file != null) {
        _updateFileList(file, true);
        notifyListeners();
      }
    }
  }

  //页面调用，文件树操作选择文件夹时触发
  pageSelectNode(String key) {
    FileItem? file = PanData.getFileItem(key);
    if (file != null) {
      bool isUpdate = pageRightDirKey == key;
      pageRightDirKey = key;
      if (isUpdate == false) _updateFilePath(file);
      _updateFileList(file, isUpdate);
      pageSelectFile(''); //清空选中项
    }
  }

  //页面调用，选中文件
  pageSelectFile(String key) {
    int total = pageRightFileList.length;
    int selected = 0;
    if (key == "all") {
      pageRightLastClickKey = "";
      bool istoselect = false;
      for (int i = 0; i < total; i++) {
        if (pageRightFileList[i].selected) {
          istoselect = true;
          selected++;
        }
      }

      if (istoselect && selected == total) {
        //已经是全选了，执行反选操作
        selected = 0;
        for (int i = 0; i < total; i++) {
          pageRightFileList[i].selected = false;
        }
      } else {
        //一个也没选中 或者 部分文件被选中，执行全选操作
        selected = total;
        for (int i = 0; i < total; i++) {
          pageRightFileList[i].selected = true;
        }
      }
    } else {
      bool isCtrl = Global.isCtrl;
      bool isShift = Global.isShift;
      bool isHandle = false; //是否已经成功处理
      if (isShift) {
        //从pageRightLastClickKey到key
        selected = 0;
        int start = -1, end = -1;
        for (int i = 0; i < total; i++) {
          if (pageRightFileList[i].key == pageRightLastClickKey) {
            start = i;
          }
          if (pageRightFileList[i].key == key) {
            end = i;
          }
          if (start > 0 && end > 0) break;
        }
        if (start >= 0 && end >= 0) {
          if (start > end) {
            var m = start;
            start = end;
            end = m;
          }
          for (int n = start; n <= end; n++) {
            pageRightFileList[n].selected = true;
          }
          for (int j = 0; j < total; j++) {
            if (pageRightFileList[j].selected) selected++;
          }
          isHandle = true;
        }
      }

      if (isHandle == false && isCtrl) {
        selected = 0;
        for (int i = 0; i < total; i++) {
          if (pageRightFileList[i].key == key) {
            pageRightFileList[i].selected = !pageRightFileList[i].selected;
            break;
          }
        }
        for (int j = 0; j < total; j++) {
          if (pageRightFileList[j].selected) selected++;
        }
        isHandle = true;
      }
      if (isHandle == false) {
        selected = 0;
        int isSomeSelect = 0; //是否已经多选，如果已经多选，最后应该变成单选key这一个
        for (int i = 0; i < total; i++) {
          if (pageRightFileList[i].selected) isSomeSelect++;
          if (isSomeSelect > 1) break; //说明有多个选中的
        }

        for (int i = 0; i < total; i++) {
          if (pageRightFileList[i].key == key) {
            //如果有多个文件被选中 || 反选
            pageRightFileList[i].selected = isSomeSelect > 1 || !pageRightFileList[i].selected;
            if (pageRightFileList[i].selected) {
              selected = 1;
            }
          } else if (pageRightFileList[i].selected) {
            pageRightFileList[i].selected = false; //其他的全部取消选中
          }
        }
      }
      pageRightLastClickKey = key;
    }
    pageRightFileSelectedCount = selected;
    notifyListeners();
  }

  //用户退出
  userLogoff() {
    PanData.clearAll();
    pageRightFileList = [];
    pageRightFileList0 = [];
    pageRightFileSelectedCount = 0;
    pageRightDirKey = "";
    pageRightLastClickKey = "";
    pageRightDirPath = TextSpan(style: TextStyle(fontSize: 13), children: []);
    notifyListeners();
  }

  //返回所有选中的文件的keylist
  List<String> getSelectedFileKeys() {
    List<String> selectKeys = [];
    for (int f = 0; f < pageRightFileList0.length; f++) {
      if (pageRightFileList0[f].selected) selectKeys.add(pageRightFileList0[f].key);
    }
    return selectKeys;
  }

  //返回所有选中的文件的filelist
  List<PageRightFileItem> getSelectedFiles() {
    List<PageRightFileItem> selectKeys = [];
    for (int f = 0; f < pageRightFileList0.length; f++) {
      if (pageRightFileList0[f].selected) selectKeys.add(pageRightFileList0[f]);
    }
    return selectKeys;
  }

//返回选中文件的父文件夹的完整路径（下载用）
  String getSelectedFileParentPath() {
    List<String> names = [];

    var pid = pageRightDirKey;
    while (true) {
      if (pid == "root") break; //成功到顶
      var find = PanData.getFileItem(pid);
      if (find == null) break; //没有找到
      names.add(find.name);
      pid = find.parentkey;
    }
    String path = "";
    for (int i = names.length - 1; i >= 0; i--) {
      path = path + "/" + names[i];
    }
    return path; // "" /xx/xx
  }

  static _onOpen(LinkableElement link) {
    Global.panTreeState.pageSelectNode(link.url, false);
  }

  //刷新顶部文件路径导航
  bool _updateFilePath(FileItem file) {
    List<String> names = [];
    List<String> ids = [];

    var topkey = file.key;
    var topname = file.name;

    if (topkey != "trash" && topkey != "favorite" && topkey != "safebox" && topkey != "calendar") {
      topkey = "root";
      topname = "根目录";
    }

    var pid = file.parentkey;
    if (pid != "") {
      //root时 pid==""
      names.add(file.name);
      ids.add(file.key);
      while (true) {
        if (pid == "root") break; //成功到顶
        var find = PanData.getFileItem(pid);
        if (find == null) return false; //没有找到
        names.add(find.name);
        ids.add(find.key);
        pid = find.parentkey;
      }
    }
    List<InlineSpan> childs = [];
    var linkStyle = TextStyle(fontSize: 13, color: MColors.linkColor, decoration: TextDecoration.none);
    childs.add(WidgetSpan(
        child: Linkify(
            onOpen: _onOpen, text: topname, linkifiers: [FileLinkifier(topname, topkey)], linkStyle: linkStyle)));
    childs.add(TextSpan(text: " > ", style: TextStyle(color: MColors.pageRightPathColor)));

    for (int i = names.length - 1; i >= 0; i--) {
      var name = names[i];
      if (name.length > 11) name = name.substring(0, 4) + "..." + name.substring(name.length - 4);

      var link = WidgetSpan(
          child: Linkify(onOpen: _onOpen, text: name, linkifiers: [FileLinkifier(name, ids[i])], linkStyle: linkStyle));
      childs.add(link);
      if (i > 0) childs.add(TextSpan(text: " > ", style: TextStyle(color: MColors.pageRightPathColor)));
    }

    pageRightDirPath = TextSpan(style: TextStyle(fontSize: 13), children: childs);
    return true;
  }

  final Icon iconFolder = Icon(MIcons.folder, key: Key("folder"), size: 22, color: MColors.iconFolder);
  final Icon iconFile = Icon(MIcons.wenjian, key: Key("file"), size: 22, color: MColors.iconFile);
  final Icon iconImage = Icon(MIcons.file_img, key: Key("image"), size: 22, color: MColors.iconImage);
  final Icon iconVideo = Icon(MIcons.file_video, key: Key("video"), size: 22, color: MColors.iconVideo);
  final Icon iconAudio = Icon(MIcons.file_audio, key: Key("audio"), size: 22, color: MColors.iconAudio);
  final Icon iconTxt = Icon(MIcons.file_txt2, key: Key("txt"), size: 22, color: MColors.iconTxt);
  //刷新文件列表
  void _updateFileList(FileItem file, bool isUpdate) {
    List<String> selectKeys = [];
    if (isUpdate) {
      for (int f = 0; f < pageRightFileList0.length; f++) {
        if (pageRightFileList0[f].selected) {
          selectKeys.add(pageRightFileList0[f].key);
        }
      }
    }

    List<PageRightFileItem> list = [];
    for (int i = 0; i < file.children.length; i++) {
      var item = file.children[i];
      var model = PageRightFileItem.newPageRightFileItem(
          item.key,
          (item.isDir
              ? iconFolder
              : item.icon == "video"
                  ? iconVideo
                  : item.icon == "audio"
                      ? iconAudio
                      : item.icon == "image"
                          ? iconImage
                          : item.icon == "txt"
                              ? iconTxt
                              : iconFile),
          item.name,
          item.size,
          item.time,
          item.starred,
          item.isDir,
          item.icon);
      if (isUpdate) model.selected = selectKeys.contains(model.key);
      list.add(model);
    }
    pageRightFileList0 = list;
    _updateFileOrder();
  }

  void _updateFileOrder() {
    if (pageRightFileOrderBy == "文件名 从大到小") {
      pageRightFileList = pageRightFileList0.reversed.toList();
      return;
    }
    pageRightFileList = pageRightFileList0.toList();
    if (pageRightFileOrderBy == "文件名 从小到大") {
      //什么也不做，默认就是name asc
    } else if (pageRightFileOrderBy == "文件体积 从小到大") {
      pageRightFileList.sort((a, b) => a.fileSize.compareTo(b.fileSize));
    } else if (pageRightFileOrderBy == "文件体积 从大到小") {
      pageRightFileList.sort((a, b) => b.fileSize.compareTo(a.fileSize));
    } else if (pageRightFileOrderBy == "上传时间 从小到大") {
      pageRightFileList.sort((a, b) => a.fileTime.compareTo(b.fileTime));
    } else if (pageRightFileOrderBy == "上传时间 从大到小") {
      pageRightFileList.sort((a, b) => b.fileTime.compareTo(a.fileTime));
    }
  }
}
