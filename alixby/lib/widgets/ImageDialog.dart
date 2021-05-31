import 'dart:convert';

import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:extended_image/extended_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class ImageDialog extends StatelessWidget {
  ImageDialog({Key? key, required this.imageUrl}) : super(key: key);
  String imageUrl = "";
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    return Material(
      type: MaterialType.transparency,
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
                      child: Icon(MIcons.close, size: 18),
                      onTap: () => Navigator.of(context).pop('ok'),
                    ))),
            Container(child: Text("图片预览", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
            Container(
                width: size.width * 0.8 - 40,
                height: size.height * 0.9 - 80,
                margin: EdgeInsets.only(top: 20),
                child: ExtendedImage.network(
                  imageUrl,
                  headers: {"Referer": "https://www.aliyundrive.com/"},
                  fit: BoxFit.contain,
                  border: Border.all(color: Colors.grey, width: 1.0),
                  borderRadius: BorderRadius.all(Radius.circular(6.0)),
                  cache: true,
                  //enableLoadState: false,
                  mode: ExtendedImageMode.gesture,
                  initGestureConfigHandler: (state) {
                    return GestureConfig(
                      minScale: 1.0,
                      animationMinScale: 1.0,
                      maxScale: 2.0,
                      animationMaxScale: 2.0,
                      speed: 1.0,
                      inertialSpeed: 100.0,
                      initialScale: 1.0,
                      inPageView: false,
                      initialAlignment: InitialAlignment.center,
                    );
                  },
                )),
          ],
        ),
      )),
    );
  }
}
