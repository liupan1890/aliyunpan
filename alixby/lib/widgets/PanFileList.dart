import 'package:alixby/api/Downloader.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/states/PanFileState.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/widgets/ImageDialog.dart';
import 'package:alixby/widgets/TextDialog.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/rendering.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/material.dart';

class PanFileList extends StatefulWidget {
  @override
  _PanFileListState createState() => _PanFileListState();
}

class _PanFileListState extends State<PanFileList> {
  @override
  void initState() {
    super.initState();
    print('_PanFileListState initState');
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
            child: Row(
              children: [
                Expanded(
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
                  itemCount: context.watch<PanFileState>().pageRightFileList.length,
                  itemBuilder: _buildList,
                )),
                Container(width: 16),
              ],
            )));
  }

  static Icon iconSelected = Icon(MIcons.rsuccess, color: MColors.iconSelected);
  static Icon iconSelect = Icon(MIcons.rpic, color: MColors.iconSelect);
  static Icon iconSelectFavor = Icon(MIcons.crown, color: MColors.iconSelect);
  static Padding padding6 = Padding(padding: EdgeInsets.only(left: 6));
  static Padding padding4 = Padding(padding: EdgeInsets.only(left: 4));
  static Padding padding12 = Padding(padding: EdgeInsets.only(left: 12));
  static TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor);
  static SizedBox sizeBox = SizedBox(width: 40, height: 40, child: iconSelect);
  static SizedBox sizeBoxFavor = SizedBox(width: 40, height: 40, child: iconSelectFavor);
  static SizedBox sizeBoxed = SizedBox(width: 40, height: 40, child: iconSelected);

  static onTapFileName(String key, String filetype, BuildContext context) {
    print('点击文件名');
    onTapFile(key);
    //var page = Global.panFileState.getPageName;
    //if (page == "trash") return;//回收站内文件同样可以预览
    //todo::收藏夹，向上遍历父文件夹路径
    if (filetype == "folder") {
      Global.panTreeState.pageSelectNode(key, true);
      return;
    } else if (filetype == "file") {
      //不支持预览的文件格式，忽略
      return;
    } else if (filetype == "video" || filetype == "audio") {
      Downloader.goPlay(key);
      return;
    } else if (filetype == "image") {
      var fcHide = Loading.showLoading();
      Downloader.goImage(key).then((value) {
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
      Downloader.goText(key).then((value) {
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
                    child: TextDialog(text: value));
              });
        }
      });
      return;
    }
  }

  static onTapFile(String key) {
    Global.panFileState.pageSelectFile(key);
    print('选中文件');
  }

  Widget _buildList(BuildContext context, int index) {
    var item = Global.panFileState.pageRightFileList[index];
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
        key: Key("prf_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 50,
        decoration: item.selected ? decorations : decoration,
        hoverDecoration: item.selected ? hoverDecorations : hoverDecoration,
        child: Container(
            key: Key("prf_hc_" + item.key),
            height: 50,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.key),
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
                                  onTap: () => onTapFileName(item.key, item.filetype, context),
                                  child:
                                      Text(item.title, softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 2))))
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
                      child: Text(item.filetimestr, style: textStyle, textAlign: TextAlign.center, maxLines: 2),
                    ),
                    padding12,
                  ],
                ))));
  }
}
