import 'package:alixby/api/Linker.dart';
import 'package:alixby/models/PageRightMiaoChuanItem.dart';
import 'package:flutter/material.dart';

class PageRssMiaoChuanState extends ChangeNotifier {
  PageRssMiaoChuanState();

  List<PageRightMiaoChuanItem> pageRightMiaoChuanList = [];

  //页面调用，选中文件
  pageSelectLink(String key) {
    int total = pageRightMiaoChuanList.length;
    for (int i = 0; i < total; i++) {
      if (pageRightMiaoChuanList[i].link == key) {
        pageRightMiaoChuanList[i].selected = true;
      } else if (pageRightMiaoChuanList[i].selected) {
        pageRightMiaoChuanList[i].selected = false; //其他的全部取消选中
      }
    }
    notifyListeners();
  }

  refreshLink() {
    Linker.goLinkList().then((filelist) {
      pageRightMiaoChuanList = filelist;
      pageRightMiaoChuanList.sort((a, b) => b.logTime - a.logTime); //从大到小
      notifyListeners();
    });
  }
}
