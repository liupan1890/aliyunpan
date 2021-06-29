import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/PanData.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/utils/SpinKitRing.dart';
import 'package:alixby/utils/StringUtils.dart';
import 'package:argon_buttons_flutter/argon_buttons_flutter.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:filesize/filesize.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class SaveMiaoChuanBackDialog extends StatefulWidget {
  // ignore: non_constant_identifier_names
  SaveMiaoChuanBackDialog(
      {Key? key, required this.box, required this.boxname, required this.parentid, required this.link})
      : super(key: key);

  String box = "";
  String boxname = "";
  String parentid = "";

  LinkFileModel link = LinkFileModel();

  @override
  _SaveMiaoChuanBackDialogState createState() => _SaveMiaoChuanBackDialogState();
}

class _SaveMiaoChuanBackDialogState extends State<SaveMiaoChuanBackDialog> {
  List<LinkFileModel> list = [];
  @override
  void initState() {
    super.initState();
    //创建树
    list.addAll(_addNodes(widget.link.children, 0));
  }

  List<LinkFileModel> _addNodes(List<LinkFileModel> list, int leve) {
    List<LinkFileModel> clist = [];

    for (int i = 0; i < list.length; i++) {
      if (list[i].isdir) {
        list[i].leve = leve;
        clist.add(list[i]);
        clist.addAll(_addNodes(list[i].children, leve + 1));
      }
    }
    for (int i = 0; i < list.length; i++) {
      if (list[i].isdir == false) {
        list[i].leve = leve;
        clist.add(list[i]);
      }
    }
    return clist;
  }

  final ScrollController verticalScroll = ScrollController();
  @override
  void dispose() {
    verticalScroll.dispose();
    super.dispose();
  }

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
                height: 540,
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
                        child: Text("导入文件",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        width: 480,
                        height: 370,
                        alignment: Alignment.topLeft,
                        decoration: BoxDecoration(
                            border: Border.all(width: 1, color: Colors.grey), borderRadius: BorderRadius.circular(3.0)),
                        padding: EdgeInsets.all(2),
                        child: Scrollbar(
                            controller: verticalScroll,
                            isAlwaysShown: true,
                            showTrackOnHover: true,
                            thickness: 9,
                            hoverThickness: 9,
                            child: ListView.builder(
                              controller: verticalScroll,
                              shrinkWrap: false,
                              primary: false,
                              addSemanticIndexes: false,
                              addAutomaticKeepAlives: false,
                              addRepaintBoundaries: false,
                              scrollDirection: Axis.vertical,
                              physics: ClampingScrollPhysics(),
                              itemExtent: 28,
                              itemCount: list.length,
                              itemBuilder: _buildList,
                            ))),
                    Container(
                        width: 480,
                        height: 54,
                        padding: EdgeInsets.only(top: 8),
                        child: Text("备注信息：" + widget.link.name)),
                    Container(
                      width: 480,
                      padding: EdgeInsets.only(top: 8),
                      child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                        OutlinedButton(
                          onPressed: () => Navigator.of(context).pop('ok'),
                          child: Text("取消"),
                          style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
                        ),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        ArgonButton(
                          height: 32,
                          width: 140,
                          minWidth: 140,
                          borderRadius: 3.0,
                          roundLoadingShape: false,
                          color: MColors.elevatedBtnBG,
                          child: Text(
                            "导入这些文件",
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
                            if (widget.link.hash == "") {
                              if (btnState == ButtonState.Busy) return;
                              startLoading();
                              if (widget.link.shareid != "") {
                                Linker.goLinkShareUpload(
                                        widget.box, widget.parentid, widget.link.shareid, widget.link.fulljson)
                                    .then((value) {
                                  stopLoading();
                                  if (value > 0) {
                                    Future.delayed(Duration(milliseconds: 800), () {
                                      PanData.loadFileList(widget.box, widget.parentid, "save"); //触发联网加载
                                    });
                                    Navigator.of(context).pop('ok');
                                    BotToast.showText(text: "成功创建 " + value.toString() + " 个文件的分享任务");
                                  } else {
                                    BotToast.showText(text: "导入分享任务失败,请重试");
                                  }
                                });
                              } else {
                                Linker.goLinkUpload(widget.box, widget.parentid, widget.link.fulljson).then((value) {
                                  stopLoading();
                                  if (value > 0) {
                                    Future.delayed(Duration(milliseconds: 800), () {
                                      PanData.loadFileList(widget.box, widget.parentid, "save"); //触发联网加载
                                    });
                                    Navigator.of(context).pop('ok');
                                    BotToast.showText(text: "成功创建 " + value.toString() + " 个文件的秒传任务");
                                  } else {
                                    BotToast.showText(text: "导入秒传任务失败,请重试");
                                  }
                                });
                              }
                            }
                          },
                        ),
                      ]),
                    ),
                  ],
                ),
              )),
            )));
  }

  var decoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG);
  var hoverDecoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGHover);
  var padding = EdgeInsets.only(left: 3, right: 3);
  var padding2 = Padding(padding: EdgeInsets.only(left: 4));
  var icondir = Icon(MIcons.folder, size: 20, color: MColors.iconFolder);
  var iconfile = Icon(MIcons.file_file, size: 20, color: MColors.iconFile);
  var style = TextStyle(fontSize: 14, color: MColors.pageLeftRowItemColor, fontFamily: "opposans");

  static TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans");
  Widget _buildList(BuildContext context, int index) {
    var item = list[index];
    return HoverContainer(
        //key: Key("prd_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 24,
        margin: EdgeInsets.only(top: 4),
        padding: EdgeInsets.only(right: 16),
        decoration: decoration,
        hoverDecoration: hoverDecoration,
        child: Container(
            height: 24,
            child: Row(
              children: [
                Container(width: (22 * item.leve).toDouble()),
                item.isdir ? icondir : iconfile,
                padding2,
                Expanded(
                  child: Tooltip(
                      message: item.name,
                      child: Text(StringUtils.joinChar(item.name),
                          softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 1)),
                ),
                Container(
                    width: 88,
                    alignment: Alignment.centerRight,
                    child: Text(item.isdir ? "" : filesize(item.size), style: textStyle, maxLines: 1)),
              ],
            )));
  }
}
