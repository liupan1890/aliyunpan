import 'package:alixby/api/AliFile.dart';
import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/widgets/SaveMiaoChuanBackDialog.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';

class SaveMiaoChuanDialog extends StatefulWidget {
  SaveMiaoChuanDialog({Key? key, required this.parentid, required this.parentname}) : super(key: key);
  String parentid = "";
  String parentname = "";

  @override
  _SaveMiaoChuanDialogState createState() => _SaveMiaoChuanDialogState();
}

class _SaveMiaoChuanDialogState extends State<SaveMiaoChuanDialog> {
  final TextEditingController linkcontroller = TextEditingController();
  final TextEditingController pwdcontroller = TextEditingController();
  final verticalScroll = ScrollController();

  @override
  void initState() {
    super.initState();
    Clipboard.getData("text/plain").then((value) {
      if (value != null) {
        var text = value.text;
        if (text != null) {
          if (text.indexOf("密码:") > 0 && text.indexOf("xby") > 0) {
            var pwd = text.substring(text.indexOf("密码:") + "密码:".length).trim();
            if (pwd.length == 4) {
              pwdcontroller.text = pwd;
              text = text.substring(0, text.indexOf("密码:")).trim();
            }
          }
          if (text.indexOf("xby") > 0 || text.indexOf("115://") >= 0) {
            linkcontroller.text = text;
          }
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Center(
          child: Container(
        height: 520,
        width: 500,
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
            Container(child: Text("导入秒传短链接", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
            Container(
                padding: EdgeInsets.only(left: 20, right: 20),
                alignment: Alignment.topLeft,
                child: Column(children: [
                  Padding(padding: EdgeInsets.only(top: 24)),
                  ConstrainedBox(
                    constraints: BoxConstraints(maxHeight: 70, minWidth: double.infinity),
                    child: RichText(
                        textAlign: TextAlign.left,
                        text: TextSpan(style: TextStyle(fontSize: 14, color: MColors.textColor), children: [
                          TextSpan(text: "文件会被保存在当前路径下：", style: TextStyle(color: MColors.textColor)),
                          TextSpan(
                              text: "/网盘根目录" + widget.parentname,
                              style: TextStyle(fontSize: 12, color: MColors.linkColor)),
                        ])),
                  ),
                  Padding(padding: EdgeInsets.only(top: 12)),
                  _buildLink(context),
                  Padding(padding: EdgeInsets.only(top: 24)),
                  _buildCanShu(context),
                  Padding(padding: EdgeInsets.only(top: 32)),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("密码可以为空(未设置密码)，或是4位数字字母组合(区分大小写)",
                        style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                  ),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("短链接举例：https://xby.writeas.com/?t=XXXXXXXX",
                        style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                  ),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("115链接举例：115://文件名|大小|sha1|hash|保存路径",
                        style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                  ),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("秒传短链接一次只能提交一条！115链接可以批量提交",
                        style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                  ),
                ])),
          ],
        ),
      )),
    );
  }

  Widget _buildLink(BuildContext context) {
    return Container(
      alignment: Alignment.topLeft,
      child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: 156, minWidth: double.infinity),
          child: Scrollbar(
              controller: verticalScroll,
              isAlwaysShown: true,
              showTrackOnHover: true,
              thickness: 9,
              hoverThickness: 9,
              child: TextField(
                controller: linkcontroller,
                scrollController: verticalScroll,
                maxLines: 8,
                autocorrect: false,
                enableSuggestions: false,
                style: TextStyle(fontSize: 14, color: MColors.textColor),
                cursorColor: MColors.inputBorderHover,
                autofocus: true,
                decoration: InputDecoration(
                  helperText: "一条短链接 | 多条115链接",
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
              ))),
    );
  }

  Widget _buildCanShu(BuildContext context) {
    return Container(
      alignment: Alignment.topLeft,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            child: ConstrainedBox(
                constraints: BoxConstraints(maxHeight: 56, maxWidth: 120),
                child: TextField(
                  controller: pwdcontroller,
                  maxLines: 1,
                  maxLength: 4,
                  autocorrect: false,
                  enableSuggestions: false,
                  style: TextStyle(fontSize: 14, color: MColors.textColor),
                  cursorColor: MColors.inputBorderHover,
                  autofocus: false,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp("[0-9a-zA-Z]")), //只允许输入数字字母
                  ],
                  decoration: InputDecoration(
                    hintText: "无",
                    helperText: "密码",
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
          ),
          Padding(padding: EdgeInsets.only(left: 24)),
          Expanded(child: Container()),
          Padding(padding: EdgeInsets.only(left: 24)),
          ElevatedButton(
            onPressed: () {
              String link = linkcontroller.text;
              String pwd = pwdcontroller.text;
              var fcHide = Loading.showLoading();

              Linker.goLinkParse(link, pwd).then((value) {
                fcHide();
                if (value.hash == "") {
                  Navigator.of(context).pop('ok');
                  BotToast.showText(text: "解析链接成功");
                  Global.pageRssMiaoChuanState.refreshLink();
                  showDialog(
                      barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                      context: context,
                      builder: (context) {
                        return WillPopScope(
                            onWillPop: () async => false, //关键代码
                            child: SaveMiaoChuanBackDialog(parentid: widget.parentid, link: value));
                      });
                } else {
                  BotToast.showText(text: "解析链接失败：" + value.hash);
                }
              });
            },
            child: Text("  解析链接  "),
            style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
          ),
        ],
      ),
    );
  }
}
