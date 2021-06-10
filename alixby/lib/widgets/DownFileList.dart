import 'package:alixby/api/Downloader.dart';
import 'package:alixby/api/Uploader.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/states/pageDownState.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/rendering.dart';
import 'package:gradient_widgets/gradient_widgets.dart';
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
    print('_DownFileListState initState');
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
                  itemCount: context.watch<PageDownState>().pageRightDownList.length,
                  itemBuilder: _buildList,
                )),
                Container(width: 16),
              ],
            )));
  }

  //static BoxDecoration decoration = BoxDecoration(color: Color(0xfff7f8fa), border: border);

  static Padding padding4 = Padding(padding: EdgeInsets.only(left: 4));
  static Padding padding12 = Padding(padding: EdgeInsets.only(left: 12));
  static Padding padding16 = Padding(padding: EdgeInsets.only(left: 16));
  static Padding padding22 = Padding(padding: EdgeInsets.only(left: 22));
  TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor);
  SizedBox downBox = SizedBox(width: 40, height: 40, child: Icon(MIcons.download, color: MColors.iconDown));
  SizedBox downBoxed = SizedBox(width: 40, height: 40, child: Icon(MIcons.download, color: MColors.iconSelected));
  SizedBox uploadBox = SizedBox(width: 40, height: 40, child: Icon(MIcons.upload, color: MColors.iconDown));
  SizedBox uploadBoxed = SizedBox(width: 40, height: 40, child: Icon(MIcons.upload, color: MColors.iconSelected));

  static onTapFile(String key) {
    Global.pageDownState.pageSelectFile(key);
    print('选中文件');
  }

  static onTapBtn(String button, String key, String downPage) async {
    print('点击按钮');
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
    //print("buildfile " + item.key);
    //if (item.icon[0] == '.') item.icon = FileIcons.getFileIcon(item.icon, "");
    return HoverContainer(
        //key: Key("prd_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 60,
        decoration: item.selected ? decorations : decoration,
        hoverDecoration: item.selected ? hoverDecorations : hoverDecoration,
        child: Container(
            key: Key("prd_hc_" + item.key),
            height: 60,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.key),
                child: Row(
                  key: Key("prd_hcr_" + item.key),
                  children: [
                    item.downPage.startsWith("down")
                        ? (item.isDowning ? downBoxed : downBox)
                        : (item.isDowning ? uploadBoxed : uploadBox),
                    padding4,
                    Expanded(
                      child: Tooltip(
                        message: item.path,
                        child: Text(item.title, softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 2),
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
                          HoverWidget(
                              key: Key("prd_hcr_hbtn_" + item.key),
                              child: item.downPage.contains("ing")
                                  ? Container(
                                      width: 220,
                                      height: 60,
                                      child: Row(key: Key("prd_hcr_hbtnr_" + item.key), children: [
                                        Container(
                                            key: Key("prd_hcr_t_" + item.key),
                                            width: 90,
                                            alignment: Alignment.center,
                                            child: Column(children: [
                                              Padding(padding: EdgeInsets.only(top: 20)),
                                              SizedBox(
                                                  height: 3,
                                                  child: GradientProgressIndicator(
                                                    gradient: Gradients.coralCandyGradient,
                                                    value: item.downProgress / 100,
                                                  )),
                                              Padding(padding: EdgeInsets.only(top: 4)),
                                              Text(item.lastTime,
                                                  style: TextStyle(fontSize: 12, color: MColors.textColor),
                                                  maxLines: 1,
                                                  softWrap: false),
                                            ])),
                                        padding12,
                                        Container(
                                            key: Key("prd_hcr_sp_" + item.key),
                                            width: 110,
                                            alignment: Alignment.centerRight,
                                            child: Text(item.downSpeed,
                                                style: TextStyle(fontSize: 20, color: MColors.pageRightDownSpeedColor),
                                                maxLines: 1,
                                                softWrap: false,
                                                overflow: TextOverflow.visible))
                                      ]))
                                  : Container(
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
                              hoverChild: item.downPage.contains("ing")
                                  ? Container(
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
                                          ]))
                                  : Container(
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
                              onHover: (p) {}),
                          Positioned(
                            left: 0,
                            top: 39,
                            child: Text(
                              item.failedMessage,
                              style: TextStyle(color: Colors.red, fontSize: 12),
                            ),
                          ),
                        ])),
                    padding12,
                  ],
                ))));
  }
}
