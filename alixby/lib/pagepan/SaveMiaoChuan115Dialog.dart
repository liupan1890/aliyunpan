import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagepan/SaveMiaoChuanBackDialog.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class SaveMiaoChuan115Dialog extends StatefulWidget {
  SaveMiaoChuan115Dialog({Key? key, required this.box, required this.parentid, required this.parentname})
      : super(key: key) {
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
  _SaveMiaoChuan115DialogState createState() => _SaveMiaoChuan115DialogState();
}

class _SaveMiaoChuan115DialogState extends State<SaveMiaoChuan115Dialog> {
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
    Clipboard.getData("text/plain").then((value) {
      if (value != null) {
        var text = value.text;
        if (text != null) {
          if (text.indexOf("aliyunpan://") > 0 || text.indexOf("115://") >= 0) {
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
                height: 500,
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
                        child: Text("导入秒传链接",
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
                                            text: "多条115://秒传链接 ",
                                            style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                        TextSpan(
                                            text: "115://文件名.mp4|大小|sha1|hash|",
                                            style: TextStyle(
                                                fontSize: 12, color: MColors.textColorRed, fontFamily: "opposans")),
                                        TextSpan(
                                            text: "\n多条aliyunpan://秒传链接 ",
                                            style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                        TextSpan(
                                            text: "aliyunpan://文件名.mp4|sha1|大小|",
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
                maxLines: 10,
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
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
              width: 200 * double.parse(context.watch<SettingState>().setting.textScale),
              padding: EdgeInsets.only(right: 8),
              alignment: Alignment.topLeft,
              child: CheckboxListTile(
                tristate: true,
                dense: true,
                tileColor: Colors.transparent,
                contentPadding: EdgeInsets.all(0),
                selectedTileColor: Colors.transparent,
                checkColor: Colors.white,
                activeColor: MColors.inputBorderHover,
                title: Text(
                  '发布到聚合搜索？(默认否)',
                  style: TextStyle(
                      fontSize: 13,
                      color: isPublic ? MColors.inputBorderHover : MColors.textColor,
                      fontFamily: "opposans"),
                ),
                value: (isPublic ? true : null),
                selected: isPublic,
                onChanged: (bool? value) {
                  isPublic = !isPublic;
                  setState(() {});
                },
              )),
          Expanded(child: Container()),
          ElevatedButton(
            onPressed: () {
              String link = linkcontroller.text;
              String pwd = pwdcontroller.text;
              var fcHide = Loading.showLoading();

              Linker.goLinkParse(link, pwd, isPublic).then((value) {
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
                            child: SaveMiaoChuanBackDialog(
                                box: widget.box, boxname: widget.boxname, parentid: widget.parentid, link: value));
                      });
                } else {
                  BotToast.showText(text: "解析链接失败：" + value.hash);
                }
              });
            },
            child: Text("  解析链接  "),
            style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
          ),
        ],
      ),
    );
  }
}
