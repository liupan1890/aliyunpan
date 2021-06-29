import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagepan/CreatMiaoChuanBackDialog.dart';
import 'package:alixby/utils/SpinKitRing.dart';
import 'package:argon_buttons_flutter/argon_buttons_flutter.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:filesize/filesize.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class CreatMiaoChuanDialog extends StatefulWidget {
  CreatMiaoChuanDialog(
      {Key? key,
      required this.box,
      required this.parentid,
      required String parentname,
      required this.filelist,
      required int fileCount,
      required int fileSize})
      : super(key: key) {
    var dt = DateTime.now();

    if (filelist.length == 1) {}

    if (fileSize > 0) {
      savename = '秒传_' +
          parentname +
          "_" +
          filesize(fileSize, 0).replaceAll(" ", "") +
          "_" +
          "${dt.year.toString()}${dt.month.toString().padLeft(2, '0')}${dt.day.toString().padLeft(2, '0')}" +
          ".txt";
    } else {
      savename = '秒传_' +
          parentname +
          "_" +
          "${dt.year.toString()}${dt.month.toString().padLeft(2, '0')}${dt.day.toString().padLeft(2, '0')}" +
          ".txt";
    }
  }
  String box = "";
  String parentid = "";
  String savename = "";
  List<String> filelist = [];

  @override
  _CreatMiaoChuanDialogState createState() => _CreatMiaoChuanDialogState();
}

class _CreatMiaoChuanDialogState extends State<CreatMiaoChuanDialog> {
  final TextEditingController pwdcontroller = TextEditingController();
  @override
  void dispose() {
    pwdcontroller.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    pwdcontroller.text = widget.savename;
  }

  @override
  Widget build(BuildContext context) {
    var stylegray = TextStyle(color: MColors.pageLeftRowHeadColor, fontSize: 13, fontFamily: "opposans");
    var stylered = TextStyle(color: Color(0xccdf5659), fontFamily: "opposans");
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
                height: 460,
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
                        child: Text("创建秒传文件(txt)",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        padding: EdgeInsets.only(left: 20, right: 20),
                        alignment: Alignment.topLeft,
                        child: Column(children: [
                          Padding(padding: EdgeInsets.only(top: 12)),
                          Container(
                            alignment: Alignment.topLeft,
                            child: Text("为选中的 " + widget.filelist.length.toString() + " 个文件/文件夹创建秒传文件"),
                          ),
                          Padding(padding: EdgeInsets.only(top: 24)),
                          Container(
                              child: TextField(
                            controller: pwdcontroller,
                            minLines: 1,
                            maxLines: 4,
                            scrollPhysics: NeverScrollableScrollPhysics(),
                            autocorrect: false,
                            enableSuggestions: false,
                            style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                            cursorColor: MColors.inputBorderHover,
                            autofocus: true,
                            decoration: InputDecoration(
                              helperText: "填写要保存到网盘里的文件名(.txt)",
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
                          Container(
                              alignment: Alignment.bottomRight,
                              child: ArgonButton(
                                height: 32,
                                width: 120,
                                minWidth: 120,
                                borderRadius: 3.0,
                                roundLoadingShape: false,
                                color: MColors.elevatedBtnBG,
                                child: Text(
                                  "创建秒传文件",
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
                                  String filename = pwdcontroller.text;
                                  if (filename.length < 1) {
                                    BotToast.showText(text: "保存的文件名不能为空", align: Alignment(0, 0));
                                    return;
                                  }
                                  if (filename.endsWith(".txt") == false) filename = filename + ".txt";
                                  filename = filename.replaceAll("..", ".").replaceAll("\"", "");
                                  if (btnState == ButtonState.Busy) return;
                                  startLoading();
                                  Linker.goLinkCreatFile(filename, "", widget.box, widget.parentid, widget.filelist)
                                      .then((value) {
                                    stopLoading();
                                    if (value.length > 1) {
                                      Navigator.of(context).pop('ok');
                                      BotToast.showText(text: "创建文件成功");
                                      Future.delayed(Duration(milliseconds: 600), () {
                                        Global.getTreeState(widget.box).pageRefreshNode();
                                      });
                                      showDialog(
                                          barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                                          context: context,
                                          builder: (context) {
                                            return WillPopScope(
                                                onWillPop: () async => false, //关键代码
                                                child: CreatMiaoChuanBackDialog(filename: filename, info: value[0]));
                                          });
                                    } else {
                                      BotToast.showText(text: "创建失败：" + value[0]);
                                    }
                                  });
                                },
                              )),
                          Padding(padding: EdgeInsets.only(top: 24)),
                          Padding(padding: EdgeInsets.only(top: 32)),
                          Container(
                            alignment: Alignment.topLeft,
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: stylegray, children: [
                                  TextSpan(text: "就是把选中的文件 (", style: stylegray),
                                  TextSpan(text: "文件名 / sha1 / 文件夹结构", style: stylered),
                                  TextSpan(text: ") 保存到一个txt文件里。之后你可以删除选中的文件，释放网盘空间。", style: stylegray),
                                ])),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          Container(
                            alignment: Alignment.topLeft,
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: stylegray, children: [
                                  TextSpan(text: "等以后需要用到这些文件时再重新瞬间导入，恢复这些文件和文件夹", style: stylegray),
                                ])),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          Container(
                            alignment: Alignment.topLeft,
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: stylegray, children: [
                                  TextSpan(text: "如果选中了很多文件夹时，会自动遍历", style: stylegray),
                                  TextSpan(text: "全部子文件", style: stylered),
                                  TextSpan(text: "，可能会耗时很长", style: stylegray),
                                ])),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          Container(
                            alignment: Alignment.topLeft,
                            child: RichText(
                                textAlign: TextAlign.left,
                                text: TextSpan(style: stylegray, children: [
                                  TextSpan(text: "保护用户隐私声明：\n", style: stylered),
                                  TextSpan(text: "创建秒传文件时只会把sha1保存到", style: stylegray),
                                  TextSpan(text: "你的网盘里", style: stylered),
                                  TextSpan(text: "！", style: stylegray),
                                  TextSpan(text: "不会", style: stylered),
                                  TextSpan(text: "联网发送其他", style: stylegray),
                                  TextSpan(text: "数据。所以不会", style: stylegray),
                                  TextSpan(text: "泄露隐私。只有", style: stylegray),
                                  TextSpan(text: "你自己", style: stylered),
                                  TextSpan(text: "要把此文件", style: stylegray),
                                  TextSpan(text: "分享", style: stylered),
                                  TextSpan(text: "出去时，才需要注意", style: stylegray),
                                ])),
                          ),
                        ])),
                  ],
                ),
              )),
            )));
  }
}
