import 'package:alixby/states/TreeState.dart';
import 'package:alixby/states/UserState.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter_treeview/flutter_treeview.dart';

import 'package:alixby/states/Global.dart';
import 'package:provider/provider.dart';
import 'package:alixby/utils/MIcons.dart';

import 'package:alixby/utils/MColors.dart';
import 'package:hovering/hovering.dart';

import 'package:alixby/models/PageLeftRowItem.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class PageLeftPan extends StatefulWidget {
  PageLeftPan(this.box) : super();
  String box = "";
  @override
  _PageLeftPanState createState() => _PageLeftPanState();
}

class _PageLeftPanState extends State<PageLeftPan> with AutomaticKeepAliveClientMixin {
  var data = <PageLeftRowItem>[
    PageLeftRowItem.newPageLeftRowItem("trash", "rest", "网盘回收站"),
    PageLeftRowItem.newPageLeftRowItem("favorite", "crown", "网盘收藏夹"),
  ];

  void onPageLeftRowItemChanged(String key) {
    if (key == 'safebox') {
      BotToast.showText(text: "此功能还在开发中");
      return;
    }
    Global.getTreeState(widget.box).pageMenuSelectKey(key);
  }

  @override
  void initState() {
    super.initState();
    if (widget.box == "box") {
      data = <PageLeftRowItem>[
        PageLeftRowItem.newPageLeftRowItem("trash", "rest", "网盘回收站"),
        PageLeftRowItem.newPageLeftRowItem("favorite", "crown", "网盘收藏夹"),
      ];
    } else if (widget.box == "xiangce") {
      data = <PageLeftRowItem>[
        PageLeftRowItem.newPageLeftRowItem("trash", "rest", "相册回收站"),
        PageLeftRowItem.newPageLeftRowItem("favorite", "crown", "相册收藏夹"),
      ];
    }
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    var selectKey = "";
    if (widget.box == "box") {
      selectKey = context.watch<PanTreeState>().selectKey;
    } else if (widget.box == "xiangce") {
      selectKey = context.watch<XiangCeTreeState>().selectKey;
    }
    var userPanUsed = context.watch<UserState>().userPanUsed;

    List<Widget> menulist = [];
    for (var i = 0; i < data.length; i++) {
      menulist.add(_buildItem(context, i, selectKey));
    }

    return Container(
        alignment: Alignment.topLeft,
        child: Column(
          children: [
            Container(
                padding: EdgeInsets.only(left: 26, right: 18, top: 9, bottom: 5),
                alignment: Alignment.centerLeft,
                child: Text(
                  userPanUsed,
                  style: TextStyle(fontSize: 13, color: MColors.pageLeftRowHeadColor, fontFamily: "opposans"),
                )),
            Container(
              alignment: Alignment.centerLeft,
              height: 32,
              padding: EdgeInsets.only(left: 12, right: 8),
              child: Row(
                children: menulist,
              ),
            ),
            Container(height: 3),
            Expanded(child: _buildTree(context)),
          ],
        ));
  }

//136
  Widget _buildItem(BuildContext context, int index, String selectKey) {
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
                                color:
                                    selectKey == item.key ? MColors.userNavMenuIconHover : MColors.pageLeftRowItemColor,
                                fontFamily: "opposans"),
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
    Global.getTreeState(widget.box).pageExpandedNode(key, expanded);
  }

  _onNodeTap(String key) {
    Global.getTreeState(widget.box).pageSelectNode(widget.box, key, true);
  }

  @override
  void dispose() {
    verticalScroll.dispose();
    hengScroll.dispose();
    super.dispose();
  }

  final verticalScroll = ScrollController();
  final hengScroll = ScrollController();
  final GlobalKey treeConKey = GlobalKey();
  Widget _buildTree(BuildContext context) {
    var treewidth = 0.0;
    if (widget.box == "box") {
      treewidth = context.watch<PanTreeState>().width;
    } else if (widget.box == "xiangce") {
      treewidth = context.watch<XiangCeTreeState>().width;
    }
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
                                scrollDirection: Axis.horizontal,
                                controller: hengScroll,
                                physics: BouncingScrollPhysics(),
                                dragStartBehavior: DragStartBehavior.down,
                                child: Container(
                                    //color: Colors.red,
                                    alignment: Alignment.topLeft,
                                    width: treewidth,
                                    padding: EdgeInsets.only(bottom: 12),
                                    child: TreeView(
                                        shrinkWrap: true,
                                        primary: true,
                                        controller: Global.getTreeState(widget.box).treeController,
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
                                          labelStyle: TextStyle(
                                              fontSize: 16, fontWeight: FontWeight.normal, fontFamily: "opposans"),
                                          parentLabelStyle: TextStyle(
                                              fontSize: 16, fontWeight: FontWeight.normal, fontFamily: "opposans"),
                                          iconTheme: IconThemeData(size: 18, color: MColors.pageLeftRowItemIconColor),
                                          colorScheme: ColorScheme.light().copyWith(primary: Colors.transparent),
                                          expandSpeed: Duration(milliseconds: 100),
                                        )))))),
                    Container(width: 16, height: 1),
                  ]))),
        ));
  }

  Widget _builderTreeNode(BuildContext context, Node node) {
    DirNode? dir = node.data;
    if (dir != null) {
      return Global.getTreeState(widget.box).selectKey == node.key ? dir.widgetSelect : dir.widget;
    } else {
      return Container();
    }
  }
}
