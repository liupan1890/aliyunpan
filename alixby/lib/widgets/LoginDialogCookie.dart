import 'package:alixby/api/AliLogin.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:url_launcher/url_launcher.dart';

import 'LoginDialog.dart';

class LoginDialogCookie extends StatelessWidget {
  LoginDialogCookie({
    Key? key,
  }) : super(key: key);
  final TextEditingController controller = TextEditingController();
  @override
  Widget build(BuildContext context) {
    return Material(
        type: MaterialType.transparency,
        child: DefaultTextStyle(
          //1.设置文本默认样式
          style: TextStyle(color: MColors.textColor),
          child: Center(
              child: Container(
            height: 400,
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
                Container(child: Text("请用阿里云盘网页版 Cookie 登录", style: TextStyle(fontSize: 20, color: MColors.textColor))),
                Container(
                    width: 380,
                    margin: EdgeInsets.only(top: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                            margin: EdgeInsets.only(top: 4, bottom: 4),
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: TextStyle(fontSize: 14, color: MColors.textColor), children: [
                                  TextSpan(text: "点击观看  ==> ", style: TextStyle(color: MColors.textColor)),
                                  WidgetSpan(
                                      child: Linkify(
                                          onOpen: (link) {
                                            launch(Uri.encodeFull(link.url));
                                          },
                                          text: "操作录像",
                                          linkifiers: [
                                            FileLinkifier("操作录像",
                                                "https://p.pstatp.com/origin/pgc-image/cb86a7d7227449d481c32df6677f3461")
                                          ],
                                          linkStyle: TextStyle(
                                              fontSize: 14,
                                              color: MColors.linkColor,
                                              decoration: TextDecoration.none))),
                                ]))),
                        Container(
                            margin: EdgeInsets.only(top: 4, bottom: 4),
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: TextStyle(fontSize: 14, color: MColors.textColor), children: [
                                  TextSpan(text: "第1步：点击登录云盘网页版 ==> ", style: TextStyle(color: MColors.textColor)),
                                  WidgetSpan(
                                      child: Linkify(
                                          onOpen: (link) {
                                            launch(Uri.encodeFull(link.url));
                                          },
                                          text: "aliyundrive.com",
                                          linkifiers: [
                                            FileLinkifier("aliyundrive.com",
                                                "https://www.aliyundrive.com/sign/in?spm=aliyundrive.index.0.0.2d836020dtzo9Z")
                                          ],
                                          linkStyle: TextStyle(
                                              fontSize: 14,
                                              color: MColors.linkColor,
                                              decoration: TextDecoration.none))),
                                ]))),
                        Container(
                            margin: EdgeInsets.only(top: 4, bottom: 4),
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: TextStyle(fontSize: 14, color: MColors.textColor), children: [
                                  TextSpan(text: "第2步：按下键盘", style: TextStyle(color: MColors.textColor)),
                                  TextSpan(text: "F12", style: TextStyle(color: Color(0xffdf5659))),
                                  TextSpan(text: "键，打开网页控制台", style: TextStyle(color: MColors.textColor)),
                                ]))),
                        Container(
                            margin: EdgeInsets.only(top: 4, bottom: 4),
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: TextStyle(fontSize: 14, color: MColors.textColor), children: [
                                  TextSpan(text: "第3步：单击复制下面命令，粘贴到控制台，并按下", style: TextStyle(color: MColors.textColor)),
                                  TextSpan(text: "回车", style: TextStyle(color: Color(0xffdf5659))),
                                  TextSpan(text: "键", style: TextStyle(color: MColors.textColor)),
                                ]))),
                        Container(
                          margin: EdgeInsets.only(top: 4, bottom: 4),
                          child: Tooltip(
                              message: "点击自动复制",
                              child: OutlinedButton(
                                  onPressed: () {
                                    Clipboard.setData(
                                        ClipboardData(text: 'JSON.parse(window.localStorage["token"]).refresh_token'));
                                    BotToast.showText(text: "已复制", align: Alignment(0, 0));
                                  },
                                  style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(380, 32))),
                                  child: Text(
                                    'JSON.parse(window.localStorage["token"]).refresh_token',
                                    style: TextStyle(color: Colors.greenAccent.shade400, fontSize: 14),
                                    textAlign: TextAlign.left,
                                  ))),
                        ),
                        Container(
                            margin: EdgeInsets.only(top: 4, bottom: 4),
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: TextStyle(fontSize: 14, color: MColors.textColor), children: [
                                  TextSpan(text: "第4步：复制返回的32位字符串，粘贴到下面", style: TextStyle(color: MColors.textColor)),
                                ]))),
                        Stack(
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
                                  decoration: InputDecoration(
                                    helperText: "例如：ea9876501fac462291618bbec834450f",
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
                                    String token = controller.text;
                                    token = token.replaceAll('"', '').trim();
                                    if (token.length != 32) {
                                      BotToast.showText(text: "refresh_token 应该是长度为32位的字符串！！", align: Alignment(0, 0));
                                      controller.clear();
                                    } else {
                                      var fcHide = Loading.showLoading();
                                      AliLogin.apiTokenRefresh(token).then((value) {
                                        fcHide();
                                        if (value == "success") {
                                          Global.userState.loadUser();
                                          BotToast.showText(text: "登录成功");
                                          Navigator.of(context).pop('ok');
                                        } else {
                                          BotToast.showText(text: "登录失败请重试");
                                        }
                                      });
                                    }
                                  },
                                  child: Text("  登录  "),
                                  style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
                                )),
                          ],
                        ),
                      ],
                    )),
                Container(
                    padding: EdgeInsets.only(top: 8),
                    child: TextButton(
                        child: Text("扫码登录", style: TextStyle(color: MColors.linkColor)),
                        onPressed: () {
                          Navigator.of(context).pop('ok');
                          showDialog(
                              barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                              context: context,
                              builder: (context) {
                                return LoginDialog();
                              });
                        })),
              ],
            ),
          )),
        ));
  }
}
