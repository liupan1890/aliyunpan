import 'package:alixby/api/AliFile.dart';
import 'package:alixby/states/PanData.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_treeview/flutter_treeview.dart';
import 'package:hovering/hovering.dart';

class MoveDialog extends StatefulWidget {
  // ignore: non_constant_identifier_names
  MoveDialog({Key? key, required this.parentid, required this.filelist}) : super(key: key);
  // ignore: non_constant_identifier_names
  String parentid = "";
  // ignore: non_constant_identifier_names
  List<String> filelist = [];

  @override
  _MoveDialogState createState() => _MoveDialogState();
}

class _MoveDialogState extends State<MoveDialog> {
  @override
  void initState() {
    super.initState();
    print("_MoveDialogState");
    pageExpandedNode("root", true);
  }

  static Node _makeNode(String parentkey, String key, String label, int leve, List<Node> children) {
    var dir = DirNode2(parentkey, key, label, leve);
    return Node(label: dir.label, key: dir.key, parent: true, data: dir, children: children);
  }

  static ScrollController verticalScroll = ScrollController();
  static TreeViewController treeController = TreeViewController(children: [_makeNode("", "root", "网盘目录树", 0, [])]);
  static String selectKey = "";
  static Map<String, bool> loading = {};
  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Center(
          child: Container(
        height: 500,
        width: 500,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          color: MColors.dialogBgColor,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            Container(
                alignment: Alignment.topRight,
                padding: EdgeInsets.only(top: 8, right: 8, bottom: 8),
                child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      child: Icon(MIcons.close, size: 18),
                      onTap: () => Navigator.of(context).pop('ok'),
                    ))),
            Container(child: Text("移动文件/文件夹", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
            Container(
                width: 440,
                height: 370,
                margin: EdgeInsets.only(top: 22),
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
                            alignment: Alignment.topLeft,
                            padding: EdgeInsets.only(bottom: 12),
                            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Container(
                                  //color: Colors.red[50],
                                  alignment: Alignment.topLeft,
                                  width: 424,
                                  padding: EdgeInsets.only(bottom: 12),
                                  child: TreeView(
                                    shrinkWrap: true,
                                    primary: true,
                                    controller: treeController,
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
                                    ),
                                  )),
                              Container(width: 16, height: 300),
                            ]))))),
            Container(
              width: 440,
              padding: EdgeInsets.only(top: 12),
              child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                Text("把选中的 " + widget.filelist.length.toString() + " 个文件"),
                Padding(padding: EdgeInsets.only(left: 24)),
                OutlinedButton(
                  onPressed: () => Navigator.of(context).pop('ok'),
                  child: Text("取消"),
                  style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
                ),
                Padding(padding: EdgeInsets.only(left: 24)),
                ElevatedButton(
                  onPressed: () {
                    if (widget.filelist.length > 0) {
                      var fcHide = Loading.showLoading();

                      AliFile.apiMoveBatch(widget.filelist, selectKey).then((value) {
                        fcHide();
                        PanData.loadFileList(widget.parentid, "move"); //触发联网加载
                        pageExpandedNode("root", true);
                        Navigator.of(context).pop('ok');
                        BotToast.showText(text: "成功移动" + value.toString() + "个文件");
                      });
                    }
                  },
                  child: Text("移动到此处"),
                  style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
                ),
              ]),
            ),
          ],
        ),
      )),
    );
  }

  _updateTree(TreeViewController tree) {
    treeController = tree;
    if (mounted) {
      setState(() {});
    }
  }

  //页面调用，点击文件树的一个文件夹时触发
  pageExpandedNode(String key, bool expanded) {
    Node? node = treeController.getNode(key);
    if (node != null) {
      selectKey = key;
      //选中并展开
      print((expanded ? 'expanded ' : 'close ') + key);
      Node node2 = node.copyWith(expanded: expanded);
      List<Node> updated = treeController.updateNode(key, node2);
      _updateTree(treeController.copyWith(children: updated, selectedKey: key));

      if (expanded == true) {
        if (!loading.containsKey(key) || loading[key] == false) {
          loading[key] = true;
          //是文件夹&&children子文件数==0&&要展开显示了
          //注意node.parent,当联网后发现是空文件夹，node.parent会变成false

          AliFile.apiDirList(key, node.label).then((loadData) {
            if (loadData.key == "error") return;
            var leve = node.data.leve + 1;
            //动态新增
            List<Node> children = [];
            var total = loadData.list.length;
            for (int i = 0; i < total; i++) {
              var m = loadData.list[i];
              if (m.isDir) children.add(_makeNode(m.parentkey, m.key, m.name, leve, []));
            }
            Node node2 = node.copyWith(expanded: true, parent: true, children: children); //注意这里更新了parent
            //更新并展开
            List<Node> updated = treeController.updateNode(key, node2);
            _updateTree(treeController.copyWith(children: updated, selectedKey: selectKey));
            loading[key] = false;
          });
        }
      }
    }
  }

  pageSelectNode(String key) {
    Node? node = treeController.getNode(key);
    if (node != null) {
      pageExpandedNode(node.key, !node.expanded);
    }
  }

  _expandNodeHandler(String key, bool expanded) {
    pageExpandedNode(key, expanded);
  }

  _onNodeTap(String key) {
    pageSelectNode(key);
  }

  Widget _builderTreeNode(BuildContext context, Node node) {
    DirNode2? dir = node.data;
    if (dir != null) {
      return selectKey == node.key ? dir.widgetSelect : dir.widget;
    } else {
      return Container();
    }
  }
}

class DirNode2 {
  DirNode2(this.parentkey, this.key, this.label, this.leve) {
    widget = Container(
        key: Key("pdt_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decoration,
                hoverDecoration: hoverDecoration,
                child: Container(
                    key: Key("pdt_rchc_" + key),
                    width: 400 - leve * 20,
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_rchcr_" + key), children: [
                      icon,
                      padding2,
                      Expanded(
                          child: Text(
                        label,
                        key: Key("pdt_rchcrt_" + key),
                        style: style,
                        overflow: TextOverflow.ellipsis,
                      ))
                    ])))));

    widgetSelect = Container(
        key: Key("pdt_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decorations,
                hoverDecoration: hoverDecorations,
                child: Container(
                    key: Key("pdt_rchc_" + key),
                    width: 400 - leve * 20,
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_rchcr_" + key), children: [
                      icons,
                      padding2,
                      Expanded(
                          child: Text(
                        label,
                        key: Key("pdt_rchcrt_" + key),
                        style: styles,
                        overflow: TextOverflow.ellipsis,
                      ))
                    ])))));
  }

  String label = "";
  String key = "";
  //父文件夹key
  String parentkey = "";
  //文件夹层级
  int leve = 0;

  Widget widget = Container();
  Widget widgetSelect = Container();

  var decoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG);
  var decorations = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGSelect);

  var hoverDecoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGHover);
  var hoverDecorations =
      BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGSelect);

  var padding = EdgeInsets.only(left: 3, right: 3);
  var padding2 = Padding(padding: EdgeInsets.only(left: 8));
  var icon = Icon(MIcons.folder, size: 20, color: MColors.iconFolder);
  var icons = Icon(MIcons.folder, size: 20, color: MColors.userNavMenuIconHover);
  var style = TextStyle(fontSize: 14, color: MColors.pageLeftRowItemColor);
  var styles = TextStyle(fontSize: 14, color: MColors.userNavMenuIconHover);
}
