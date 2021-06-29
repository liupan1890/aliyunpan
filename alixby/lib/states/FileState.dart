import 'package:alixby/models/FileItem.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/utils/StringUtils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';

import 'PanData.dart';

class FileState extends ChangeNotifier {
  FileState();

  //右侧顶部的 文件夹路径导航
  InlineSpan pageRightDirPath = TextSpan(style: TextStyle(fontSize: 13, fontFamily: "opposans"), children: []);
  //右侧真正绑定显示的文件列表
  List<PageRightFileItem> pageRightFileList = [];
  //基准的文件列表，用来生成排序后的文件列表
  List<PageRightFileItem> pageRightFileList0 = [];
  //排序方式
  String pageRightFileOrderBy = "文件名 从小到大";
  //绑定显示的 选中文件数
  String get pageRightFileSelectedDes =>
      "选中 " + pageRightFileSelectedCount.toString() + " / " + pageRightFileList0.length.toString() + " 个";
  //当前选中的文件数
  int pageRightFileSelectedCount = 0;
  //当前正在显示的文件列表是属于哪一个文件夹
  String pageRightDirBox = "";
  String pageRightDirKey = "";
  String pageRightDirName = "";

  pageSetDir(String box, String fileid, String name) {
    pageRightDirBox = box;
    pageRightDirKey = fileid;
    pageRightDirName = name;
  }

  //最后一次点击的文件key，shift多选时用到
  String pageRightLastClickKey = "";
  //当前正在显示的文件列表是属于哪一个页面（file/trash/favorite/safebox/xiangce）顶部菜单关联显示用到
  String get getPageName {
    var key = pageRightDirKey;
    if (key == "trash" || key == "favorite" || key == "safebox" || key == "xiangce")
      return key;
    else
      return "file";
  }

  //页面调用，更改排序方式
  pageChangeOrderBy(String order) {
    FileItem? file = PanData.getFileItem(pageRightDirBox, pageRightDirKey);
    if (file != null) {
      pageRightFileOrderBy = order;
      _updateFileOrder();
      notifyListeners();
    }
  }

  //网络回调更新子文件列表
  notifyFileListChanged(String box, String loadKey) {
    if (pageRightDirBox == box && pageRightDirKey == loadKey) {
      FileItem? file = PanData.getFileItem(pageRightDirBox, pageRightDirKey);
      if (file != null) {
        _updateFileList(file, true);
        notifyListeners();
      }
    }
  }

