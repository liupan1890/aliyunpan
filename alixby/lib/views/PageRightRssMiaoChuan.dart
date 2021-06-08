import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/states/pageRssMiaoChuanState.dart';
import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:hovering/hovering.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:provider/provider.dart';

class PageRightRssMiaoChuan extends StatefulWidget {
  @override
  _PageRightRssMiaoChuanState createState() => _PageRightRssMiaoChuanState();
}

class _PageRightRssMiaoChuanState extends State<PageRightRssMiaoChuan> with AutomaticKeepAliveClientMixin {
  @override
  void initState() {
    super.initState();
    print('_PageRightRssMiaoChuanState initState');
  }

  final verticalScroll = ScrollController();
  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
            height: 52,
            width: double.infinity,
            alignment: Alignment.centerLeft,
            child: RichText(
                textAlign: TextAlign.left,
                text: WidgetSpan(
                    child: Linkify(
                        onOpen: null,
                        text: "秒传记录",
                        linkifiers: [FileLinkifier("秒传记录", "")],
                        linkStyle:
                            TextStyle(fontSize: 13, color: MColors.linkColor, decoration: TextDecoration.none))))),
        Container(
            height: 34,
            width: double.infinity,
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              OutlinedButton.icon(
                  icon: Icon(MIcons.sync, size: 16),
                  label: Text('刷新'),
                  onPressed: () {
                    Global.pageRssMiaoChuanState.refreshLink();
                  }),
            ])),
        Container(height: 1, width: double.infinity, color: MColors.pageRightBorderColor),
        Container(
            height: 40,
            alignment: Alignment.topLeft,
            width: double.infinity,
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
              Padding(padding: EdgeInsets.only(left: 44)),
              Text("秒传短链接"),
              Expanded(child: Container()),
              Container(child: Text("操作")),
              Padding(padding: EdgeInsets.only(left: 100)),
            ])),
        Expanded(
            child: Container(
                width: double.infinity,
                decoration:
                    BoxDecoration(border: Border(top: BorderSide(width: 1, color: MColors.pageRightBorderColor))),
                alignment: Alignment.topLeft,
                child: Scrollbar(
                    controller: verticalScroll,
                    isAlwaysShown: true,
                    showTrackOnHover: true,
                    thickness: 9,
                    hoverThickness: 9,
                    child: Row(
                      children: [
                        Expanded(
                            child: ListView.builder(
                          controller: verticalScroll,
                          shrinkWrap: false,
                          primary: false,
                          addSemanticIndexes: false,
                          addAutomaticKeepAlives: true,
                          addRepaintBoundaries: true,
                          scrollDirection: Axis.vertical,
                          physics: ClampingScrollPhysics(),
                          itemExtent: 60,
                          itemCount: context.watch<PageRssMiaoChuanState>().pageRightMiaoChuanList.length,
                          itemBuilder: _buildList,
                        )),
                        Container(width: 16),
                      ],
                    )))),
      ],
    );
  }

  static onTapFile(String key) {
    Global.pageRssMiaoChuanState.pageSelectLink(key);
  }

  static onTapBtn(String button, String key) async {
    if (button == "copy") {
      Clipboard.setData(ClipboardData(text: key));
      BotToast.showText(text: "已复制");
    } else if (button == "delete") {
      Linker.goLinkDelete(key).then((value) {
        Global.pageRssMiaoChuanState.refreshLink();
        if (value != "success") {
          BotToast.showText(text: "删除失败,请重试");
        }
      });
    }
  }

  static Icon iconSelected = Icon(MIcons.link2, color: MColors.iconSelected);
  static Icon iconSelect = Icon(MIcons.link2, color: MColors.iconDown);

  static Padding padding4 = Padding(padding: EdgeInsets.only(left: 4));
  static Padding padding12 = Padding(padding: EdgeInsets.only(left: 12));
  static Padding padding16 = Padding(padding: EdgeInsets.only(left: 16));
  static Padding padding22 = Padding(padding: EdgeInsets.only(left: 22));
  static TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor);
  static SizedBox linkBox = SizedBox(width: 40, height: 40, child: iconSelect);
  static SizedBox linkBoxed = SizedBox(width: 40, height: 40, child: iconSelected);

  var decoration = BoxDecoration(
      color: MColors.pageRightFileBG,
      border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));
  var decorations = BoxDecoration(
      color: MColors.pageRightFileBGSelect,
      border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));

  var hoverDecoration = BoxDecoration(
      color: MColors.pageRightFileBGHover,
      border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));
  var hoverDecorations = BoxDecoration(
      color: MColors.pageRightFileBGSelect,
      border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));

  Widget _buildList(BuildContext context, int index) {
    var item = Global.pageRssMiaoChuanState.pageRightMiaoChuanList[index];
    //print("buildfile " + item.key);
    //if (item.icon[0] == '.') item.icon = FileIcons.getFileIcon(item.icon, "");
    return HoverContainer(
        //key: Key("prd_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 60,
        decoration: item.selected ? decorations : decoration,
        hoverDecoration: item.selected ? hoverDecorations : hoverDecoration,
        child: Container(
            height: 60,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.link),
                child: Row(
                  children: [
                    item.selected ? linkBoxed : linkBox,
                    padding4,
                    Expanded(
                      child: Tooltip(
                        message: item.linkFull,
                        child: Text(item.link, softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 1),
                      ),
                    ),
                    Container(
                        width: 76,
                        alignment: Alignment.centerRight,
                        child: Text(item.logTimeStr, style: textStyle, maxLines: 2)),
                    padding22,
                    Container(
                      height: 60,
                      child: Container(
                          width: 120,
                          height: 60,
                          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                            OutlinedButton(
                                child: Icon(MIcons.copy, size: 16), onPressed: () => onTapBtn("copy", item.linkFull)),
                            padding16,
                            OutlinedButton(
                                child: Icon(MIcons.delete, size: 16),
                                onPressed: () => onTapBtn("delete", item.linkFull)),
                          ])),
                    ),
                    padding12,
                  ],
                ))));
  }

  @override
  bool get wantKeepAlive => true;
}
