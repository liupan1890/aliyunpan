import 'package:alixby/api/Downloader.dart';
import 'package:alixby/api/Uploader.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/states/pageDownState.dart';
import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagedown/DownFileList.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:provider/provider.dart';

class PageRightDown extends StatefulWidget {
  @override
  _PageRightDownState createState() => _PageRightDownState();
}

class _PageRightDownState extends State<PageRightDown> with AutomaticKeepAliveClientMixin {
  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  static onTapBtn(String button) async {
    String downPage = Global.pageDownState.getPageName;
    String key = "all";
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

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    var getPageName = context.watch<PageDownState>().getPageName;
    var pageRightDownDes = context.watch<PageDownState>().pageRightDownDes;
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
                        text: "传输任务列表",
                        linkifiers: [FileLinkifier("传输任务列表", "", "")],
                        linkStyle: TextStyle(
                            fontSize: 13,
                            color: MColors.linkColor,
                            decoration: TextDecoration.none,
                            fontFamily: "opposans"))))),
        Container(
            height: 34,
            width: double.infinity,
            child: getPageName.contains("ing")
                ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    OutlinedButton.icon(
                        icon: Icon(MIcons.start, size: 16), label: Text('全部开始'), onPressed: () => onTapBtn('start')),
                    Padding(padding: EdgeInsets.only(left: 12)),
                    OutlinedButton.icon(
                        icon: Icon(MIcons.pause, size: 16), label: Text('全部暂停'), onPressed: () => onTapBtn('stop')),
                    Padding(padding: EdgeInsets.only(left: 12)),
                    OutlinedButton.icon(
                        icon: Icon(MIcons.delete, size: 16), label: Text('全部删除'), onPressed: () => onTapBtn('delete')),
                  ])
                : Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    OutlinedButton.icon(
                        icon: Icon(MIcons.delete, size: 16), label: Text('全部删除'), onPressed: () => onTapBtn('delete')),
                  ])),
        Container(height: 1, width: double.infinity, color: MColors.pageRightBorderColor),
        Container(
            height: 40,
            alignment: Alignment.topLeft,
            width: double.infinity,
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
              Padding(padding: EdgeInsets.only(left: 44)),
              Text(pageRightDownDes),
              Expanded(child: Container()),
              Container(child: Text("操作")),
              Padding(padding: EdgeInsets.only(left: 210)),
            ])),
        Expanded(child: DownFileList()),
      ],
    );
  }

  @override
  bool get wantKeepAlive => true;
}
