import 'dart:io';

import 'package:alixby/api/Uploader.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/utils/SpinKitRing.dart';
import 'package:alixby/utils/StringUtils.dart';
import 'package:argon_buttons_flutter/argon_buttons_flutter.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class DropUploadDialog extends StatefulWidget {
  DropUploadDialog(
      {Key? key,
      required this.ukey,
      required this.box,
      required this.parentid,
      required this.parentname,
      required String files})
      : super(key: key) {
    //boxname
    if (box == 'box')
      boxname = "网盘";
    else if (box == 'sbox')
      boxname = "保险箱";
    else if (box == 'xiangce') boxname = "相册";

//filelist
    filelist = [];
    var list = files.split('\n');
    final Icon iconFile = Icon(MIcons.wenjian, key: Key("file"), size: 22, color: MColors.iconFile);
    final Icon iconFolder = Icon(MIcons.folder, key: Key("folder"), size: 22, color: MColors.iconFolder);
    int fileCount = 0;
    int dirCount = 0;
    for (var i = 0; i < list.length; i++) {
      var file = list[i];
      var fi = FileStat.statSync(file);
      if (fi.type == FileSystemEntityType.notFound) {
        continue;
      }

      var isdir = (fi.type == FileSystemEntityType.directory);
      if (isdir) {
        dirCount++;
        var item = PageRightFileItem.newPageRightFileItem(
            box, file, iconFolder, file, 0, DateTime.now(), false, isdir, "forder");
        filelist.add(item);
        fileuplist.add(file);
      } else {
        fileCount++;
        var item = PageRightFileItem.newPageRightFileItem(
            box, file, iconFile, file, fi.size, fi.modified, false, isdir, "file");
        filelist.add(item);
        fileuplist.add(file);
      }
    }
    desc = fileCount.toString() + "文件 " + dirCount.toString() + "文件夹";
  }
  UniqueKey ukey;
  String box = "";
  String boxname = "";
  String parentid = "";
  String parentname = "";
  List<PageRightFileItem> filelist = [];
  List<String> fileuplist = [];
  String desc = "";

  @override
  _DropUploadDialogState createState() => _DropUploadDialogState();
}

class _DropUploadDialogState extends State<DropUploadDialog> {
  @override
  void dispose() {
    verticalScroll.dispose();
    super.dispose();
  }

  final ScrollController verticalScroll = ScrollController();
  @override
  void initState() {
    super.initState();
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
                height: 520,
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
                              onTap: () => BotToast.remove(widget.ukey, "upload"),
                            ))),
                    Container(
                        child: Text("拖放文件+文件夹上传",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        padding: EdgeInsets.only(left: 20, right: 20),
                        alignment: Alignment.topLeft,
                        child: Column(children: [
                          ConstrainedBox(
                            constraints: BoxConstraints(maxHeight: 70, minWidth: double.infinity),
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(
                                    style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                                    children: [
                                      TextSpan(
                                          text: "文件会被保存在当前路径下：",
                                          style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                      TextSpan(
                                          text: "/" + widget.boxname + "根目录" + widget.parentname,
                                          style: TextStyle(
                                              fontSize: 12, color: MColors.linkColor, fontFamily: "opposans")),
                                    ])),
                          ),
                          Padding(padding: EdgeInsets.only(top: 12)),
                          _buildLink(context),
                          Padding(padding: EdgeInsets.only(top: 24)),
                          _buildCanShu(context),
                          Padding(padding: EdgeInsets.only(top: 12)),
                        ])),
                  ],
                ),
              )),
            )));
  }

  Widget _buildLink(BuildContext context) {
    return Container(
        height: 300,
        alignment: Alignment.topLeft,
        decoration:
            BoxDecoration(border: Border.all(width: 1, color: Colors.grey), borderRadius: BorderRadius.circular(3.0)),
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
              itemExtent: 42,
              itemCount: widget.filelist.length,
              itemBuilder: _buildList,
            )));
  }

  var decoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG);
  var hoverDecoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGHover);
  var padding = EdgeInsets.only(left: 3, right: 3);
  var padding2 = Padding(padding: EdgeInsets.only(left: 4));
  var icondir = Icon(MIcons.folder, size: 20, color: MColors.iconFolder);
  var iconfile = Icon(MIcons.file_file, size: 20, color: MColors.iconFile);
  var style = TextStyle(fontSize: 14, color: MColors.pageLeftRowItemColor, fontFamily: "opposans");
  TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans");
  Widget _buildList(BuildContext context, int index) {
    var item = widget.filelist[index];

    return HoverContainer(
        //key: Key("prd_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 42,
        margin: EdgeInsets.only(top: 4),
        padding: EdgeInsets.only(right: 16),
        decoration: decoration,
        hoverDecoration: hoverDecoration,
        child: Container(
            height: 42,
            child: Row(
              children: [
                item.isDir ? icondir : iconfile,
                padding2,
                Expanded(
                    child: Text(
                  StringUtils.joinChar(item.title),
                  style: textStyle,
                  softWrap: false,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 2,
                )),
                Container(
                    key: Key("prf_hcr_s_" + item.key),
                    width: 88,
                    alignment: Alignment.centerRight,
                    child: Text(item.filesizestr, style: textStyle, maxLines: 1, softWrap: false)),
              ],
            )));
  }

  Widget _buildCanShu(BuildContext context) {
    return Container(
      alignment: Alignment.topLeft,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
              child:
                  Text(widget.desc, style: TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans"))),
          OutlinedButton(
            onPressed: () => BotToast.remove(widget.ukey, "upload"),
            child: Text("  取消  "),
            style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
          ),
          Padding(padding: EdgeInsets.only(left: 24)),
          ArgonButton(
            height: 32,
            width: 80,
            minWidth: 80,
            borderRadius: 3.0,
            roundLoadingShape: false,
            color: MColors.elevatedBtnBG,
            child: Text(
              "上传",
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
              if (btnState == ButtonState.Busy) return;
              startLoading();
              Uploader.goUploadFileAndDir(widget.box, widget.parentid, widget.fileuplist).then((value) {
                stopLoading();
                if (value > 0) {
                  BotToast.showText(text: "成功创建" + value.toString() + "个上传任务");
                  BotToast.remove(widget.ukey, "upload");
                  Future.delayed(Duration(milliseconds: 600), () {
                    Global.getTreeState(widget.box).pageRefreshNode();
                  });
                } else {
                  BotToast.showText(text: "创建文件上传任务失败请重试");
                }
              });
            },
          ),
        ],
      ),
    );
  }
}
