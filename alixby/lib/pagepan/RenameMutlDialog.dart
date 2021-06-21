import 'package:alixby/api/AliFile.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:hovering/hovering.dart';
import 'package:styled_text/styled_text.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class RenameMutlDialog extends StatefulWidget {
  // ignore: non_constant_identifier_names
  RenameMutlDialog({Key? key, required this.box, required this.filelist}) : super(key: key);

  String box = "";
  List<PageRightFileItem> filelist = [];

  @override
  _RenameMutlDialogState createState() => _RenameMutlDialogState();
}

class _RenameMutlDialogState extends State<RenameMutlDialog> {
  @override
  void initState() {
    super.initState();
    oldcontroller.addListener(() {
      ///获取输入的内容
      oldval = oldcontroller.text;
      updatematch();
      setState(() {});
    });
    newcontroller.addListener(() {
      ///获取输入的内容
      newval = newcontroller.text;
      updatematch();
      setState(() {});
    });
  }

  void updatematch() {
    if (oldval.endsWith("\\") && oldval.endsWith("\\\\") == false) oldval = "\\\\";

    matchCount = 0;
    for (var i = 0; i < widget.filelist.length; i++) {
      var item = widget.filelist[i];
      var showname = item.title;
      if (oldval == "" && newval != "") {
        //头部插入
        showname = "<a>" + newval + "</a>" + showname;
      }
      if (oldval != "" && newval == "") {
        //删除
        showname = showname.replaceFirstMapped(RegExp(r'' + oldval), (Match m) => '<d>' + m[0]! + '</d>', 0);
      }
      if (oldval != "" && newval != "") {
        //替换
        showname = showname.replaceFirstMapped(
            RegExp(r'' + oldval), (Match m) => '<d>' + m[0]! + '</d><a>' + newval + "</a>", 0);
      }

      if (showname != item.title) matchCount++;
    }
  }

