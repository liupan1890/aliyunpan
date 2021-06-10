import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:extended_image/extended_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

// ignore: must_be_immutable
class ImageDialog extends StatelessWidget {
  ImageDialog({Key? key, required this.imageUrl}) : super(key: key);
  String imageUrl = "";
  final verticalScroll = ScrollController();
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    var imagew = size.width * 0.8 - 40;
    var imageh = size.height * 0.9 - 80;
    return Material(
        type: MaterialType.transparency,
        child: DefaultTextStyle(
          //1.设置文本默认样式
          style: TextStyle(color: MColors.textColor),
          child: Center(
              child: Container(
            height: size.height * 0.9,
            width: size.width * 0.8,
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
                Container(child: Text("图片预览", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
                Container(
                    width: imagew,
                    height: imageh,
                    margin: EdgeInsets.only(top: 20),
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
                                    alignment: Alignment.topCenter,
                                    decoration: BoxDecoration(
                                        border: Border.all(width: 1, color: Colors.grey),
                                        borderRadius: BorderRadius.circular(6.0)),
                                    padding: EdgeInsets.all(4),
                                    margin: EdgeInsets.only(right: 16),
                                    child: ExtendedImage.network(imageUrl,
                                        headers: {"Referer": "https://www.aliyundrive.com/"},
                                        fit: BoxFit.none,
                                        filterQuality: FilterQuality.high,
                                        cache: true,
                                        //enableLoadState: false,
                                        mode: ExtendedImageMode.none, loadStateChanged: (ExtendedImageState state) {
                                      switch (state.extendedImageLoadState) {
                                        case LoadState.loading:
                                          return null;
                                        case LoadState.completed:
                                          verticalScroll.animateTo(1,
                                              duration: Duration(milliseconds: 100),
                                              curve: Curves.ease); //奇怪这里必须刷新一下才显示
                                          return ExtendedRawImage(image: state.extendedImageInfo?.image);
                                        case LoadState.failed:
                                          return null;
                                      }
                                    })))))),
              ],
            ),
          )),
        ));
  }
}
