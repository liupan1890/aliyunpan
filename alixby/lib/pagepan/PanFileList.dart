import 'package:alixby/api/Downloader.dart';
import 'package:alixby/pagepan/ImagesDialog.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/pagepan/ImageDialog.dart';
import 'package:alixby/pagepan/TextDialog.dart';
import 'package:alixby/pagepan/UnRarDialog.dart';
import 'package:alixby/utils/StringUtils.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/rendering.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class PanFileList extends StatefulWidget {
  PanFileList(this.box) : super();
  String box = "";
  @override
  _PanFileListState createState() => _PanFileListState();
}

class _PanFileListState extends State<PanFileList> {
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
  final GlobalKey fileSBKey = GlobalKey();
  final GlobalKey fileListKey = GlobalKey();
  @override
  Widget build(BuildContext context) {
    var itemCount = 0;
    if (widget.box == 'box') {
      itemCount = context.watch<PanFileState>().pageRightFileList.length;
    } else if (widget.box == "xiangce") {
      itemCount = context.watch<XiangCeFileState>().pageRightFileList.length;
    }
    return Container(
      key: fileConKey,
      width: double.infinity,
      decoration: BoxDecoration(border: Border(top: BorderSide(width: 1, color: MColors.pageRightBorderColor))),
      alignment: Alignment.topLeft,
      child: Scrollbar(
          key: fileSBKey,
          controller: verticalScroll,
          isAlwaysShown: true,
          showTrackOnHover: true,
          thickness: 9,
          hoverThickness: 9,
          child: ListView.builder(
            key: fileListKey,
            controller: verticalScroll,
            shrinkWrap: false,
            primary: false,
            addSemanticIndexes: false,
            addAutomaticKeepAlives: false,
            scrollDirection: Axis.vertical,
            physics: ClampingScrollPhysics(),
            itemExtent: 50,
            itemCount: itemCount,
            itemBuilder: _buildList,
          )),
    );
  }

  static Icon iconSelected = Icon(MIcons.rsuccess, color: MColors.iconSelected);
  static Icon iconSelect = Icon(MIcons.rpic, color: MColors.iconSelect);
  static Icon iconSelectFavor = Icon(MIcons.crown, color: MColors.iconSelect);
  static Padding padding6 = Padding(padding: EdgeInsets.only(left: 6));
  static Padding padding4 = Padding(padding: EdgeInsets.only(left: 4));
  static Padding padding12 = Padding(padding: EdgeInsets.only(left: 12));
  static TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans");
  static SizedBox sizeBox = SizedBox(width: 40, height: 40, child: iconSelect);
  static SizedBox sizeBoxFavor = SizedBox(width: 40, height: 40, child: iconSelectFavor);
  static SizedBox sizeBoxed = SizedBox(width: 40, height: 40, child: iconSelected);

  static onTapFileName(String box, String key, String filetype, BuildContext context) {
    onTapFile(box, key);
    //var page = Global.panFileState.getPageName;
    //if (page == "trash") return;//回收站内文件同样可以预览
    //todo::收藏夹，向上遍历父文件夹路径
    if (filetype == "folder") {
      Global.getTreeState(box).pageSelectNode(box, key, true);
      return;
    } else if (filetype == "file") {
      //不支持预览的文件格式，忽略
      return;
    } else if (filetype == "video" || filetype == "audio") {
      BotToast.showLoading(duration: Duration(seconds: 3));
      Downloader.goPlay(box, key);
      return;
    } else if (filetype == "image") {
      var imagelist = Global.getFileState(box).getImageFiles();
      showDialog(
          barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
          context: context,
          builder: (context) {
            return WillPopScope(
                onWillPop: () async => false, //关键代码
                child: ImagesDialog(box: box, imageselected: key, imagelist: imagelist));
          });
      return;
    } else if (filetype == "image") {
      var fcHide = Loading.showLoading();
      Downloader.goImage(box, key).then((value) {
        fcHide();
        if (value == "error" || value == "") {
          BotToast.showText(text: "预览图片失败,请重试");
        } else {
          showDialog(
              barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
              context: context,
              builder: (context) {
                return WillPopScope(
                    onWillPop: () async => false, //关键代码
                    child: ImageDialog(imageUrl: value));
              });
        }
      });
      return;
    } else if (filetype == "txt") {
      var fcHide = Loading.showLoading();
      Downloader.goText(box, key).then((value) {
        fcHide();
        if (value == "error") {
          BotToast.showText(text: "预览文本失败,请重试");
        } else {
          showDialog(
              barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
              context: context,
              builder: (context) {
                return WillPopScope(
                    onWillPop: () async => false, //关键代码
                    child: TextDialog(box: box, text: value));
              });
        }
      });
      return;
    } else if (filetype == "zip") {
      //AliFile.apiUncompress(key, target_file_id, password)
      showDialog(
          barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
          context: context,
          builder: (context) {
            return WillPopScope(
                onWillPop: () async => false, //关键代码
                child: UnrarDialog(box: box, fileid: key));
          });
    }
  }

  static onTapFile(String box, String key) {
    Global.getFileState(box).pageSelectFile(key);
  }

  Widget _buildList(BuildContext context, int index) {
    var item = Global.getFileState(widget.box).pageRightFileList[index];
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
    var title = item.title;
    if (title.length < 10) title = title.padRight(10, ' ');

    return HoverContainer(
        key: Key("prf_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        padding: EdgeInsets.only(right: 16),
        height: 50,
        decoration: item.selected ? decorations : decoration,
        hoverDecoration: item.selected ? hoverDecorations : hoverDecoration,
        child: Container(
            key: Key("prf_hc_" + item.key),
            height: 50,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.box, item.key),
                child: Row(
                  key: Key("prf_hcr_" + item.key),
                  children: [
                    item.selected ? sizeBoxed : (item.isFavor ? sizeBoxFavor : sizeBox),
                    padding6,
                    item.icon,
                    padding4,
                    Expanded(
                        child: Row(children: [
                      Flexible(
                          flex: 1,
                          fit: FlexFit.loose,
                          child: Container(
                              key: Key("prf_hcr_n_" + item.key),
                              child: InkWell(
                                  mouseCursor:
                                      item.filetype != "file" ? SystemMouseCursors.click : SystemMouseCursors.basic,
                                  onTap: () => onTapFileName(item.box, item.key, item.filetype, context),
                                  child: Text(StringUtils.joinChar(title),
                                      softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 2))))
                    ])),
                    Container(
                        key: Key("prf_hcr_s_" + item.key),
                        width: 88,
                        alignment: Alignment.centerRight,
                        child: Text(item.filesizestr, style: textStyle, maxLines: 1, softWrap: false)),
                    padding12,
                    Container(
                      key: Key("prf_hcr_t_" + item.key),
                      width: 44,
                      alignment: Alignment.centerRight,
                      child: Text(item.filetimestr, style: textStyle, textAlign: TextAlign.right, maxLines: 2),
                    ),
                    padding12,
                  ],
                ))));
  }
}