  final ScrollController verticalScroll = ScrollController();
  final TextEditingController oldcontroller = TextEditingController();
  final TextEditingController newcontroller = TextEditingController();
  String oldval = "";
  String newval = "";
  int matchCount = 0;
  @override
  void dispose() {
    verticalScroll.dispose();
    oldcontroller.dispose();
    newcontroller.dispose();
    super.dispose();
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
                height: 540,
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
                        child: Text("批量重命名文件/文件夹",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                        width: 440,
                        height: 370,
                        alignment: Alignment.topLeft,
                        decoration: BoxDecoration(
                            border: Border.all(width: 1, color: Colors.grey), borderRadius: BorderRadius.circular(3.0)),
                        padding: EdgeInsets.all(2),
                        child: Scrollbar(
                            controller: verticalScroll,
                            isAlwaysShown: true,
                            showTrackOnHover: true,
                            thickness: 9,
                            hoverThickness: 9,
                            child: ListView.builder(
                              controller: verticalScroll,
                              shrinkWrap: false,
                              primary: false,
                              addSemanticIndexes: false,
                              addAutomaticKeepAlives: false,
                              addRepaintBoundaries: false,
                              scrollDirection: Axis.vertical,
                              physics: ClampingScrollPhysics(),
                              itemExtent: 42,
                              itemCount: widget.filelist.length,
                              itemBuilder: _buildList,
                            ))),
                    Container(
                      width: 440,
                      padding: EdgeInsets.only(top: 8),
                      child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                        Expanded(
                            child: TextField(
                          controller: oldcontroller,
                          maxLines: 1,
                          autocorrect: false,
                          enableSuggestions: false,
                          style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                          cursorColor: MColors.inputBorderHover,
                          autofocus: false,
                          decoration: InputDecoration(
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
                        Padding(padding: EdgeInsets.only(left: 24)),
                        Text("替换成"),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        Expanded(
                            child: TextField(
                          controller: newcontroller,
                          maxLines: 1,
                          autocorrect: false,
                          enableSuggestions: false,
                          style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                          cursorColor: MColors.inputBorderHover,
                          autofocus: false,
                          decoration: InputDecoration(
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
                      ]),
                    ),
                    Container(
                      width: 440,
                      padding: EdgeInsets.only(top: 8),
                      child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                        Expanded(
                          child: Text("左边支持正则表达式替换\n左边不填则右边的变为前缀",
                              style: TextStyle(fontSize: 12, color: MColors.pageLeftRowHeadColor)),
                        ),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        Text("命中 " + matchCount.toString() + " 个",
                            style: TextStyle(fontSize: 12, color: Colors.redAccent, fontFamily: "opposans")),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        OutlinedButton(
                          onPressed: () => Navigator.of(context).pop('ok'),
                          child: Text("取消"),
                          style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
                        ),
                        Padding(padding: EdgeInsets.only(left: 24)),
                        ElevatedButton(
                          onPressed: () {
                            List<String> keyList = [];
                            List<String> nameList = [];
                            for (var i = 0; i < widget.filelist.length; i++) {
                              var item = widget.filelist[i];
                              var showname = item.title;
                              if (oldval == "" && newval != "") {
                                //头部插入
                                showname = newval + showname;
                              }
                              if (oldval != "" && newval == "") {
                                //删除
                                showname = showname.replaceFirstMapped(RegExp(r'' + oldval), (Match m) => '', 0);
                              }
                              if (oldval != "" && newval != "") {
                                //替换
                                showname = showname.replaceFirstMapped(RegExp(r'' + oldval), (Match m) => newval, 0);
                              }

                              if (showname != item.title) {
                                keyList.add(item.key);
                                nameList.add(showname);
                              }
                            }

                            if (keyList.length == 0) {
                              BotToast.showText(text: "没有需要重命名的文件");
                              return;
                            }
                            var fcHide = Loading.showLoading();

                            AliFile.apiRenameBatch(widget.box, keyList, nameList).then((value) {
                              fcHide();
                              if (value > 0) {
                                Navigator.of(context).pop('ok');
                                Future.delayed(Duration(milliseconds: 200), () {
                                  Global.getTreeState(widget.box).pageRefreshNode();
                                });
                                BotToast.showText(text: "成功重命名 " + value.toString() + " 个文件");
                              } else {
                                BotToast.showText(text: "批量重命名失败,请重试");
                              }
                            });
                          },
                          child: Text("重命名"),
                          style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
                        ),
                      ]),
                    ),
                  ],
                ),
              )),
            )));
  }

  var decoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG);
  var hoverDecoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGHover);
  var padding = EdgeInsets.only(left: 3, right: 3);
  var padding2 = Padding(padding: EdgeInsets.only(left: 4));
  var icondir = Icon(MIcons.folder, size: 20, color: MColors.iconFolder);
  var iconfile = Icon(MIcons.file_file, size: 20, color: MColors.iconFile);
  var style = TextStyle(fontSize: 14, color: MColors.pageLeftRowItemColor, fontFamily: "opposans");

  Widget _buildList(BuildContext context, int index) {
    var item = widget.filelist[index];
    var showname = item.title;
    if (oldval == "" && newval != "") {
      //头部插入
      showname = "<a>" + newval + "</a>" + showname;
    }
    if (oldval != "" && newval == "") {
      //删除
      showname = showname.replaceFirstMapped(RegExp(r'' + oldval), (Match m) => '<d>' + m[0]! + '</d>', 0);
    }
    if (oldval != "" && newval != "") {
      //替换
      showname = showname.replaceFirstMapped(
          RegExp(r'' + oldval), (Match m) => '<d>' + m[0]! + '</d><a>' + newval + "</a>", 0);
    }
    return HoverContainer(
        //key: Key("prd_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 42,
        margin: EdgeInsets.only(top: 4),
        padding: EdgeInsets.only(right: 16),
        decoration: decoration,
        hoverDecoration: hoverDecoration,
        child: Container(
            height: 42,
            child: Row(
              children: [
                item.isDir ? icondir : iconfile,
                padding2,
                Expanded(
                    child: Tooltip(
                        message: item.title,
                        child: StyledText(
                          softWrap: false,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 2,
                          text: showname,
                          tags: {
                            'd': StyledTextTag(
                                style: TextStyle(
                                    backgroundColor: Color(0xeeffebee),
                                    color: Colors.red,
                                    decorationStyle: TextDecorationStyle.solid,
                                    decoration: TextDecoration.lineThrough,
                                    fontFamily: "opposans")),
                            'a': StyledTextTag(
                                style: TextStyle(
                                    color: Colors.green, backgroundColor: Color(0xeee8f5e9), fontFamily: "opposans")),
                          },
                        ))),
              ],
            )));
  }
}
