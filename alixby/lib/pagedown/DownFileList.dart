import 'package:alixby/api/Downloader.dart';
import 'package:alixby/api/Uploader.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/states/pageDownState.dart';
import 'package:alixby/utils/StringUtils.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/rendering.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/material.dart';

class DownFileList extends StatefulWidget {
  @override
  _DownFileListState createState() => _DownFileListState();
}

class _DownFileListState extends State<DownFileList> {
  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    verticalScroll.dispose();
    super.dispose();
  }

  final verticalScroll = ScrollController();
  final GlobalKey fileConKey = GlobalKey();
  @override
  Widget build(BuildContext context) {
    var itemCount = context.watch<PageDownState>().pageRightDownList.length;
    return Container(
        key: fileConKey,
        width: double.infinity,
        decoration: BoxDecoration(border: Border(top: BorderSide(width: 1, color: MColors.pageRightBorderColor))),
        alignment: Alignment.topLeft,
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
              addAutomaticKeepAlives: true,
              addRepaintBoundaries: true,
              scrollDirection: Axis.vertical,
              physics: ClampingScrollPhysics(),
              itemExtent: 60,
              itemCount: itemCount,
              itemBuilder: _buildList,
            )));
  }

  //static BoxDecoration decoration = BoxDecoration(color: Color(0xfff7f8fa), border: border);

  static Padding padding4 = Padding(padding: EdgeInsets.only(left: 4));
  static Padding padding12 = Padding(padding: EdgeInsets.only(left: 12));
  static Padding padding16 = Padding(padding: EdgeInsets.only(left: 16));
  static Padding padding22 = Padding(padding: EdgeInsets.only(left: 22));
  TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans");
  SizedBox downBox = SizedBox(width: 40, height: 40, child: Icon(MIcons.download, color: MColors.iconDown));
  SizedBox downBoxed = SizedBox(width: 40, height: 40, child: Icon(MIcons.download, color: MColors.iconSelected));
  SizedBox uploadBox = SizedBox(width: 40, height: 40, child: Icon(MIcons.upload, color: MColors.iconDown));
  SizedBox uploadBoxed = SizedBox(width: 40, height: 40, child: Icon(MIcons.upload, color: MColors.iconSelected));

  static LinearGradient coralCandyGradient =
      buildGradient(Alignment.topLeft, Alignment.bottomRight, const [Color(0xffFFF0D1), Color(0xffFFB8C6)]);
  static LinearGradient buildGradient(AlignmentGeometry begin, AlignmentGeometry end, List<Color> colors) =>
      LinearGradient(begin: begin, end: end, colors: colors);
  static Color probg = Color(0xfff0f0f1);

  static onTapFile(String key) {
    Global.pageDownState.pageSelectFile(key);
  }

  static onTapBtn(String button, String key, String downPage) async {
    var result = "";
    if (downPage == "downing") {
      if (button == "forder") {
        result = await Downloader.goDowningForder(key);
      } else {
        if (button == "start") result = await Downloader.goDowningStart(key);
        if (button == "stop") result = await Downloader.goDowningStop(key);
        if (button == "delete") result = await Downloader.goDowningDelete(key);
        Global.pageDownState.refreshDownByTimer(false); //触发刷新
      }
    }
    if (downPage == "downed") {
      if (button == "forder") {
        result = await Downloader.goDownedForder(key);
      } else {
        if (button == "delete") result = await Downloader.goDownedDelete(key);
        Global.pageDownState.refreshDownByTimer(false); //触发刷新
      }
    } else if (downPage == "uploading") {
      if (button == "forder") {
        result = await Uploader.goUploadingForder(key);
      } else {
        if (button == "start") result = await Uploader.goUploadingStart(key);
        if (button == "stop") result = await Uploader.goUploadingStop(key);
        if (button == "delete") result = await Uploader.goUploadingDelete(key);
        Global.pageDownState.refreshDownByTimer(false); //触发刷新
      }
    } else if (downPage == "upload") {
      if (button == "forder") {
        result = await Uploader.goUploadForder(key);
      } else {
        if (button == "delete") result = await Uploader.goUploadDelete(key);
        Global.pageDownState.refreshDownByTimer(false); //触发刷新
      }
    }

    if (result != "success") {
      BotToast.showText(text: "操作失败：" + result);
    }
  }

  Widget _buildList(BuildContext context, int index) {
    var item = Global.pageDownState.pageRightDownList[index];
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

    var ising = item.downPage.contains("ing");
    var isdown = item.downPage.startsWith("down");

    if (ising) {
      return HoverWidget(
        child: Container(
            decoration: item.selected ? decorations : decoration,
            key: Key("prd_hc_" + item.key),
            padding: EdgeInsets.only(right: 16),
            height: 60,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.key),
                child: Row(
                  key: Key("prd_hcr_" + item.key),
                  children: [
                    isdown ? (item.isDowning ? downBoxed : downBox) : (item.isDowning ? uploadBoxed : uploadBox),
                    padding4,
                    Expanded(
                      child: Tooltip(
                        message: item.path,
                        child: Text(StringUtils.joinChar(item.title),
                            softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 2),
                      ),
                    ),
                    Container(
                        key: Key("prd_hcr_s_" + item.key),
                        width: 88,
                        alignment: Alignment.centerRight,
                        child: Text(item.fileSize, style: textStyle, maxLines: 1)),
                    padding22,
                    Container(
                        height: 60,
                        child: Stack(alignment: Alignment.topLeft, children: <Widget>[
                          Container(
                              width: 220,
                              height: 60,
                              child: Row(key: Key("prd_hcr_hbtnr_" + item.key), children: [
                                Container(
                                    key: Key("prd_hcr_t_" + item.key),
                                    width: 90,
                                    alignment: Alignment.center,
                                    child: Column(children: [
                                      Padding(padding: EdgeInsets.only(top: 20)),
                                      LinearPercentIndicator(
                                        key: Key("prd_hcr_tp_" + item.key),
                                        width: 90.0,
                                        lineHeight: 3.0,
                                        percent: item.downProgress / 100,
                                        linearGradient: coralCandyGradient,
                                        backgroundColor: probg,
                                      ),
                                      Padding(padding: EdgeInsets.only(top: 4)),
                                      Text(item.lastTime,
                                          style:
                                              TextStyle(fontSize: 12, color: MColors.textColor, fontFamily: "opposans"),
                                          maxLines: 1,
                                          softWrap: false),
                                    ])),
                                padding12,
                                Container(
                                    key: Key("prd_hcr_sp_" + item.key),
                                    width: 110,
                                    alignment: Alignment.centerRight,
                                    child: Text(item.downSpeed,
                                        style: TextStyle(
                                            fontSize: 20,
                                            color: MColors.pageRightDownSpeedColor,
                                            fontFamily: "opposans"),
                                        maxLines: 1,
                                        softWrap: false,
                                        overflow: TextOverflow.visible))
                              ])),
                          Positioned(
                            left: 0,
                            top: 39,
                            child: SizedBox(
                                width: 220.0,
                                height: 20.0,
                                child: Container(
                                    width: 220,
                                    child: Text(
                                      item.failedMessage,
                                      overflow: TextOverflow.clip,
                                      maxLines: 1,
                                      softWrap: false,
                                      style: TextStyle(color: Colors.red, fontSize: 12, fontFamily: "opposans"),
                                    ))),
                          ),
                        ])),
                    padding12,
                  ],
                ))),
        hoverChild: Container(
            decoration: item.selected ? hoverDecorations : hoverDecoration,
            key: Key("prd_hc_" + item.key),
            padding: EdgeInsets.only(right: 16),
            height: 60,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.key),
                child: Row(
                  key: Key("prd_hcr_" + item.key),
                  children: [
                    isdown ? (item.isDowning ? downBoxed : downBox) : (item.isDowning ? uploadBoxed : uploadBox),
                    padding4,
                    Expanded(
                      child: Tooltip(
                        message: item.path,
                        child: Text(StringUtils.joinChar(item.title),
                            softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 2),
                      ),
                    ),
                    Container(
                        key: Key("prd_hcr_s_" + item.key),
                        width: 88,
                        alignment: Alignment.centerRight,
                        child: Text(item.fileSize, style: textStyle, maxLines: 1)),
                    padding22,
                    Container(
                        height: 60,
                        child: Stack(alignment: Alignment.topLeft, children: <Widget>[
                          Container(
                              width: 220,
                              height: 60,
                              child: Row(
                                  key: Key("prd_hcr_hbtnr2_" + item.key),
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    OutlinedButton(
                                        child: Icon(MIcons.start, size: 16),
                                        onPressed: () => onTapBtn("start", item.key, item.downPage)),
                                    padding16,
                                    OutlinedButton(
                                        child: Icon(MIcons.pause, size: 16),
                                        onPressed: () => onTapBtn("stop", item.key, item.downPage)),
                                    padding16,
                                    OutlinedButton(
                                        child: Icon(MIcons.file_folder, size: 16),
                                        onPressed: () => onTapBtn("forder", item.key, item.downPage)),
                                    padding16,
                                    OutlinedButton(
                                        child: Icon(MIcons.delete, size: 16),
                                        onPressed: () => onTapBtn("delete", item.key, item.downPage)),
                                  ])),
                          Positioned(
                            left: 0,
                            top: 39,
                            child: SizedBox(
                                width: 220.0,
                                height: 20.0,
                                child: Container(
                                    width: 220,
                                    child: Text(
                                      item.failedMessage,
                                      overflow: TextOverflow.clip,
                                      maxLines: 1,
                                      softWrap: false,
                                      style: TextStyle(color: Colors.red, fontSize: 12, fontFamily: "opposans"),
                                    ))),
                          ),
                        ])),
                    padding12,
                  ],
                ))),
        onHover: (e) {},
      );
    } else {
      return HoverContainer(
        key: Key("prdn_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 60,
        decoration: item.selected ? decorations : decoration,
        hoverDecoration: item.selected ? hoverDecorations : hoverDecoration,
        child: Container(
            key: Key("prd_hc_" + item.key),
            padding: EdgeInsets.only(right: 16),
            height: 60,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.key),
                child: Row(
                  key: Key("prd_hcr_" + item.key),
                  children: [
                    isdown ? (item.isDowning ? downBoxed : downBox) : (item.isDowning ? uploadBoxed : uploadBox),
                    padding4,
                    Expanded(
                      child: Tooltip(
                        message: item.path,
                        child: Text(StringUtils.joinChar(item.title),
                            softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 2),
                      ),
                    ),
                    Container(
                        key: Key("prd_hcr_s_" + item.key),
                        width: 88,
                        alignment: Alignment.centerRight,
                        child: Text(item.fileSize, style: textStyle, maxLines: 1)),
                    padding22,
                    Container(
                        height: 60,
                        child: Stack(alignment: Alignment.topLeft, children: <Widget>[
                          Container(
                              width: 120,
                              height: 60,
                              child: Row(
                                  key: Key("prd_hcr_hbtnr2_" + item.key),
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    OutlinedButton(
                                        child: Icon(MIcons.file_folder, size: 16),
                                        onPressed: () => onTapBtn("forder", item.key, item.downPage)),
                                    padding16,
                                    OutlinedButton(
                                        child: Icon(MIcons.delete, size: 16),
                                        onPressed: () => onTapBtn("delete", item.key, item.downPage)),
                                  ])),
                          Positioned(
                            left: 0,
                            top: 39,
                            child: SizedBox(
                                width: 220.0,
                                height: 20.0,
                                child: Container(
                                    width: 220,
                                    child: Text(
                                      item.failedMessage,
                                      overflow: TextOverflow.clip,
                                      maxLines: 1,
                                      softWrap: false,
                                      style: TextStyle(color: Colors.red, fontSize: 12, fontFamily: "opposans"),
                                    ))),
                          ),
                        ])),
                    padding12,
                  ],
                ))),
      );
    }
  }
}
