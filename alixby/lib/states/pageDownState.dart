import 'package:alixby/api/Downloader.dart';
import 'package:alixby/api/Uploader.dart';
import 'package:alixby/models/PageRightDownItem.dart';
import 'package:alixby/states/Global.dart';
import 'package:flutter/material.dart';

class PageDownState extends ChangeNotifier {
  PageDownState();
  //右侧页面当前导航位置 downing downed uploading upload
  String getPageName = "downing";
  List<PageRightDownItem> pageRightDownList = [];
  int pageRightDownListCount = 0;
  double pageRefreshTime = DateTime.now().millisecondsSinceEpoch / 1000;
  String get pageRightDownDes =>
      "共 " +
      pageRightDownListCount.toString() +
      " 个 " +
      (getPageName.contains("ing") ? (pageRightDownListCount > 300 ? "(只显示前300条)" : "") : "(只显示10日内的)");
  String pageRightLastClickKey = "";
  pageChange(String page) {
    getPageName = page;
    pageRefreshTime = 0;
    refreshDownByTimer(false);
    notifyListeners();
  }

  //页面调用，选中文件
  pageSelectFile(String key) {
    pageRightLastClickKey = key;
    int total = pageRightDownList.length;
    for (int i = 0; i < total; i++) {
      if (pageRightDownList[i].key == key) {
        pageRightDownList[i].selected = true;
      } else if (pageRightDownList[i].selected) {
        pageRightDownList[i].selected = false; //其他的全部取消选中
      }
    }
    notifyListeners();
  }

//开始定时刷新下载列表
  runTimer() {
    Future.delayed(Duration(milliseconds: 1000), () {
      refreshDownByTimer(true).then((v) {
        runTimer(); //循环调用
      });
    });
  }

  //触发拉取数据
  Future<bool> refreshDownByTimer(bool isTimer) async {
    try {
      if (isTimer) {
        if (Global.userState.userNavPageIndex != 2) return false;
        if (!Global.userState.isLogin) return false;
        double subtime = DateTime.now().millisecondsSinceEpoch / 1000 - pageRefreshTime; //相差几秒
        if (getPageName == 'downing') {
          //正在下载，1秒刷新一次
        } else if (getPageName == 'downed' && subtime < 4) {
          return false; //已下载4秒刷新一次
        } else if (getPageName == 'uploading') {
          //正在上传，1秒刷新一次
        } else if (getPageName == 'upload' && subtime < 4) {
          return false; //已上传4秒刷新一次
        }
      }
      var dt1 = DateTime.now().millisecondsSinceEpoch;
      print('refreshDownByTimer ' + dt1.toString());
      var downdata = PageRightDownModel();
      //联网加载
      if (getPageName == 'downing') {
        downdata = await Downloader.goDowningList();
      } else if (getPageName == 'downed') {
        downdata = await Downloader.goDownedList();
      } else if (getPageName == 'uploading') {
        downdata = await Uploader.goUploadingList();
      } else if (getPageName == 'upload') {
        downdata = await Uploader.goUploadList();
      }
      if (downdata.isError == false) {
        pageRightDownListCount = downdata.filecount;
        pageRightDownList = downdata.filelist;
        pageRefreshTime = DateTime.now().millisecondsSinceEpoch / 1000;
        pageSelectFile(pageRightLastClickKey);
        notifyListeners();
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
