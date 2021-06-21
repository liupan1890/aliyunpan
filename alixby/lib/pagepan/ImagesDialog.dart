import 'package:alixby/api/Downloader.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:extended_image/extended_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class ImagesDialog extends StatefulWidget {
  ImagesDialog({Key? key, required this.box, required this.imageselected, required this.imagelist}) : super(key: key);
  String box = "";
  String imageselected = "";
  List<PageRightFileItem> imagelist = [];

  @override
  _ImagesDialogState createState() => _ImagesDialogState();
}

class _ImagesDialogState extends State<ImagesDialog> {
  final verticalScroll = ScrollController();
  @override
  void dispose() {
    verticalScroll.dispose();
    super.dispose();
  }

  String imageSelected = "";
  String imageName = "";
  String imageUrl = "";
  double imageScale = 1.0;
  int imageRotate = 0;
  @override
  void initState() {
    super.initState();
    imageSelected = widget.imageselected;
    loadImage();
  }

  void loadImageNext() {
    var count = widget.imagelist.length;
    for (var i = 0; i < count; i++) {
      if (widget.imagelist[i].key == imageSelected) {
        if ((count - 1) > i) {
          imageSelected = widget.imagelist[i + 1].key;
          loadImage();
          return;
        } else {
          BotToast.showText(text: "这是最后一张图片了");
        }
      }
    }
  }

  void loadImagePrev() {
    var count = widget.imagelist.length;
    for (var i = 0; i < count; i++) {
      if (widget.imagelist[i].key == imageSelected) {
        if (i > 0) {
          imageSelected = widget.imagelist[i - 1].key;
          loadImage();
          return;
        } else {
          BotToast.showText(text: "这是第一张图片");
        }
      }
    }
  }

  void loadImage() {
    imageScale = 1.0;
    imageRotate = 0;
    var count = widget.imagelist.length;
    for (var i = 0; i < count; i++) {
      if (widget.imagelist[i].key == imageSelected) {
        imageName = "[" + (i + 1).toString() + "/" + count.toString() + "] " + widget.imagelist[i].title;
        setState(() {});
      }
    }
    Downloader.goImage(widget.box, imageSelected).then((value) {
      if (value == "error" || value == "") {
        BotToast.showText(text: "预览图片失败,请重试");
      } else {
        if (mounted) {
          setState(() {
            imageUrl = value;
          });
        }
      }
    });
  }

  void zoomImage(double add) {
    imageScale = imageScale - add;
    if (imageScale <= 0) imageScale = 0.1;
    if (mounted) {
      setState(() {});
    }
  }

  void rotateImage() {
    imageRotate = imageRotate + 1;
    if (imageRotate >= 4) imageRotate = 0;
    setState(() {});
  }

