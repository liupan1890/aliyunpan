import 'package:alixby/api/Linker.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:filesize/filesize.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:hovering/hovering.dart';

class SaveMiaoChuanBackDialog extends StatefulWidget {
  // ignore: non_constant_identifier_names
  SaveMiaoChuanBackDialog({Key? key, required this.parentid, required this.link}) : super(key: key);
  // ignore: non_constant_identifier_names
  String parentid = "";
  // ignore: non_constant_identifier_names
  LinkFileModel link = LinkFileModel();

  @override
  _SaveMiaoChuanBackDialogState createState() => _SaveMiaoChuanBackDialogState();
}

class _SaveMiaoChuanBackDialogState extends State<SaveMiaoChuanBackDialog> {
  List<LinkFileModel> list = [];
  @override
  void initState() {
    super.initState();
    print("_SaveMiaoChuanBackDialogState");
    //创建树
    list.addAll(_addNodes(widget.link.children, 0));
  }

  List<LinkFileModel> _addNodes(List<LinkFileModel> list, int leve) {
    List<LinkFileModel> clist = [];

    for (int i = 0; i < list.length; i++) {
      if (list[i].isdir) {
        list[i].leve = leve;
        clist.add(list[i]);
        clist.addAll(_addNodes(list[i].children, leve + 1));
      }
    }
    for (int i = 0; i < list.length; i++) {
      if (list[i].isdir == false) {
        list[i].leve = leve;
        clist.add(list[i]);
      }
    }
    return clist;
  }

  static ScrollController verticalScroll = ScrollController();

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
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
                      child: Icon(MIcons.close, size: 18),
                      onTap: () => Navigator.of(context).pop('ok'),
                    ))),
            Container(child: Text("导入秒传短链接", style: TextStyle(fontSize: 20, color: MColors.textColor, height: 0))),
            Container(width: 440, height: 1, margin: EdgeInsets.only(top: 22), color: MColors.pageRightBorderColor),
            Container(
                width: 440,
                height: 370,
                alignment: Alignment.topLeft,
                child: Scrollbar(
                    controller: verticalScroll,
                    isAlwaysShown: true,
                    showTrackOnHover: true,
                    thickness: 9,
                    hoverThickness: 9,
                    child: Row(
                      children: [
                        Expanded(
                            child: ListView.builder(
                          controller: verticalScroll,
                          shrinkWrap: false,
                          primary: false,
                          addSemanticIndexes: false,
                          addAutomaticKeepAlives: false,
                          addRepaintBoundaries: false,
                          scrollDirection: Axis.vertical,
                          physics: ClampingScrollPhysics(),
                          itemExtent: 28,
                          itemCount: list.length,
                          itemBuilder: _buildList,
                        )),
                        Container(width: 16),
                      ],
                    ))),
            Container(width: 440, height: 1, color: MColors.pageRightBorderColor),
            Container(
                width: 440, height: 54, padding: EdgeInsets.only(top: 8), child: Text("备注信息：" + widget.link.name)),
            Container(
              width: 440,
              padding: EdgeInsets.only(top: 8),
              child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                OutlinedButton(
                  onPressed: () => Navigator.of(context).pop('ok'),
                  child: Text("取消"),
                  style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
                ),
                Padding(padding: EdgeInsets.only(left: 24)),
                ElevatedButton(
                  onPressed: () {
                    if (widget.link.hash == "") {
                      var fcHide = Loading.showLoading();

                      Linker.goLinkUpload(widget.parentid, widget.link.fulljson).then((value) {
                        fcHide();
                        if (value > 0) {
                          Navigator.of(context).pop('ok');
                          BotToast.showText(text: "成功创建 " + value.toString() + " 个文件的秒传任务");
                        } else {
                          BotToast.showText(text: "导入秒传任务失败,请重试");
                        }
                      });
                    }
                  },
                  child: Text("导入这些文件"),
                  style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
                ),
              ]),
            ),
          ],
        ),
      )),
    );
  }

  var decoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG);
  var hoverDecoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGHover);
  var padding = EdgeInsets.only(left: 3, right: 3);
  var padding2 = Padding(padding: EdgeInsets.only(left: 4));
  var icondir = Icon(MIcons.folder, size: 20, color: MColors.iconFolder);
  var iconfile = Icon(MIcons.file_file, size: 20, color: MColors.iconFile);
  var style = TextStyle(fontSize: 14, color: MColors.pageLeftRowItemColor);

  static TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor);
  Widget _buildList(BuildContext context, int index) {
    var item = list[index];
    //print("buildfile " + item.key);
    //if (item.icon[0] == '.') item.icon = FileIcons.getFileIcon(item.icon, "");
    return HoverContainer(
        //key: Key("prd_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        height: 24,
        margin: EdgeInsets.only(top: 4),
        decoration: decoration,
        hoverDecoration: hoverDecoration,
        child: Container(
            height: 24,
            child: Row(
              children: [
                Container(width: (22 * item.leve).toDouble()),
                item.isdir ? icondir : iconfile,
                padding2,
                Expanded(
                  child: Tooltip(
                      message: item.name,
                      child: Text(item.name, softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 1)),
                ),
                Container(
                    width: 88,
                    alignment: Alignment.centerRight,
                    child: Text(item.isdir ? "" : filesize(item.size), style: textStyle, maxLines: 1)),
              ],
            )));
  }
}