  //页面调用，文件树操作选择文件夹时触发
  pageSelectNode(String box, String key) {
    FileItem? file = PanData.getFileItem(box, key);
    if (file != null) {
      bool isSame = pageRightDirKey == key;
      pageSetDir(file.box, file.key, file.name);

      if (isSame == false) _updateFilePath(file);
      _updateFileList(file, isSame);
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
    pageRightDirBox = "";
    pageRightDirKey = "";
    pageRightDirName = "";
    pageRightLastClickKey = "";
    pageRightDirPath = TextSpan(style: TextStyle(fontSize: 13, fontFamily: "opposans"), children: []);
    notifyListeners();
  }

  double pageRefreshTime = 0;
  //开始定时刷新下载列表
  runTimer() {
    Future.delayed(Duration(milliseconds: 1000), () {
      refreshPanByTimer(true).then((v) {
        runTimer(); //循环调用
      });
    });
  }

  //触发拉取数据
  Future<bool> refreshPanByTimer(bool isTimer) async {
    try {
      if (isTimer) {
        if (Global.userState.userNavPageIndex != Global.getTreeState(pageRightDirBox).boxindex) return false;
        if (!Global.userState.isLogin) return false;
        double subtime = DateTime.now().millisecondsSinceEpoch / 1000 - pageRefreshTime; //相差几秒
        if (pageRightFileList0.length >= 100) {
          return false; //文件太多不自动刷新
        }
        if (getPageName == 'file' && subtime < 60) {
          return false; //文件列表，60秒刷新一次
        } else if (getPageName == 'trash' && subtime < 60) {
          return false; //回收站60秒刷新一次
        } else if (getPageName == 'favorite' && subtime < 60) {
          return false; //收藏，60秒刷新一次
        } else if (getPageName == 'xiangce' && subtime < 60) {
          return false; //相册，60秒刷新一次
        } else if (getPageName == "safebox" && subtime < 60) {
          return false; //保险箱，60秒刷新一次
        }
      }
      Global.getTreeState(pageRightDirBox).pageRefreshNode();
      pageRefreshTime = DateTime.now().millisecondsSinceEpoch / 1000;
      return true;
    } catch (e) {
      return false;
    }
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

  //返回所有的图片文件的filelist
  List<PageRightFileItem> getImageFiles() {
    List<PageRightFileItem> filelist = [];
    for (int f = 0; f < pageRightFileList0.length; f++) {
      if (pageRightFileList0[f].filetype == "image") filelist.add(pageRightFileList0[f]);
    }
    filelist.sort((a, b) => StringUtils.sortNumber1(a.title, b.title));

    List<PageRightFileItem> selectKeys = [];
    for (int i = 0; i < filelist.length; i++) {
      selectKeys.add(filelist[i]);
    }
    return selectKeys;
  }

  //返回选中文件的父文件夹的完整路径（下载用）
  String getSelectedFileParentPath() {
    List<String> names = [];

    var pid = pageRightDirKey;
    while (true) {
      if (pid == "root") break; //成功到顶
      var find = PanData.getFileItem(pageRightDirBox, pid);
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

  static _onOpen(String box, String key) {
    Global.getTreeState(box).pageSelectNode(box, key, false);
  }

  //刷新顶部文件路径导航
  bool _updateFilePath(FileItem file) {
    List<String> names = [];
    List<String> ids = [];
    List<String> boxs = [];

    var topbox = file.box;
    var topkey = file.key;
    var topname = file.name;

    if (topbox == "sbox") {
      topkey = "root";
      topname = "保险箱";
    } else if (topbox == "xiangce") {
      topkey = "root";
      topname = "相册";
    } else if (topbox == "box" && topkey != "trash" && topkey != "favorite") {
      topkey = "root";
      topname = "根目录";
    }

    var pid = file.parentkey;
    if (pid != "") {
      //root时 pid==""
      names.add(file.name);
      ids.add(file.key);
      boxs.add(file.box);
      while (true) {
        if (pid == "root") break; //成功到顶
        var find = PanData.getFileItem(file.box, pid);
        if (find == null) return false; //没有找到
        names.add(find.name);
        ids.add(find.key);
        boxs.add(file.box);
        pid = find.parentkey;
      }
    }
    List<InlineSpan> childs = [];
    var linkStyle =
        TextStyle(fontSize: 13, color: MColors.linkColor, decoration: TextDecoration.none, fontFamily: "opposans");
    childs.add(WidgetSpan(
        child: Linkify(
            onOpen: (v) => _onOpen(topbox, topkey),
            text: topname,
            linkifiers: [FileLinkifier(topname, topkey, topbox)],
            linkStyle: linkStyle)));
    childs.add(TextSpan(text: " > ", style: TextStyle(color: MColors.pageRightPathColor, fontFamily: "opposans")));

    for (int i = names.length - 1; i >= 0; i--) {
      var name = names[i];
      var box = boxs[i];
      var fileid = ids[i];

      if (name.length > 15) name = name.substring(0, 6) + "..." + name.substring(name.length - 6);

      var link = WidgetSpan(
          child: Linkify(
              onOpen: (v) => _onOpen(box, fileid),
              text: name,
              linkifiers: [FileLinkifier(name, fileid, box)],
              linkStyle: linkStyle));
      childs.add(link);
      if (i > 0)
        childs.add(TextSpan(text: " > ", style: TextStyle(color: MColors.pageRightPathColor, fontFamily: "opposans")));
    }

    pageRightDirPath = TextSpan(style: TextStyle(fontSize: 13, fontFamily: "opposans"), children: childs);
    return true;
  }

  final Icon iconFolder = Icon(MIcons.folder, key: Key("folder"), size: 22, color: MColors.iconFolder);
  final Icon iconFile = Icon(MIcons.wenjian, key: Key("file"), size: 22, color: MColors.iconFile);
  final Icon iconImage = Icon(MIcons.file_img, key: Key("image"), size: 22, color: MColors.iconImage);
  final Icon iconVideo = Icon(MIcons.file_video, key: Key("video"), size: 22, color: MColors.iconVideo);
  final Icon iconAudio = Icon(MIcons.file_audio, key: Key("audio"), size: 22, color: MColors.iconAudio);
  final Icon iconZip = Icon(MIcons.file_zip, key: Key("zip"), size: 22, color: MColors.iconZip);
  final Icon iconTxt = Icon(MIcons.file_txt2, key: Key("txt"), size: 22, color: MColors.iconTxt);
  final Icon iconWeiFa = Icon(MIcons.weifa, key: Key("weifa"), size: 22, color: MColors.iconWeiFa);
  //刷新文件列表
  void _updateFileList(FileItem file, bool isSame) {
    List<String> selectKeys = [];
    if (isSame) {
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
          item.box,
          item.key,
          (item.isWeiFa
              ? iconWeiFa
              : item.isDir
                  ? iconFolder
                  : item.icon == "video"
                      ? iconVideo
                      : item.icon == "audio"
                          ? iconAudio
                          : item.icon == "image"
                              ? iconImage
                              : item.icon == "txt"
                                  ? iconTxt
                                  : item.icon == "zip"
                                      ? iconZip
                                      : iconFile),
          item.name,
          item.size,
          item.time,
          item.starred,
          item.isDir,
          item.icon);
      if (isSame) model.selected = selectKeys.contains(model.key);
      list.add(model);
    }
    pageRightFileList0 = list;
    pageRightFileSelectedCount = 0;
    for (int g = 0; g < pageRightFileList0.length; g++) {
      if (pageRightFileList0[g].selected) {
        pageRightFileSelectedCount++;
      }
    }

    _updateFileOrder();
  }

  void _updateFileOrder() {
    pageRightFileList = [];
    List<PageRightFileItem> filelist = [];
    for (int f = 0; f < pageRightFileList0.length; f++) {
      if (pageRightFileList0[f].isDir)
        pageRightFileList.add(pageRightFileList0[f]);
      else
        filelist.add(pageRightFileList0[f]);
    }

    if (pageRightFileOrderBy == "文件名 从大到小") {
      pageRightFileList.sort((a, b) => StringUtils.sortNumber1(b.title, a.title));
      filelist.sort((a, b) => StringUtils.sortNumber1(b.title, a.title));
    } else if (pageRightFileOrderBy == "文件名 从小到大") {
      pageRightFileList.sort((a, b) => StringUtils.sortNumber1(a.title, b.title));
      filelist.sort((a, b) => StringUtils.sortNumber1(a.title, b.title));
    } else if (pageRightFileOrderBy == "文件体积 从小到大") {
      pageRightFileList.sort((a, b) => a.fileSize.compareTo(b.fileSize));
      filelist.sort((a, b) => a.fileSize.compareTo(b.fileSize));
    } else if (pageRightFileOrderBy == "文件体积 从大到小") {
      pageRightFileList.sort((a, b) => b.fileSize.compareTo(a.fileSize));
      filelist.sort((a, b) => b.fileSize.compareTo(a.fileSize));
    } else if (pageRightFileOrderBy == "上传时间 从小到大") {
      pageRightFileList.sort((a, b) => a.fileTime.compareTo(b.fileTime));
      filelist.sort((a, b) => a.fileTime.compareTo(b.fileTime));
    } else if (pageRightFileOrderBy == "上传时间 从大到小") {
      pageRightFileList.sort((a, b) => b.fileTime.compareTo(a.fileTime));
      filelist.sort((a, b) => b.fileTime.compareTo(a.fileTime));
    } else if (pageRightFileOrderBy == "文件类型") {
      pageRightFileList.sort((a, b) => StringUtils.sortNumber1(a.title, b.title));
      filelist.sort((a, b) => StringUtils.sortNumber1(a.title, b.title));
      filelist.sort((a, b) => a.fileext.compareTo(b.fileext));
    }
    pageRightFileList.addAll(filelist);
  }
}
