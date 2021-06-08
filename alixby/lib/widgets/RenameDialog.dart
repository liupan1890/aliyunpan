import 'package:alixby/api/AliFile.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

// ignore: must_be_immutable
class RenameDialog extends StatelessWidget {
  // ignore: non_constant_identifier_names
  RenameDialog({Key? key, required this.file_id, required this.file_name}) : super(key: key) {
    controller.text = this.file_name;
  }
  // ignore: non_constant_identifier_names
  String file_id = "";
  // ignore: non_constant_identifier_names
  String file_name = "";
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
            Container(child: Text("重命名", style: TextStyle(fontSize: 20, color: MColors.textColor))),
            Container(
              width: 380,
              margin: EdgeInsets.only(top: 24),
              child: Stack(
                children: [
                  ConstrainedBox(
                      constraints: BoxConstraints(maxHeight: 56, maxWidth: 375),
                      child: TextField(
                        controller: controller,
                        maxLines: 1,
                        autocorrect: false,
                        enableSuggestions: false,
                        style: TextStyle(fontSize: 14, color: MColors.textColor),
                        cursorColor: MColors.inputBorderHover,
                        autofocus: true,
                        decoration: InputDecoration(
                          helperText: "文件名不要有特殊字符：<>!:*?\\/.'\"",
                          helperStyle: TextStyle(fontSize: 13, color: MColors.textColor),
                          contentPadding: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
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
                  Positioned.directional(
                      textDirection: TextDirection.rtl,
                      start: 0,
                      child: ElevatedButton(
                        onPressed: () {
                          String dirname = controller.text;
                          dirname = dirname.replaceAll('"', '').trim();

                          var fcHide = Loading.showLoading();

                          AliFile.apiRename(file_id, dirname).then((value) {
                            fcHide();
                            if (value == "success") {
                              BotToast.showText(text: "重命名成功");
                              Navigator.of(context).pop('ok');
                              Global.panTreeState.pageRefreshNode();
                            } else {
                              BotToast.showText(text: "重命名失败请重试");
                            }
                          });
                        },
                        child: Text("  重命名  "),
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
