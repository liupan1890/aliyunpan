import 'package:alixby/api/AliFile.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';

class CreatMiaoChuanBackDialog extends StatelessWidget {
  CreatMiaoChuanBackDialog({Key? key, required this.link}) : super(key: key) {
    controller.text = link;
  }
  String link = "";
  final TextEditingController controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Center(
          child: Container(
        height: 200,
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
                      child: Icon(MIcons.close, size: 18),
                      onTap: () => Navigator.of(context).pop('ok'),
                    ))),
            Container(child: Text("新建秒传短链接", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
            Container(
              width: 380,
              height: 120,
              margin: EdgeInsets.only(top: 24),
              child: Stack(
                children: [
                  TextField(
                    controller: controller,
                    maxLines: 2,
                    autocorrect: false,
                    enableSuggestions: false,
                    style: TextStyle(fontSize: 14, color: MColors.textColor),
                    cursorColor: MColors.inputBorderHover,
                    autofocus: false,
                    decoration: InputDecoration(
                      helperText: "秒传短链接创建成功,复制后发出去吧",
                      helperStyle: TextStyle(fontSize: 13, color: MColors.textColor),
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
                      top: 80,
                      child: ElevatedButton(
                        onPressed: () {
                          String dirname = controller.text;
                          dirname = dirname.replaceAll('"', '').trim();
                          Clipboard.setData(ClipboardData(text: dirname));
                          BotToast.showText(text: "已复制");
                        },
                        child: Text("  复制  "),
                        style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
                      )),
                ],
              ),
            ),
          ],
        ),
      )),
    );
  }
}