  final GlobalKey imageKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    var imagew = size.width * 0.8 - 24;
    var imageh = size.height * 0.9 - 90;

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
                height: size.height * 0.9,
                width: size.width * 0.8,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: MColors.dialogBgColor,
                ),
                padding: EdgeInsets.only(left: 20, right: 4),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: <Widget>[
                    Container(
                        alignment: Alignment.bottomRight,
                        padding: EdgeInsets.only(top: 8, right: 4),
                        child: MouseRegion(
                            cursor: SystemMouseCursors.click,
                            child: GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              child: Icon(MIcons.close, size: 18, color: MColors.textColor),
                              onTap: () => Navigator.of(context).pop('ok'),
                            ))),
                    Container(
                        child: Row(children: [
                      OutlinedButton.icon(
                          icon: Icon(MIcons.sync, size: 16), label: Text('刷新'), onPressed: () => loadImage()),
                      Padding(padding: EdgeInsets.only(left: 16)),
                      OutlinedButton(child: Text('前1张'), onPressed: () => loadImagePrev()),
                      Padding(padding: EdgeInsets.only(left: 16)),
                      OutlinedButton(child: Text('后1张'), onPressed: () => loadImageNext()),
                      Padding(padding: EdgeInsets.only(left: 16)),
                      _buildBtn(MIcons.xuanzhuan, "顺时针", () => rotateImage()),
                      Padding(padding: EdgeInsets.only(left: 16)),
                      Expanded(
                          child: Container(
                              alignment: Alignment.topLeft,
                              child: Text(imageName,
                                  maxLines: 1,
                                  softWrap: false,
                                  overflow: TextOverflow.clip,
                                  style: TextStyle(
                                      fontSize: 15, color: MColors.textColor, height: 1, fontFamily: "opposans")))),
                      Padding(padding: EdgeInsets.only(left: 20)),
                    ])),
                    Container(padding: EdgeInsets.only(top: 10)),
                    Expanded(
                        child: Container(
                            width: imagew,
                            height: imageh,
                            padding: EdgeInsets.only(bottom: 20),
                            alignment: Alignment.topLeft,
                            child: Scrollbar(
                                controller: verticalScroll,
                                isAlwaysShown: true,
                                showTrackOnHover: true,
                                thickness: 9,
                                hoverThickness: 9,
                                child: SingleChildScrollView(
                                    controller: verticalScroll,
                                    scrollDirection: Axis.vertical,
                                    physics: BouncingScrollPhysics(),
                                    child: ConstrainedBox(
                                        constraints: BoxConstraints(minWidth: imagew, minHeight: imageh),
                                        child: Container(
                                          width: imagew,
                                          alignment: Alignment.center,
                                          decoration: BoxDecoration(
                                              border: Border.all(width: 1, color: Colors.grey),
                                              borderRadius: BorderRadius.circular(3.0)),
                                          padding: EdgeInsets.all(4),
                                          margin: EdgeInsets.only(top: 4, bottom: 4, right: 16),
                                          child: imageUrl == ""
                                              ? Container()
                                              : ExtendedImage.network(imageUrl,
                                                  headers: {"Referer": "https://www.aliyundrive.com/"},
                                                  fit: BoxFit.contain,
                                                  width: imagew,
                                                  enableLoadState: true,
                                                  filterQuality: FilterQuality.high,
                                                  mode: ExtendedImageMode.none,
                                                  cacheRawData: true, loadStateChanged: (ExtendedImageState state) {
                                                  switch (state.extendedImageLoadState) {
                                                    case LoadState.loading:
                                                      return null;
                                                    case LoadState.completed:
                                                      verticalScroll.animateTo(0,
                                                          duration: Duration(milliseconds: 100),
                                                          curve: Curves.ease); //奇怪这里必须刷新一下才显示
                                                      var img = state.extendedImageInfo!.image;
                                                      if (imageRotate % 2 == 0) {
                                                        //0 2
                                                        return RotatedBox(
                                                            quarterTurns: imageRotate,
                                                            child: ExtendedRawImage(
                                                              image: img,
                                                              width: imagew,
                                                              scale: img.width / imagew,
                                                            ));
                                                      } else {
                                                        //1 3
                                                        return RotatedBox(
                                                            quarterTurns: imageRotate,
                                                            child: ExtendedRawImage(
                                                              image: img,
                                                              height: imagew,
                                                              scale: img.height / imagew,
                                                            ));
                                                      }

                                                    case LoadState.failed:
                                                      BotToast.showText(text: "下载图片失败请手动刷新");
                                                      return null;
                                                  }
                                                }),
                                        )))))),
                  ],
                ),
              )),
            )));
  }

  Widget _buildBtn(IconData icondata, String tip, Function() onPressed) {
    return UnconstrainedBox(
        child: Container(
            width: 30,
            height: 36,
            padding: EdgeInsets.only(top: 6, bottom: 6),
            child: HoverContainer(
                decoration: BoxDecoration(
                    border: Border.all(color: MColors.outlineBtnBorderColor, width: 1.0, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(3.0),
                    color: Colors.transparent),
                hoverDecoration: BoxDecoration(
                    border: Border.all(color: MColors.outlineBtnBorderColor, width: 1.0, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(3.0),
                    color: MColors.userNavMenuBGHover),
                child: IconButton(
                  iconSize: 20,
                  padding: EdgeInsets.all(0),
                  color: MColors.userNavMenuIconHover,
                  icon: Icon(icondata),
                  onPressed: onPressed,
                  tooltip: tip,
                ))));
  }
}
