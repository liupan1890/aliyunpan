import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class TextDialog extends StatelessWidget {
  TextDialog({Key? key, required this.box, required this.text}) : super(key: key) {
    controller.text = text;
  }
  String box = "";
  String text = "";
  final verticalScroll = ScrollController();
  final TextEditingController controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    var imagew = size.width * 0.8 - 40;
    var imageh = size.height * 0.9 - 120;
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
                        child: Text("小文本预览(最多显示前100kb)",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        width: imagew,
                        height: imageh,
                        alignment: Alignment.topLeft,
                        child: TextField(
                          controller: controller,
                          scrollController: verticalScroll,
                          maxLines: 48,
                          autocorrect: false,
                          enableSuggestions: false,
                          style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                          cursorColor: MColors.inputBorderHover,
                          autofocus: false,
                          decoration: InputDecoration(
                            contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 2),
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
                        )),
                    Container(
                      width: imagew,
                      margin: EdgeInsets.only(top: 16),
                      alignment: Alignment.topRight,
                      child: ConstrainedBox(
                          constraints: BoxConstraints(minHeight: 31),
                          child: ElevatedButton(
                            child: Text(" 复制全部文字 "),
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: controller.text));
                              Global.getFileState(box).pageSelectFile("");
                              BotToast.showText(text: "复制成功");
                            },
                          )),
                    )
                  ],
                ),
              )),
            )));
  }
}
