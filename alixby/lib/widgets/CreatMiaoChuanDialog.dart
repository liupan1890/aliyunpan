import 'package:alixby/api/AliFile.dart';
import 'package:alixby/api/Linker.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/widgets/CreatMiaoChuanBackDialog.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';

class CreatMiaoChuanDialog extends StatefulWidget {
  CreatMiaoChuanDialog({Key? key, required this.parentid, required this.filelist}) : super(key: key);
  String parentid = "";
  List<String> filelist = [];

  @override
  _CreatMiaoChuanDialogState createState() => _CreatMiaoChuanDialogState();
}

class _CreatMiaoChuanDialogState extends State<CreatMiaoChuanDialog> {
  final TextEditingController pwdcontroller = TextEditingController();
  final TextEditingController jianjiecontroller = TextEditingController();
  String outDay = "0";
  String outSave = "0";
  bool isPublic = false;
  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: Center(
          child: Container(
        height: 440,
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
            Container(child: Text("新建秒传短链接", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
            Container(
                padding: EdgeInsets.only(left: 20, right: 20),
                alignment: Alignment.topLeft,
                child: Column(children: [
                  Padding(padding: EdgeInsets.only(top: 32)),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("为选中的 " + widget.filelist.length.toString() + " 个文件/文件夹创建一条秒传短链接"),
                  ),
                  Padding(padding: EdgeInsets.only(top: 24)),
                  _buildCanShu(context),
                  Padding(padding: EdgeInsets.only(top: 24)),
                  TextField(
                    controller: jianjiecontroller,
                    maxLines: 1,
                    maxLength: 40,
                    autocorrect: false,
                    enableSuggestions: false,
                    style: TextStyle(fontSize: 14, color: MColors.textColor),
                    cursorColor: MColors.inputBorderHover,
                    autofocus: false,
                    decoration: InputDecoration(
                      hintText: "这里可以空着,也可以备注一句话",
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
                  ),
                  Container(
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
                          '是否把链接公布到聚合搜索中？(默认否)',
                          style:
                              TextStyle(fontSize: 14, color: isPublic ? MColors.inputBorderHover : MColors.textColor),
                        ),
                        value: (isPublic ? true : null),
                        selected: isPublic,
                        onChanged: (bool? value) {
                          isPublic = !isPublic;
                          setState(() {});
                        },
                      )),
                  Padding(padding: EdgeInsets.only(top: 48)),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("密码可以为空(不设置密码)，或是4位数字字母组合(区分大小写)",
                        style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                  ),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("选中了文件夹时，会自动遍历全部子文件，可能会耗时很长",
                        style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                  ),
                  Container(
                    alignment: Alignment.topLeft,
                    child: Text("短链接举例：https://xby.writeas.com/?t=XXXXXXXX",
                        style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                  ),
                  Container(
                    alignment: Alignment.topLeft,
                    child: RichText(
                        textAlign: TextAlign.left,
                        text: TextSpan(style: TextStyle(fontSize: 13, color: MColors.pageLeftRowHeadColor), children: [
                          TextSpan(text: "隐私警告：", style: TextStyle(color: Color(0xffdf5659), fontSize: 16)),
                          TextSpan(
                              text: "创建时会把(sha1|size|name)同步到服务器！\n",
                              style: TextStyle(color: MColors.pageLeftRowHeadColor)),
                          TextSpan(text: "请不要分享任何  ", style: TextStyle(color: MColors.pageLeftRowHeadColor)),
                          TextSpan(text: "个人文件、重要文件、隐私文件等等！！", style: TextStyle(color: Color(0xccdf5659))),
                        ])),
                  ),
                ])),
          ],
        ),
      )),
    );
  }

  Widget _buildCanShu(BuildContext context) {
    return Container(
      alignment: Alignment.topLeft,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          UnconstrainedBox(
              child: Container(
                  height: 30,
                  padding: EdgeInsets.only(left: 7, right: 5),
                  alignment: Alignment.centerLeft,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3.0), //3像素圆角
                    border: Border.all(
                      color: MColors.inputBorderColor,
                      width: 1.0,
                    ),
                  ),
                  child: DropdownButton<String>(
                      isDense: true,
                      itemHeight: 32,
                      elevation: 0,
                      value: outDay,
                      underline: Container(height: 0),
                      dropdownColor: MColors.userNavMenuBG,
                      onChanged: (String? newValue) {
                        if (newValue != null) {
                          outDay = newValue;
                          setState(() {});
                          print(newValue);
                        }
                      },
                      items: [
                        DropdownMenuItem<String>(
                            value: "0", child: Text('永久有效', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                        DropdownMenuItem<String>(
                            value: "31",
                            child: Text('31天后失效', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                        DropdownMenuItem<String>(
                            value: "7", child: Text('7天后失效', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                        DropdownMenuItem<String>(
                            value: "1", child: Text('1天后失效', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                      ]))),
          Padding(padding: EdgeInsets.only(left: 24)),
          UnconstrainedBox(
              child: Container(
                  height: 30,
                  padding: EdgeInsets.only(left: 7, right: 5),
                  alignment: Alignment.centerLeft,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(3.0), //3像素圆角
                    border: Border.all(
                      color: MColors.inputBorderColor,
                      width: 1.0,
                    ),
                  ),
                  child: DropdownButton<String>(
                      isDense: true,
                      itemHeight: 32,
                      elevation: 0,
                      value: outSave,
                      underline: Container(height: 0),
                      dropdownColor: MColors.userNavMenuBG,
                      onChanged: (String? newValue) {
                        if (newValue != null) {
                          outSave = newValue;
                          setState(() {});
                          print(newValue);
                        }
                      },
                      items: [
                        DropdownMenuItem<String>(
                            value: "0", child: Text('不限次数', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                        DropdownMenuItem<String>(
                            value: "100",
                            child: Text('可转存100次', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                        DropdownMenuItem<String>(
                            value: "50",
                            child: Text('可转存50次', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                        DropdownMenuItem<String>(
                            value: "10",
                            child: Text('可转存10次', style: TextStyle(fontSize: 14, color: MColors.textColor))),
                      ]))),
          Padding(padding: EdgeInsets.only(left: 24)),
          Expanded(
              child: ConstrainedBox(
                  constraints: BoxConstraints(maxHeight: 56, maxWidth: 20),
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
                  ))),
          Padding(padding: EdgeInsets.only(left: 24)),
          ElevatedButton(
            onPressed: () {
              String password = pwdcontroller.text;
              if (password != "" && password.length != 4) {
                BotToast.showText(text: "密码必须是空的或者是4位数字字母组合", align: Alignment(0, 0));
                return;
              }
              String jianjie = jianjiecontroller.text;

              var fcHide = Loading.showLoading();

              Linker.goLinkCreat(jianjie, isPublic, password, outDay, outSave, widget.parentid, widget.filelist)
                  .then((value) {
                fcHide();
                if (value.indexOf("xby") > 0) {
                  Navigator.of(context).pop('ok');
                  BotToast.showText(text: "创建成功");
                  Global.pageRssMiaoChuanState.refreshLink();
                  showDialog(
                      barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                      context: context,
                      builder: (context) {
                        return WillPopScope(
                            onWillPop: () async => false, //关键代码
                            child: CreatMiaoChuanBackDialog(link: value));
                      });
                } else {
                  BotToast.showText(text: "创建失败：" + value);
                }
              });
            },
            child: Text("创建短链接"),
            style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
          ),
        ],
      ),
    );
  }
}
