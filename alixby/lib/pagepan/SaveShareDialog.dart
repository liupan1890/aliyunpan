import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagepan/SaveMiaoChuanBackDialog.dart';
import 'package:alixby/utils/SpinKitRing.dart';
import 'package:argon_buttons_flutter/argon_buttons_flutter.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class SaveShareDialog extends StatefulWidget {
  SaveShareDialog({Key? key, required this.box, required this.parentid, required this.parentname}) : super(key: key) {
    if (box == "box")
      boxname = "网盘";
    else if (box == "sbox")
      boxname = "保险箱";
    else if (box == "xiangce") boxname = "相册";
  }
  String box = "";
  String boxname = "";
  String parentid = "";
  String parentname = "";

  @override
  _SaveShareDialogState createState() => _SaveShareDialogState();
}

class _SaveShareDialogState extends State<SaveShareDialog> {
  final TextEditingController linkcontroller = TextEditingController();
  final TextEditingController pwdcontroller = TextEditingController();
  final verticalScroll = ScrollController();
  @override
  void dispose() {
    verticalScroll.dispose();
    linkcontroller.dispose();
    pwdcontroller.dispose();
    super.dispose();
  }

  bool isPublic = false;
  @override
  void initState() {
    super.initState();
    //https://115.com/s/swnfmss3zbk?password=0000
    //https://www.aliyundrive.com/s/FGtXkA5SVZM
    Clipboard.getData("text/plain").then((value) {
      if (value != null) {
        var text = value.text;
        if (text != null) {
          if (text.indexOf("115.com/s/") > 0 || text.indexOf("aliyundrive.com/s/") > 0) {
            text = text.replaceAll("?password=", "密码:"); //115
            text = text.replaceAll("访问码：", "密码:"); //115
            text = text.replaceAll("提取码：", "密码:"); //115
            text = text.replaceAll("密码：", "密码:"); //115
          }
          if (text.indexOf("密码:") > 0) {
            var pwd = text.substring(text.indexOf("密码:") + "密码:".length).trim();
            if (text.indexOf("115.com/s/") > 0) {
              pwd = pwd.substring(0, 4); //115是4位密码
            } else if (text.indexOf("aliyundrive.com/s/") > 0) {
              pwd = pwd.substring(0, 4); //ali是4位密码
            }

            if (pwd.length == 4) {
              pwdcontroller.text = pwd;
              text = text.substring(0, text.indexOf("密码:")).trim();
            }
          }
          if (text.indexOf("115.com/s/") > 0 || text.indexOf("aliyundrive.com/s/") > 0) {
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
        child: MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaleFactor: double.parse(context.watch<SettingState>().setting.textScale)),
            child: DefaultTextStyle(
              //1.设置文本默认样式
              style: TextStyle(color: MColors.textColor, fontFamily: "opposans"),
              child: Center(
                  child: Container(
                height: 330,
                width: 520,
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
                        child: Text("导入115 / 阿里云盘分享链接",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        padding: EdgeInsets.only(left: 20, right: 20),
                        alignment: Alignment.topLeft,
                        child: Column(children: [
                          ConstrainedBox(
                            constraints: BoxConstraints(maxHeight: 70, minWidth: double.infinity),
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(
                                    style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                                    children: [
                                      TextSpan(
                                          text: "文件会被保存在当前路径下：",
                                          style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                      TextSpan(
                                          text: "/" + widget.boxname + "根目录" + widget.parentname,
                                          style: TextStyle(
                                              fontSize: 12, color: MColors.linkColor, fontFamily: "opposans")),
                                    ])),
                          ),
                          Padding(padding: EdgeInsets.only(top: 12)),
                          _buildLink(context),
                          Padding(padding: EdgeInsets.only(top: 4)),
                          Container(
                              alignment: Alignment.topLeft,
                              child: RichText(
                                  textAlign: TextAlign.left,
                                  text: TextSpan(
                                      style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                                      children: [
                                        TextSpan(
                                            text: "一条 阿里云盘分享 ",
                                            style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                        TextSpan(
                                            text: "https://www.aliyundrive.com/s/xxxxxxxxxxx\n",
                                            style: TextStyle(
                                                fontSize: 12, color: MColors.textColorRed, fontFamily: "opposans")),
                                        TextSpan(
                                            text: "一条 115分享链接 ",
                                            style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                        TextSpan(
                                            text: "https://115.com/s/sssssssssss",
                                            style: TextStyle(
                                                fontSize: 12, color: MColors.textColorRed, fontFamily: "opposans")),
                                      ]))),
                          Padding(padding: EdgeInsets.only(top: 24)),
                          _buildCanShu(context),
                        ])),
                  ],
                ),
              )),
            )));
  }

  Widget _buildLink(BuildContext context) {
    return Container(
      alignment: Alignment.topLeft,
      child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: 60, minWidth: double.infinity),
          child: Scrollbar(
              controller: verticalScroll,
              isAlwaysShown: true,
              showTrackOnHover: true,
              thickness: 9,
              hoverThickness: 9,
              child: TextField(
                controller: linkcontroller,
                scrollController: verticalScroll,
                maxLines: 3,
                autocorrect: false,
                enableSuggestions: false,
                style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                cursorColor: MColors.inputBorderHover,
                autofocus: true,
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
                constraints: BoxConstraints(maxHeight: 60, maxWidth: 120),
                child: TextField(
                  controller: pwdcontroller,
                  maxLines: 1,
                  maxLength: 4,
                  autocorrect: false,
                  enableSuggestions: false,
                  style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                  cursorColor: MColors.inputBorderHover,
                  autofocus: false,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp("[0-9a-zA-Z]")), //只允许输入数字字母
                  ],
                  decoration: InputDecoration(
                    hintText: "无",
                    hintStyle: TextStyle(fontSize: 13, color: MColors.textColorGray, fontFamily: "opposans"),
                    helperText: "密码",
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
                )),
          ),
          Padding(padding: EdgeInsets.only(left: 24)),
          Expanded(child: Container()),
          Padding(padding: EdgeInsets.only(left: 24)),
          ArgonButton(
            height: 32,
            width: 90,
            minWidth: 90,
            borderRadius: 3.0,
            roundLoadingShape: false,
            color: MColors.elevatedBtnBG,
            child: Text(
              "解析链接",
              style: TextStyle(color: MColors.elevatedBtnColor, fontFamily: "opposans"),
            ),
            loader: Container(
              child: SpinKitRing(
                size: 22,
                lineWidth: 3,
                color: Colors.white,
              ),
            ),
            onTap: (startLoading, stopLoading, btnState) {
              String link = linkcontroller.text;
              String pwd = pwdcontroller.text;
              if (btnState == ButtonState.Busy) return;
              startLoading();

              Linker.goLinkShare(link, pwd, isPublic).then((value) {
                stopLoading();
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
                            child: SaveMiaoChuanBackDialog(
                                box: widget.box, boxname: widget.boxname, parentid: widget.parentid, link: value));
                      });
                } else {
                  BotToast.showText(text: "解析链接失败：" + value.hash);
                }
              });
            },
          ),
        ],
      ),
    );
  }
}
