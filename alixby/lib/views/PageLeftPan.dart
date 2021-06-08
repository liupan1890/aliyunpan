import 'package:alixby/states/UserState.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter_treeview/flutter_treeview.dart';

import '../states/Global.dart';
import '../states/PanTreeState.dart';
import 'package:provider/provider.dart';
import '../utils/MIcons.dart';

import '../utils/MColors.dart';
import 'package:hovering/hovering.dart';

import '../models/PageLeftRowItem.dart';
import 'package:flutter/material.dart';

class PageLeftPan extends StatefulWidget {
  @override
  _PageLeftPanState createState() => _PageLeftPanState();
}

class _PageLeftPanState extends State<PageLeftPan> with AutomaticKeepAliveClientMixin {
  final data = <PageLeftRowItem>[
    PageLeftRowItem.newPageLeftRowItem("trash", "rest", "回收站"),
    PageLeftRowItem.newPageLeftRowItem("favorite", "crown", "收藏夹"),
    PageLeftRowItem.newPageLeftRowItem("safebox", "rpasswoed", "保险箱"),
  ];

  void onPageLeftRowItemChanged(String key) {
    if (key == "safebox") {
      BotToast.showText(text: "此功能还在开发中");
      return;
    }
    Global.panTreeState.pageMenuSelectKey(key);
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    return Container(
        alignment: Alignment.topLeft,
        child: Column(
          children: [
            Container(
                padding: EdgeInsets.only(left: 26, right: 18, top: 9, bottom: 5),
                alignment: Alignment.centerLeft,
                child: Text(
                  context.watch<UserState>().userPanUsed,
                  style: TextStyle(fontSize: 13, color: MColors.pageLeftRowHeadColor),
                )),
            Container(
              alignment: Alignment.centerLeft,
              height: 32,
              padding: EdgeInsets.only(left: 12, right: 8),
              child: Row(
                children: [_buildItem(context, 0), _buildItem(context, 1), _buildItem(context, 2)],
              ),
            ),
            Container(height: 3),
            Expanded(child: _buildTree(context)),
          ],
        ));
  }

//136
  Widget _buildItem(BuildContext context, int index) {
    var selectKey = context.watch<PanTreeState>().selectKey;
    var item = data[index];
    return Container(
        alignment: Alignment.centerLeft,
        child: UnconstrainedBox(
            child: HoverContainer(
                height: 24,
                margin: EdgeInsets.only(left: 10),
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3.0),
                    color: selectKey == item.key ? MColors.pageLeftRowItemBGSelect : MColors.pageLeftBG),
                hoverDecoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3.0),
                    color: selectKey == item.key ? MColors.pageLeftRowItemBGSelect : MColors.pageLeftRowItemBGHover),
                child: InkWell(
                    onTap: () => onPageLeftRowItemChanged(item.key),
                    child: Container(
                        height: 24,
                        padding: EdgeInsets.only(left: 3, right: 3),
                        child: Row(mainAxisSize: MainAxisSize.max, children: [
                          Icon(MIcons.Get(item.icon),
                              size: 20,
                              color: selectKey == item.key
                                  ? MColors.userNavMenuIconHover
                                  : MColors.pageLeftRowItemIconColor),
                          Padding(padding: EdgeInsets.only(left: 4)),
                          Text(
                            item.title,
                            style: TextStyle(
                                color: selectKey == item.key
                                    ? MColors.userNavMenuIconHover
                                    : MColors.pageLeftRowItemColor),
                          )
                        ]))))));
  }

  @override
  bool get wantKeepAlive => true;
//下面是tree-------------------------------------------------------

  // ignore: slash_for_doc_comments
  /**
   * 注意这里需要修改tree_node.dart 259行,增加UnconstrainedBox去除整行大小
   *            Expanded(
                    child: UnconstrainedBox(
                  alignment: Alignment.centerLeft,
                  child: _tappable,
                )),

   */
  _expandNodeHandler(String key, bool expanded) {
    Global.panTreeState.pageExpandedNode(key, expanded);
  }

  _onNodeTap(String key) {
    Global.panTreeState.pageSelectNode(key, true);
  }

  final verticalScroll = ScrollController();
  final horizontalScroll = ScrollController();
  final GlobalKey treeConKey = GlobalKey();
  Widget _buildTree(BuildContext context) {
    return Container(
        key: treeConKey,
        alignment: Alignment.topLeft,
        child: Scrollbar(
          controller: verticalScroll,
          isAlwaysShown: true,
          hoverThickness: 9,
          thickness: 9,
          showTrackOnHover: true,
          child: SingleChildScrollView(
              controller: verticalScroll,
              scrollDirection: Axis.vertical,
              physics: BouncingScrollPhysics(),
              child: Container(
                  //color: Colors.blue,
                  alignment: Alignment.topLeft,
                  padding: EdgeInsets.only(bottom: 12),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(
                        child: Container(
                            alignment: Alignment.topLeft,
                            child: SingleChildScrollView(
                                controller: horizontalScroll,
                                scrollDirection: Axis.horizontal,
                                physics: BouncingScrollPhysics(),
                                child: Container(
                                    //color: Colors.red,
                                    alignment: Alignment.topLeft,
                                    width: context.watch<PanTreeState>().width,
                                    padding: EdgeInsets.only(bottom: 12),
                                    child: TreeView(
                                        shrinkWrap: true,
                                        primary: true,
                                        controller: context.watch<PanTreeState>().treeController,
                                        physics: BouncingScrollPhysics(),
                                        allowParentSelect: true,
                                        supportParentDoubleTap: true,
                                        onExpansionChanged: _expandNodeHandler,
                                        onNodeTap: _onNodeTap,
                                        nodeBuilder: _builderTreeNode,
                                        theme: TreeViewTheme(
                                          expanderTheme: ExpanderThemeData(
                                            type: ExpanderType.caret,
                                            modifier: ExpanderModifier.none,
                                            position: ExpanderPosition.start,
                                            color: MColors.userNavColor,
                                            size: 20,
                                          ),
                                          labelStyle: TextStyle(fontSize: 16, fontWeight: FontWeight.normal),
                                          parentLabelStyle: TextStyle(fontSize: 16, fontWeight: FontWeight.normal),
                                          iconTheme: IconThemeData(size: 18, color: MColors.pageLeftRowItemIconColor),
                                          colorScheme: ColorScheme.light().copyWith(primary: Colors.transparent),
                                          expandSpeed: Duration(milliseconds: 100),
                                        )))))),
                    Container(width: 16, height: 300),
                  ]))),
        ));
  }

  Widget _builderTreeNode(BuildContext context, Node node) {
    DirNode? dir = node.data;
    if (dir != null) {
      return Global.panTreeState.selectKey == node.key ? dir.widgetSelect : dir.widget;
    } else {
      return Container();
    }
  }
}
