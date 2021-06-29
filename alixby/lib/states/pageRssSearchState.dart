import 'package:alixby/api/Linker.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/states/Global.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';

class PageRssSearchState extends ChangeNotifier {
  PageRssSearchState();

  List<PageRightFileItem> pageRightSearchList = [];
  TextEditingController searchcontroller = TextEditingController();
  Widget navBtns = Row(crossAxisAlignment: CrossAxisAlignment.center, children: []);

  int pageIndex = 0;
  int pageCount = 0;
  int fileCount = 0;

  //绑定显示的 选中文件数
  String get pageRightFileSelectedDes =>
      "选中 " + pageRightFileSelectedCount.toString() + " / " + pageRightSearchList.length.toString() + " 个";
  //当前选中的文件数
  int pageRightFileSelectedCount = 0;
  //最后一次点击的文件key，shift多选时用到
  String pageRightLastClickKey = "";
  //页面调用，选中文件
  pageSelectFile(String key) {
    int total = pageRightSearchList.length;
    int selected = 0;
    if (key == "all") {
      pageRightLastClickKey = "";
      bool istoselect = false;
      for (int i = 0; i < total; i++) {
        if (pageRightSearchList[i].selected) {
          istoselect = true;
          selected++;
        }
      }

      if (istoselect && selected == total) {
        //已经是全选了，执行反选操作
        selected = 0;
        for (int i = 0; i < total; i++) {
          pageRightSearchList[i].selected = false;
        }
      } else {
        //一个也没选中 或者 部分文件被选中，执行全选操作
        selected = total;
        for (int i = 0; i < total; i++) {
          pageRightSearchList[i].selected = true;
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
          if (pageRightSearchList[i].key == pageRightLastClickKey) {
            start = i;
          }
          if (pageRightSearchList[i].key == key) {
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
            pageRightSearchList[n].selected = true;
          }
          for (int j = 0; j < total; j++) {
            if (pageRightSearchList[j].selected) selected++;
          }
          isHandle = true;
        }
      }

      if (isHandle == false && isCtrl) {
        selected = 0;
        for (int i = 0; i < total; i++) {
          if (pageRightSearchList[i].key == key) {
            pageRightSearchList[i].selected = !pageRightSearchList[i].selected;
            break;
          }
        }
        for (int j = 0; j < total; j++) {
          if (pageRightSearchList[j].selected) selected++;
        }
        isHandle = true;
      }
      if (isHandle == false) {
        selected = 0;
        int isSomeSelect = 0; //是否已经多选，如果已经多选，最后应该变成单选key这一个
        for (int i = 0; i < total; i++) {
          if (pageRightSearchList[i].selected) isSomeSelect++;
          if (isSomeSelect > 1) break; //说明有多个选中的
        }

        for (int i = 0; i < total; i++) {
          if (pageRightSearchList[i].key == key) {
            //如果有多个文件被选中 || 反选
            pageRightSearchList[i].selected = isSomeSelect > 1 || !pageRightSearchList[i].selected;
            if (pageRightSearchList[i].selected) {
              selected = 1;
            }
          } else if (pageRightSearchList[i].selected) {
            pageRightSearchList[i].selected = false; //其他的全部取消选中
          }
        }
      }
      pageRightLastClickKey = key;
    }
    pageRightFileSelectedCount = selected;
    _updateNavBtns();
    notifyListeners();
  }

  pageSearch(int pageindex, Function? stopLoading) {
    var txt = searchcontroller.text;
    if (pageindex < 1) pageindex = 1;
    if (pageindex > 9) pageindex = 9;
    Linker.goLinkSearch(txt, pageindex).then((value) {
      _updateFileList(value.searchlist);
      pageIndex = value.pageIndex;
      pageCount = value.pageCount;
      fileCount = value.fileCount;
      _updateNavBtns();
      verticalScroll.animateTo(0, duration: Duration(milliseconds: 200), curve: Curves.easeOut);
      notifyListeners();

      if (stopLoading != null) stopLoading();
      if (fileCount == 0) {
        BotToast.showText(text: "搜不到结果哦，换个关键字试试？");
      }
    });
  }

  void _updateFileList(List<PageRightFileItem> newlist) {
    List<String> selectKeys = [];

    for (int f = 0; f < pageRightSearchList.length; f++) {
      if (pageRightSearchList[f].selected) {
        selectKeys.add(pageRightSearchList[f].key);
      }
    }

    for (int i = 0; i < newlist.length; i++) {
      var item = newlist[i];
      item.selected = selectKeys.contains(item.key);
    }
    pageRightSearchList = newlist;
    pageRightFileSelectedCount = 0;
    for (int g = 0; g < pageRightSearchList.length; g++) {
      if (pageRightSearchList[g].selected) {
        pageRightFileSelectedCount++;
      }
    }
  }

  //返回所有选中的文件的filelist
  List<PageRightFileItem> getSelectedFiles() {
    List<PageRightFileItem> selectKeys = [];
    for (int f = 0; f < pageRightSearchList.length; f++) {
      if (pageRightSearchList[f].selected) selectKeys.add(pageRightSearchList[f]);
    }
    return selectKeys;
  }

  final verticalScroll = ScrollController();
  _updateNavBtns() {
    List<Widget> list = [];
    if (pageCount > 0) {
      list.add(Text("结果："));
      for (var i = 1; i <= 9 && i <= pageCount; i++) {
        if (i == pageIndex) {
          list.add(OutlinedButton(
              child: Text(i.toString()),
              onPressed: () {
                Global.pageRssSearchState.pageSearch(i, null);
              }));
        } else {
          list.add(TextButton(
              child: Text(i.toString()),
              onPressed: () {
                Global.pageRssSearchState.pageSearch(i, null);
              }));
        }
        list.add(Padding(padding: EdgeInsets.only(left: 4)));
      }
      list.add(Padding(padding: EdgeInsets.only(left: 12)));
    }
    //list.add(Text(fileCount.toString()));
    navBtns =
        Row(mainAxisAlignment: MainAxisAlignment.end, crossAxisAlignment: CrossAxisAlignment.center, children: list);
  }
}
