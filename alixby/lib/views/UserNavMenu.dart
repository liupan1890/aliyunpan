import 'package:alixby/states/Global.dart';
import 'package:alixby/states/UserState.dart';

import 'package:alixby/utils/MIcons.dart';
import 'package:hovering/hovering.dart';

import 'package:alixby/pagepan/PageLeftPan.dart';

import 'package:alixby/utils/MColors.dart';

import 'package:alixby/pagerss/PageLeftRss.dart';
import 'package:alixby/pagedown/PageLeftDown.dart';
import 'package:alixby/views/PageLeftSetting.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class UserNavMenu extends StatefulWidget {
  @override
  _UserNavMenuState createState() => _UserNavMenuState();
}

class _UserNavMenuState extends State<UserNavMenu> {
  final bodyList = [PageLeftRss(), PageLeftPan('box'), PageLeftPan('xiangce'), PageLeftDown(), PageLeftSetting()];

  void onTap(int index) {
    Global.userState.updatePageIndex(index);
  }

  Widget _buildMenu(int page, int index, IconData icondata, String tip) {
    return UnconstrainedBox(
        child: Container(
            width: 52,
            height: 40,
            padding: EdgeInsets.only(top: 6, bottom: 6),
            child: HoverContainer(
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3.0),
                    color: page == index ? MColors.userNavMenuBGHover : MColors.pageLeftBG),
                hoverDecoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3.0),
                    color: page == index ? MColors.userNavMenuBGHover : MColors.userNavMenuBG),
                child: IconButton(
                  iconSize: 22,
                  padding: EdgeInsets.all(0),
                  color: page == index ? MColors.userNavMenuIconHover : MColors.userNavMenuIcon,
                  icon: Icon(icondata),
                  onPressed: () => onTap(index),
                  tooltip: tip,
                ))));
  }

  @override
  Widget build(BuildContext context) {
    var pageindex = context.watch<UserState>().userNavPageIndex;
    return Column(children: [
      Container(
          alignment: Alignment.topLeft,
          child: SizedBox(
              width: 290,
              child: Row(
                children: [
                  Padding(padding: EdgeInsets.only(left: 8)),
                  _buildMenu(pageindex, 0, MIcons.rss, "Rss"),
                  Expanded(child: Padding(padding: EdgeInsets.only(left: 8))),
                  _buildMenu(pageindex, 1, MIcons.ali, "云盘"),
                  Expanded(child: Padding(padding: EdgeInsets.only(left: 8))),
                  _buildMenu(pageindex, 2, MIcons.file_img, "相册"),
                  Expanded(child: Padding(padding: EdgeInsets.only(left: 8))),
                  _buildMenu(pageindex, 3, MIcons.download, "下载上传"),
                  Padding(padding: EdgeInsets.only(left: 8)),
                ],
              ))),
      Expanded(
          child: PageView(
        controller: Global.userState.pageController,
        onPageChanged: (i) {},
        children: bodyList,
        physics: NeverScrollableScrollPhysics(), // 禁止滑动
      ))
    ]);
  }
}
