import 'package:alixby/api/AliFile.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagepan/UnrarBackDialog.dart';
import 'package:alixby/utils/SpinKitRing.dart';
import 'package:alixby/utils/StringUtils.dart';
import 'package:argon_buttons_flutter/argon_buttons_flutter.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_treeview/flutter_treeview.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class UnrarDialog extends StatefulWidget {
  // ignore: non_constant_identifier_names
  UnrarDialog({Key? key, required this.box, required this.fileid}) : super(key: key) {
    if (box == 'box')
      boxname = "网盘";
    else if (box == 'sbox')
      boxname = "保险箱";
    else if (box == 'xiangce') boxname = "相册";
  }
  // ignore: non_constant_identifier_names
  String box = "";
  String boxname = "";
  String fileid = "";

  @override
  _UnrarDialogState createState() => _UnrarDialogState();
}

class _UnrarDialogState extends State<UnrarDialog> {
  @override
  void initState() {
    super.initState();
    treeController = TreeViewController(children: [_makeNode("", "root", widget.boxname + "根目录", 0, [])]);
    pageExpandedNode("root", true);
  }

  static Node _makeNode(String parentkey, String key, String label, int leve, List<Node> children) {
    var dir = DirNode2(parentkey, key, label, leve);
    return Node(label: dir.label, key: dir.key, parent: true, data: dir, children: children);
  }

  final ScrollController verticalScroll = ScrollController();
  @override
  void dispose() {
    verticalScroll.dispose();
    super.dispose();
  }

  TreeViewController treeController = TreeViewController();
  String selectKey = "";
  Map<String, bool> loading = {};

  final TextEditingController controller = TextEditingController();

  void onSubmitted(BuildContext context) {}
  @override
  Widget build(BuildContext context) {
    return Material(
        type: MaterialType.transparency,
        child: MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaleFactor: double.parse(context.watch<SettingState>().setting.textScale)),
            child: DefaultTextStyle(
              //1.设置文本默认样式
              style: TextStyle(color: MColors.textColor, fontFamily: "opposans"),
              child: Center(
                  child: Container(
                height: 500,
                width: 520,
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
                              child: Icon(MIcons.close, size: 18, color: MColors.textColor),
                              onTap: () => Navigator.of(context).pop('ok'),
                            ))),
                    Container(
                        child: Text("在线解压缩",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        width: 480,
                        height: 370,
                        alignment: Alignment.topLeft,
                        decoration: BoxDecoration(
                            border: Border.all(width: 1, color: Colors.grey), borderRadius: BorderRadius.circular(3.0)),
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
                                      labelStyle: TextStyle(
                                          fontSize: 16, fontWeight: FontWeight.normal, fontFamily: "opposans"),
                                      parentLabelStyle: TextStyle(
                                          fontSize: 16, fontWeight: FontWeight.normal, fontFamily: "opposans"),
                                      iconTheme: IconThemeData(size: 18, color: MColors.pageLeftRowItemIconColor),
                                      colorScheme: ColorScheme.light().copyWith(primary: Colors.transparent),
                                      expandSpeed: Duration(milliseconds: 100),
                                    ),
                                  )),
                            ))),
                    Container(
                      width: 480,
                      padding: EdgeInsets.only(top: 12),
                      child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                        Expanded(
                            child: TextField(
                          controller: controller,
                          maxLines: 1,
                          autocorrect: false,
                          enableSuggestions: false,
                          style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                          cursorColor: MColors.inputBorderHover,
                          autofocus: false,
                          decoration: InputDecoration(
                            hintText: "解压密码。没有不填",
                            hintStyle: TextStyle(fontSize: 13, color: MColors.textColorGray, fontFamily: "opposans"),
                            contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                            focusedBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: MColors.inputBorderHover,
                                width: 1,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: MColors.inputBorderColor,
                                width: 1,
                              ),
                            ),
                          ),
                        )),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        OutlinedButton(
                          onPressed: () => Navigator.of(context).pop('ok'),
                          child: Text("取消"),
                          style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
                        ),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        ArgonButton(
                          height: 32,
                          width: 220,
                          minWidth: 220,
                          borderRadius: 3.0,
                          roundLoadingShape: false,
                          color: MColors.elevatedBtnBG,
                          child: Text(
                            "解压缩到选中的文件夹内",
                            style: TextStyle(color: MColors.elevatedBtnColor, fontFamily: "opposans"),
                          ),
                          loader: Container(
                            child: SpinKitRing(
                              size: 22,
                              lineWidth: 3,
                              color: Colors.white,
                            ),
                          ),
                          onTap: (startLoading, stopLoading, btnState) {
                            var password = controller.text;
                            if (btnState == ButtonState.Busy) return;
                            startLoading();
                            AliFile.apiUncompress(widget.box, widget.fileid, selectKey, password).then((value) {
                              stopLoading();
                              if (value.length == 1) {
                                BotToast.showText(text: "失败:" + value[0]);
                                return;
                              }
                              pageExpandedNode("root", true);
                              Navigator.of(context).pop('ok');

                              showDialog(
                                  barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                                  context: context,
                                  builder: (context) {
                                    return WillPopScope(
                                        onWillPop: () async => false, //关键代码
                                        child: UnrarBackDialog(state: value[0]));
                                  });
                            });
                          },
                        ),
                      ]),
                    ),
                  ],
                ),
              )),
            )));
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
      Node node2 = node.copyWith(expanded: expanded);
      List<Node> updated = treeController.updateNode(key, node2);
      _updateTree(treeController.copyWith(children: updated, selectedKey: key));

      if (expanded == true) {
        if (!loading.containsKey(key) || loading[key] == false) {
          loading[key] = true;
          //是文件夹&&children子文件数==0&&要展开显示了
          //注意node.parent,当联网后发现是空文件夹，node.parent会变成false

          AliFile.apiDirList(widget.box, key, node.label).then((loadData) {
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
        key: Key("pdt_unrar_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_unrar_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decoration,
                hoverDecoration: hoverDecoration,
                child: Container(
                    key: Key("pdt_unrar_rchc_" + key),
                    width: 440 - leve * 20,
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_unrar_rchcr_" + key), children: [
                      icon,
                      padding2,
                      Expanded(
                          child: Text(
                        StringUtils.joinChar(label),
                        key: Key("pdt_unrar_rchcrt_" + key),
                        style: style,
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.clip,
                      ))
                    ])))));

    widgetSelect = Container(
        key: Key("pdt_unrar_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_unrar_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decorations,
                hoverDecoration: hoverDecorations,
                child: Container(
                    key: Key("pdt_unrar_rchc_" + key),
                    width: 440 - leve * 20,
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_unrar_rchcr_" + key), children: [
                      icons,
                      padding2,
                      Expanded(
                          child: Text(
                        StringUtils.joinChar(label),
                        key: Key("pdt_unrar_rchcrt_" + key),
                        style: styles,
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.clip,
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
  var style = TextStyle(fontSize: 14, color: MColors.pageLeftRowItemColor, fontFamily: "opposans");
  var styles = TextStyle(fontSize: 14, color: MColors.userNavMenuIconHover, fontFamily: "opposans");
}
