import 'package:alixby/states/Global.dart';
import 'package:alixby/states/UserState.dart';

import 'package:provider/provider.dart';
import '../utils/MColors.dart';
import 'package:flutter/material.dart';
import 'PageRightRss.dart';
import 'PageRightPan.dart';
import 'PageRightDown.dart';
import 'PageRightSetting.dart';

class PageRight extends StatefulWidget {
  @override
  _PageRightState createState() => _PageRightState();
}

class _PageRightState extends State<PageRight> {
  @override
  void initState() {
    super.initState();
    print('_PageRightState initState');
  }

  final PageController _pageController = PageController(initialPage: 0, keepPage: true);
  final bodyList = [PageRightRss(), PageRightPan(), PageRightDown(), PageRightSetting()];
  final focusnode = FocusNode();
  @override
  Widget build(BuildContext context) {
    FocusScope.of(context).autofocus(focusnode);
    final page = RawKeyboardListener(
        focusNode: focusnode, // 焦点
        onKey: (RawKeyEvent event) {
          if (event.isShiftPressed) {
            Global.isShift = true;
          } else if (event.isControlPressed) {
            Global.isCtrl = true;
          }
        },
        child: Container(
            key: Key("pageright"),
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(color: MColors.pageRightBG),
            child: Container(
                //decoration: BoxDecoration(color: Colors.orange[50]),
                child: PageView(
              physics: NeverScrollableScrollPhysics(),
              controller: _pageController,
              scrollDirection: Axis.horizontal,
              pageSnapping: true,
              children: bodyList,
            ))));

    var pageindex = context.watch<UserState>().userNavPageIndex;
    if (_pageController.hasClients) {
      if (pageindex != _pageController.page!.floor()) {
        _pageController.animateToPage(pageindex, duration: Duration(milliseconds: 200), curve: Curves.easeOut);
      }
    }
    return page;
  }
}
