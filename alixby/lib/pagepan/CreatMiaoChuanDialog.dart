import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagepan/CreatMiaoChuanBackDialog.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class CreatMiaoChuanDialog extends StatefulWidget {
  CreatMiaoChuanDialog(
      {Key? key, required this.box, required this.parentid, required String parentname, required this.filelist})
      : super(key: key) {
    var dt = DateTime.now();

    if (filelist.length == 1) {}

    savename = '秒传_' +
        parentname +
        "_" +
        "${dt.year.toString()}${dt.month.toString().padLeft(2, '0')}${dt.day.toString().padLeft(2, '0')}" +
        ".txt";
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
                height: 400,
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
                          _buildCanShu(context),
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

  Widget _buildCanShu(BuildContext context) {
    return Container(
      alignment: Alignment.topLeft,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
              child: ConstrainedBox(
                  constraints: BoxConstraints(maxHeight: 60, maxWidth: 20),
                  child: TextField(
                    controller: pwdcontroller,
                    maxLines: 1,
                    maxLength: 60,
                    autocorrect: false,
                    enableSuggestions: false,
                    style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                    cursorColor: MColors.inputBorderHover,
                    autofocus: false,
                    decoration: InputDecoration(
                      helperText: "填写要保存到网盘里的文件名(.txt)",
                      helperStyle: TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans"),
                      contentPadding: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: MColors.inputBorderHover,
                          width: 1,
                        ),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: MColors.inputBorderHover,
                          width: 1,
                        ),
                      ),
                    ),
                  ))),
          Padding(padding: EdgeInsets.only(left: 24)),
          ElevatedButton(
            onPressed: () {
              String filename = pwdcontroller.text;
              if (filename.length < 1) {
                BotToast.showText(text: "保存的文件名不能为空", align: Alignment(0, 0));
                return;
              }
              if (filename.endsWith(".txt") == false) filename = filename + ".txt";
              filename = filename.replaceAll("..", ".").replaceAll("\"", "");
              var fcHide = Loading.showLoading();

              Linker.goLinkCreatFile(filename, "", widget.box, widget.parentid, widget.filelist).then((value) {
                fcHide();
                if (value.length > 1) {
                  Navigator.of(context).pop('ok');
                  BotToast.showText(text: "创建文件成功");
                  Future.delayed(Duration(milliseconds: 200), () {
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
            child: Text("生成文件"),
            style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
          ),
        ],
      ),
    );
  }
}
