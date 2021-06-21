import 'package:alixby/api/AliFile.dart';
import 'package:alixby/api/Linker.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/states/PanData.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_treeview/flutter_treeview.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class ZhuanCunDialog extends StatefulWidget {
  // ignore: non_constant_identifier_names
  ZhuanCunDialog({Key? key, required this.filelist}) : super(key: key);
  String pagetitle = "转存";
  // ignore: non_constant_identifier_names
  List<PageRightFileItem> filelist = [];

  @override
  _ZhuanCunDialogState createState() => _ZhuanCunDialogState();
}

class _ZhuanCunDialogState extends State<ZhuanCunDialog> {
  @override
  void initState() {
    super.initState();
    pageExpandedNode("root", true);
  }

  String movetobox = "box";
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

  TreeViewController treeController = TreeViewController(children: [_makeNode("", "root", "网盘目录树", 0, [])]);
  String selectKey = "";
  Map<String, bool> loading = {};
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
                              child: Icon(MIcons.close, size: 18, color: MColors.textColor),
                              onTap: () => Navigator.of(context).pop('ok'),
                            ))),
                    Container(
                        child: Text("转存文件",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        width: 440,
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
                                  padding: EdgeInsets.only(bottom: 12, right: 16),
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
                      width: 440,
                      padding: EdgeInsets.only(top: 12),
                      child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                        UnconstrainedBox(
                            child: Container(
                                height: 32,
                                padding: EdgeInsets.only(left: 7, right: 5),
                                alignment: Alignment.centerLeft,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(3.0), //3像素圆角
                                  border: Border.all(
                                    color: MColors.inputBorderColor,
                                    width: 1.0,
                                  ),
                                ),
                                child: DropdownButton<String>(
                                    isDense: true,
                                    itemHeight: 32, //需要修改kMinInteractiveDimension =32
                                    elevation: 0,
                                    value: movetobox,
                                    underline: Container(height: 0),
                                    dropdownColor: MColors.userNavMenuBG,
                                    onChanged: (String? newValue) {
                                      if (newValue != null) {
                                        movetobox = newValue;
                                        setState(() {
                                          movetobox = newValue;
                                        });
                                        pageExpandedNode("root", true);
                                      }
                                    },
                                    items: [
                                      DropdownMenuItem<String>(
                                          value: "box",
                                          child: Text(widget.pagetitle + '到 网盘',
                                              style: TextStyle(
                                                  fontSize: 14, color: MColors.textColor, fontFamily: "opposans"))),
                                      DropdownMenuItem<String>(
                                          value: "xiangce",
                                          child: Text(widget.pagetitle + '到 相册',
                                              style: TextStyle(
                                                  fontSize: 14, color: MColors.textColor, fontFamily: "opposans"))),
                                    ]))),
                        Expanded(child: Container()),
                        OutlinedButton(
                          onPressed: () => Navigator.of(context).pop('ok'),
                          child: Text("取消"),
                          style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
                        ),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        ElevatedButton(
                          onPressed: () {
                            var linkstr = '{"DirList":[],"FileList":[';
                            int totalsize = 0;
                            bool isadd = false;
                            for (var i = 0; i < widget.filelist.length; i++) {
                              var item = widget.filelist[i];
                              if (isadd == false)
                                isadd = true;
                              else
                                linkstr += ",";

                              linkstr += '"' +
                                  item.title.replaceAll("\"", "").replaceAll("|", "") +
                                  '|' +
                                  item.fileSize.toString() +
                                  '|' +
                                  item.filetype +
                                  '"';
                              totalsize += item.fileSize;
                            }
                            linkstr += '],"Name":"无","Size":' + totalsize.toString() + ',"Message":""}';
                            var fcHide = Loading.showLoading();
                            Linker.goLinkUpload(movetobox, selectKey, linkstr).then((value) {
                              fcHide();
                              Future.delayed(Duration(milliseconds: 500), () {
                                PanData.loadFileList(movetobox, selectKey, "zhuancun"); //触发联网加载
                              });

                              pageExpandedNode("root", true);
                              Navigator.of(context).pop('ok');
                              BotToast.showText(text: "成功转存" + value.toString() + "个文件");
                            });
                          },
                          child: Text("转存到选中的文件夹内"),
                          style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
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
      if (key == "root") {
        if (movetobox == "box") {
          //node2 = node.copyWith(label: "网盘目录树", expanded: expanded);
          node2 = _makeNode("", "root", "网盘根目录", 0, node.children).copyWith(expanded: expanded);
        } else if (movetobox == "xiangce") {
          //node2 = node.copyWith(label: "相册目录树", expanded: expanded);
          node2 = _makeNode("", "root", "相册根目录", 0, node.children).copyWith(expanded: expanded);
        }
      }
      List<Node> updated = treeController.updateNode(key, node2);
      _updateTree(treeController.copyWith(children: updated, selectedKey: key));

      if (expanded == true) {
        if (!loading.containsKey(key) || loading[key] == false) {
          loading[key] = true;
          //是文件夹&&children子文件数==0&&要展开显示了
          //注意node.parent,当联网后发现是空文件夹，node.parent会变成false

          AliFile.apiDirList(movetobox, key, node2.label).then((loadData) {
            if (loadData.key == "error") return;
            var leve = node2.data.leve + 1;
            //动态新增
            List<Node> children = [];
            var total = loadData.list.length;
            for (int i = 0; i < total; i++) {
              var m = loadData.list[i];
              if (m.isDir) children.add(_makeNode(m.parentkey, m.key, m.name, leve, []));
            }
            node2 = node2.copyWith(expanded: true, parent: true, children: children); //注意这里更新了parent
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
        key: Key("pdt_zhuan_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_zhuan_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decoration,
                hoverDecoration: hoverDecoration,
                child: Container(
                    key: Key("pdt_zhuan_rchc_" + key),
                    width: 400 - leve * 20,
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_zhuan_rchcr_" + key), children: [
                      icon,
                      padding2,
                      Expanded(
                          child: Text(
                        label,
                        key: Key("pdt_zhuan_rchcrt_" + key),
                        style: style,
                        maxLines: 1,
                        softWrap: false,
                        overflow: TextOverflow.clip,
                      ))
                    ])))));

    widgetSelect = Container(
        key: Key("pdt_zhuan_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_zhuan_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decorations,
                hoverDecoration: hoverDecorations,
                child: Container(
                    key: Key("pdt_zhuan_rchc_" + key),
                    width: 400 - leve * 20,
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_zhuan_rchcr_" + key), children: [
                      icons,
                      padding2,
                      Expanded(
                          child: Text(
                        label,
                        key: Key("pdt_zhuan_rchcrt_" + key),
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
