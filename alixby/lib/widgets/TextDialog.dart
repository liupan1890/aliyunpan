import 'dart:convert';

import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:extended_image/extended_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class TextDialog extends StatelessWidget {
  TextDialog({Key? key, required this.text}) : super(key: key) {
    controller.text = text;
  }
  String text = "";
  final verticalScroll = ScrollController();
  final TextEditingController controller = TextEditingController();
  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    var imagew = size.width * 0.8 - 40;
    var imageh = size.height * 0.9 - 80;
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
            Container(
                child: Text("小文本预览(仅显示前1万字)", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
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
                    child: TextField(
                      controller: controller,
                      scrollController: verticalScroll,
                      maxLines: 48,
                      autocorrect: false,
                      enableSuggestions: false,
                      style: TextStyle(fontSize: 14, color: MColors.textColor),
                      cursorColor: MColors.inputBorderHover,
                      autofocus: false,
                      decoration: InputDecoration(
                        contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: MColors.inputBorderHover,
                            width: 1,
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: MColors.inputBorderColor,
                            width: 1,
                          ),
                        ),
                      ),
                    ))),
          ],
        ),
      )),
    );
  }
}
