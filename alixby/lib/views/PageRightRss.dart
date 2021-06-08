import 'package:alixby/states/UserState.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/views/PageRightRssLiXian.dart';
import 'package:alixby/views/PageRightRssMiaoChuan.dart';
import 'package:alixby/views/PageRightRssSearch.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'PageRightRssHelp.dart';

class PageRightRss extends StatefulWidget {
  @override
  _PageRightRssState createState() => _PageRightRssState();
}

class _PageRightRssState extends State<PageRightRss> with AutomaticKeepAliveClientMixin {
  @override
  void initState() {
    super.initState();
    print('_PageRightRssState initState');
  }

  final PageController _pageController = PageController(initialPage: 0, keepPage: true);
  final bodyList = [PageRightRssMiaoChuan(), PageRightRssSearch(), PageRightRssLiXian(), PageRightRssHelp()];
  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    final page = Container(
        key: Key("pagerightrss"),
        decoration: BoxDecoration(color: MColors.pageRightBG),
        child: Container(
            //decoration: BoxDecoration(color: Colors.orange[50]),
            child: PageView(
          physics: NeverScrollableScrollPhysics(),
          controller: _pageController,
          scrollDirection: Axis.horizontal,
          pageSnapping: true,
          children: bodyList,
        )));
    var pageindex = context.watch<UserState>().userNavPageRssIndex;
    if (_pageController.hasClients) {
      if (pageindex != _pageController.page!.floor()) {
        _pageController.jumpToPage(pageindex);
      }
    }
    return page;
  }

  @override
  bool get wantKeepAlive => true;
}
