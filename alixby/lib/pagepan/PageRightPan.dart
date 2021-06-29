import 'package:alixby/states/FileState.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagepan/PanFileList.dart';
import 'package:alixby/pagepan/PanRightTopButton.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';

// ignore: must_be_immutable
class PageRightPan extends StatefulWidget {
  PageRightPan(this.box) : super();
  String box = "";
  @override
  _PageRightPanState createState() => _PageRightPanState();
}

class _PageRightPanState extends State<PageRightPan> with AutomaticKeepAliveClientMixin {
  @override
  void initState() {
    super.initState();
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    FileState? filestate;
    if (widget.box == "box") {
      filestate = context.watch<PanFileState>();
    } else if (widget.box == "xiangce") {
      filestate = context.watch<XiangCeFileState>();
    }
    return Column(
      children: [
        Container(
            height: 52,
            width: double.infinity,
            alignment: Alignment.centerLeft,
            child: RichText(
              textAlign: TextAlign.left,
              text: filestate!.pageRightDirPath,
              textDirection: TextDirection.ltr,
            )),
        Container(
            height: 34,
            width: double.infinity,
            child: AnimatedSwitcher(
                switchInCurve: Curves.easeIn,
                switchOutCurve: Curves.easeOut,
                duration: const Duration(milliseconds: 300),
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return FadeTransition(
                    opacity: animation,
                    child: child,
                  );
                },
                child: PanRightTopButton(widget.box, filestate.pageRightFileSelectedCount, filestate.getPageName))),
        Container(height: 1, width: double.infinity, color: MColors.pageRightBorderColor),
        Container(
            height: 40,
            alignment: Alignment.topLeft,
            width: double.infinity,
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
              _buildSelectAll(),
              Padding(padding: EdgeInsets.only(left: 8)),
              Text(filestate.pageRightFileSelectedDes),
              Expanded(child: Container()),
              Container(child: Icon(MIcons.sort, color: Color(0xff637dff), size: 22)),
              Container(child: _buildSortMenu(filestate)),
              Padding(padding: EdgeInsets.only(left: 12)),
            ])),
        Expanded(child: PanFileList(widget.box)),
      ],
    );
  }

  Widget _buildSelectAll() {
    return UnconstrainedBox(
        child: Container(
            width: 40,
            height: 40,
            child: HoverContainer(
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG),
                hoverDecoration: BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.userNavMenuBG),
                child: IconButton(
                  iconSize: 24,
                  padding: EdgeInsets.all(0),
                  color: Color(0xff637dff),
                  icon: Icon(MIcons.rsuccess),
                  onPressed: () {
                    Global.getFileState(widget.box).pageSelectFile("all");
                  },
                  tooltip: '全选',
                ))));
  }

  Widget _buildSortMenu(FileState filestate) {
    return PopupMenuButton<String>(
      onSelected: (value) {
        Global.getFileState(widget.box).pageChangeOrderBy(value);
      },
      color: MColors.userNavBtnBG,
      offset: Offset(0, 26),
      shape: RoundedRectangleBorder(
          side: BorderSide(color: MColors.userNavBtnBorder), borderRadius: BorderRadius.circular(4)),
      tooltip: '选择排序方式',
      padding: EdgeInsets.all(0),
      child: Text("按 " + filestate.pageRightFileOrderBy + " 排序",
          style: TextStyle(fontSize: 13, color: Color(0xff637dff), fontFamily: "opposans")),
      itemBuilder: (context) {
        return <PopupMenuEntry<String>>[
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14, fontFamily: "opposans"),
            height: 32,
            value: '文件名 从小到大',
            child: Text('文件名 从小到大'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14, fontFamily: "opposans"),
            height: 32,
            value: '文件名 从大到小',
            child: Text('文件名 从大到小'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14, fontFamily: "opposans"),
            height: 32,
            value: '文件类型',
            child: Text('文件类型'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14, fontFamily: "opposans"),
            height: 32,
            value: '文件体积 从小到大',
            child: Text('文件体积 从小到大'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14, fontFamily: "opposans"),
            height: 32,
            value: '文件体积 从大到小',
            child: Text('文件体积 从大到小'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14, fontFamily: "opposans"),
            height: 32,
            value: '上传时间 从小到大',
            child: Text('上传时间 从小到大'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14, fontFamily: "opposans"),
            height: 32,
            value: '上传时间 从大到小',
            child: Text('上传时间 从大到小'),
          ),
        ];
      },
    );
  }

  @override
  bool get wantKeepAlive => true;
}
