import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class CreatMiaoChuanBackDialog extends StatelessWidget {
  CreatMiaoChuanBackDialog({Key? key, required this.filename, required this.info}) : super(key: key) {
    controller.text = filename;
  }
  String filename = "";
  String info = "";
  final TextEditingController controller = TextEditingController();

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
                height: 160,
                width: 460,
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
                    Container(
                        child: Text("创建秒传文件",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                      width: 380,
                      child: Stack(
                        children: [
                          TextField(
                            controller: controller,
                            maxLines: 2,
                            autocorrect: false,
                            enableSuggestions: false,
                            style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                            cursorColor: MColors.inputBorderHover,
                            autofocus: false,
                            decoration: InputDecoration(
                              helperText: "创建成功，以后可以粘贴此txt的内容，导入恢复文件",
                              helperStyle: TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans"),
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
                          ),
                          Positioned.directional(
                              textDirection: TextDirection.rtl,
                              start: 0,
                              top: 22,
                              child: Text(
                                info.toUpperCase() + " ",
                                style: TextStyle(fontSize: 13, color: MColors.textColorGray, fontFamily: "opposans"),
                              )),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
            )));
  }
}
