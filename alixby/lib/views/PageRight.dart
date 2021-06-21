import 'package:alixby/states/Global.dart';
import 'package:alixby/states/UserState.dart';

import 'package:provider/provider.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:flutter/material.dart';
import 'package:alixby/pagerss/PageRightRss.dart';
import 'package:alixby/pagepan/PageRightPan.dart';
import 'package:alixby/pagedown/PageRightDown.dart';
import 'PageRightSetting.dart';

class PageRight extends StatefulWidget {
  @override
  _PageRightState createState() => _PageRightState();
}

class _PageRightState extends State<PageRight> {
  @override
  void initState() {
    super.initState();
  }

  final PageController _pageController = PageController(initialPage: 0, keepPage: true);
  final bodyList = [PageRightRss(), PageRightPan("box"), PageRightPan("xiangce"), PageRightDown(), PageRightSetting()];
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
          Global.shiftMac = event.isShiftPressed;
          Global.ctrlMac = event.isControlPressed || event.isMetaPressed;
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
