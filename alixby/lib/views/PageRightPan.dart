import 'package:alixby/states/Global.dart';
import 'package:alixby/states/PanFileState.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/widgets/PanFileList.dart';
import 'package:alixby/widgets/PanRightTopButton.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';

class PageRightPan extends StatefulWidget {
  @override
  _PageRightPanState createState() => _PageRightPanState();
}

class _PageRightPanState extends State<PageRightPan> with AutomaticKeepAliveClientMixin {
  @override
  void initState() {
    super.initState();
    print('_PageRightPanState initState');
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
            height: 52,
            width: double.infinity,
            alignment: Alignment.centerLeft,
            child: RichText(
              textAlign: TextAlign.left,
              text: context.watch<PanFileState>().pageRightDirPath,
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
                child: PanRightTopButton(context.watch<PanFileState>().pageRightFileSelectedCount,
                    context.watch<PanFileState>().getPageName))),
        Container(height: 1, width: double.infinity, color: MColors.pageRightBorderColor),
        Container(
            height: 40,
            alignment: Alignment.topLeft,
            width: double.infinity,
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
              _buildSelectAll(),
              Padding(padding: EdgeInsets.only(left: 8)),
              Text(context.watch<PanFileState>().pageRightFileSelectedDes),
              Expanded(child: Container()),
              Container(child: Icon(MIcons.sort, color: Color(0xff637dff), size: 28)),
              Container(child: _buildSortMenu()),
              Padding(padding: EdgeInsets.only(left: 12)),
            ])),
        Expanded(child: PanFileList()),
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
                    Global.panFileState.pageSelectFile("all");
                  },
                  tooltip: '全选',
                ))));
  }

  Widget _buildSortMenu() {
    return PopupMenuButton<String>(
      onSelected: (value) {
        Global.panFileState.pageChangeOrderBy(value);
      },
      color: MColors.userNavBtnBG,
      offset: Offset(0, 26),
      shape: RoundedRectangleBorder(
          side: BorderSide(color: MColors.userNavBtnBorder), borderRadius: BorderRadius.circular(4)),
      tooltip: '选择排序方式',
      padding: EdgeInsets.all(0),
      child: Text("按 " + context.watch<PanFileState>().pageRightFileOrderBy + " 排序",
          style: TextStyle(fontSize: 14, color: Color(0xff637dff))),
      itemBuilder: (context) {
        return <PopupMenuEntry<String>>[
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14),
            height: 32,
            value: '文件名 从小到大',
            child: Text('文件名 从小到大'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14),
            height: 32,
            value: '文件名 从大到小',
            child: Text('文件名 从大到小'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14),
            height: 32,
            value: '文件体积 从小到大',
            child: Text('文件体积 从小到大'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14),
            height: 32,
            value: '文件体积 从大到小',
            child: Text('文件体积 从大到小'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14),
            height: 32,
            value: '上传时间 从小到大',
            child: Text('上传时间 从小到大'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 14),
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
