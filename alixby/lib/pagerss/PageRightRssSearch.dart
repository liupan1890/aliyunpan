import 'package:alixby/states/Global.dart';
import 'package:alixby/states/pageRssSearchState.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagerss/ZhuanCunDialog.dart';
import 'package:alixby/utils/SpinKitRing.dart';
import 'package:argon_buttons_flutter/argon_buttons_flutter.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:hovering/hovering.dart';
import 'package:provider/provider.dart';

class PageRightRssSearch extends StatefulWidget {
  @override
  _PageRightRssSearchState createState() => _PageRightRssSearchState();
}

class _PageRightRssSearchState extends State<PageRightRssSearch> {
  @override
  void initState() {
    super.initState();
    Global.pageRssSearchState.searchcontroller.addListener(() {
      //print(Global.pageRssSearchState.searchcontroller.text);
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    var pageRightFileSelectedDes = context.watch<PageRssSearchState>().pageRightFileSelectedDes;
    var itemCount = context.watch<PageRssSearchState>().pageRightSearchList.length;
    return Column(
      children: [
        Container(
          height: 46,
          width: double.infinity,
          alignment: Alignment.center,
          child: Stack(
            children: [
              ConstrainedBox(
                  constraints: BoxConstraints(maxHeight: 60, maxWidth: 375),
                  child: TextField(
                    controller: Global.pageRssSearchState.searchcontroller,
                    onSubmitted: (val) {
                      Global.pageRssSearchState.pageSearch(1, null);
                    },
                    maxLines: 1,
                    autocorrect: false,
                    enableSuggestions: false,
                    style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                    cursorColor: MColors.inputBorderHover,
                    autofocus: false,
                    decoration: InputDecoration(
                      hintText: "搜索文件转存",
                      hintStyle: TextStyle(fontSize: 13, color: MColors.textColorGray, fontFamily: "opposans"),
                      contentPadding: EdgeInsets.symmetric(vertical: 2, horizontal: 8),
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
                  child: ArgonButton(
                    height: 32,
                    width: 80,
                    minWidth: 80,
                    borderRadius: 3.0,
                    roundLoadingShape: false,
                    color: MColors.elevatedBtnBG,
                    child: Text(
                      "搜索",
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
                      if (btnState == ButtonState.Busy) return;
                      startLoading();
                      Global.pageRssSearchState.pageSearch(1, stopLoading);
                    },
                  )),
            ],
          ),
        ),
        Container(
            height: 40,
            width: double.infinity,
            child: Row(
              children: [
                Container(
                    width: 324,
                    child: Row(children: [
                      OutlinedButton.icon(
                          icon: Icon(MIcons.chuanshu, size: 16),
                          label: Text('转存选中项'),
                          onPressed: () {
                            var filelist = Global.pageRssSearchState.getSelectedFiles();
                            if (filelist.length == 0) {
                              BotToast.showText(text: "请先选中要转存的文件");
                              return;
                            }
                            showDialog(
                                barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                                context: context,
                                builder: (context) {
                                  return WillPopScope(
                                      onWillPop: () async => false, //关键代码
                                      child: ZhuanCunDialog(filelist: filelist));
                                });
                          }),
                      Padding(padding: EdgeInsets.only(left: 12)),
                      Expanded(
                          child: RichText(
                              textAlign: TextAlign.left,
                              text: TextSpan(
                                  style: TextStyle(fontSize: 12, color: MColors.textColor, fontFamily: "opposans"),
                                  children: [
                                    TextSpan(
                                        text: "搜索", style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                    TextSpan(
                                        text: " a空格b ",
                                        style: TextStyle(
                                            fontSize: 12, color: MColors.textColorRed, fontFamily: "opposans")),
                                    TextSpan(
                                        text: "是搜索包含",
                                        style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                    TextSpan(
                                        text: "a 或者 b",
                                        style: TextStyle(
                                            fontSize: 12, color: MColors.textColorRed, fontFamily: "opposans")),
                                    TextSpan(
                                        text: "\n搜索",
                                        style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                    TextSpan(
                                        text: " a+b ",
                                        style: TextStyle(
                                            fontSize: 12, color: MColors.textColorRed, fontFamily: "opposans")),
                                    TextSpan(
                                        text: "是搜索包含a ",
                                        style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                    TextSpan(
                                        text: "并且",
                                        style: TextStyle(
                                            fontSize: 12, color: MColors.textColorRed, fontFamily: "opposans")),
                                    TextSpan(
                                        text: " 包含b",
                                        style: TextStyle(color: MColors.textColor, fontFamily: "opposans")),
                                  ]))),
                    ])),
                Expanded(child: context.watch<PageRssSearchState>().navBtns),
              ],
            )),
        Container(height: 1, width: double.infinity, color: MColors.pageRightBorderColor),
        Container(
            height: 40,
            alignment: Alignment.topLeft,
            width: double.infinity,
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
              UnconstrainedBox(
                  child: Container(
                      width: 40,
                      height: 40,
                      child: HoverContainer(
                          decoration:
                              BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG),
                          hoverDecoration:
                              BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.userNavMenuBG),
                          child: IconButton(
                            iconSize: 24,
                            padding: EdgeInsets.all(0),
                            color: Color(0xff637dff),
                            icon: Icon(MIcons.rsuccess),
                            onPressed: () {
                              Global.pageRssSearchState.pageSelectFile("all");
                            },
                            tooltip: '全选',
                          )))),
              Padding(padding: EdgeInsets.only(left: 8)),
              Text("115秒传文件"),
              Padding(padding: EdgeInsets.only(left: 8)),
              Text(pageRightFileSelectedDes),
              Expanded(child: Container()),
              Container(child: Text("操作")),
              Padding(padding: EdgeInsets.only(left: 100)),
            ])),
        Expanded(
            child: Container(
          width: double.infinity,
          decoration: BoxDecoration(border: Border(top: BorderSide(width: 1, color: MColors.pageRightBorderColor))),
          alignment: Alignment.topLeft,
          child: Scrollbar(
              controller: Global.pageRssSearchState.verticalScroll,
              isAlwaysShown: true,
              showTrackOnHover: true,
              thickness: 9,
              hoverThickness: 9,
              child: ListView.builder(
                controller: Global.pageRssSearchState.verticalScroll,
                shrinkWrap: false,
                primary: false,
                addSemanticIndexes: false,
                addAutomaticKeepAlives: false,
                addRepaintBoundaries: false,
                scrollDirection: Axis.vertical,
                physics: ClampingScrollPhysics(),
                itemExtent: 50,
                itemCount: itemCount,
                itemBuilder: _buildList,
              )),
        )),
      ],
    );
  }

  static onTapFile(String key) {
    Global.pageRssSearchState.pageSelectFile(key);
  }

  static Icon iconSelected = Icon(MIcons.rsuccess, color: MColors.iconSelected);
  static Icon iconSelect = Icon(MIcons.rpic, color: MColors.iconSelect);
  static Padding padding6 = Padding(padding: EdgeInsets.only(left: 6));
  static Padding padding4 = Padding(padding: EdgeInsets.only(left: 4));
  static Padding padding12 = Padding(padding: EdgeInsets.only(left: 12));
  static TextStyle textStyle = TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans");
  static SizedBox sizeBox = SizedBox(width: 40, height: 40, child: iconSelect);
  static SizedBox sizeBoxed = SizedBox(width: 40, height: 40, child: iconSelected);

  Widget _buildList(BuildContext context, int index) {
    var item = Global.pageRssSearchState.pageRightSearchList[index];
    var decoration = BoxDecoration(
        color: MColors.pageRightFileBG,
        border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));
    var decorations = BoxDecoration(
        color: MColors.pageRightFileBGSelect,
        border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));

    var hoverDecoration = BoxDecoration(
        color: MColors.pageRightFileBGHover,
        border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));
    var hoverDecorations = BoxDecoration(
        color: MColors.pageRightFileBGSelect,
        border: Border(bottom: BorderSide(width: 1, color: MColors.pageRightBorderColor)));
    return HoverContainer(
        key: Key("prs_h_" + item.key),
        cursor: SystemMouseCursors.basic,
        padding: EdgeInsets.only(right: 16),
        height: 50,
        decoration: item.selected ? decorations : decoration,
        hoverDecoration: item.selected ? hoverDecorations : hoverDecoration,
        child: Container(
            key: Key("prs_hc_" + item.key),
            height: 50,
            child: InkWell(
                mouseCursor: SystemMouseCursors.basic,
                onTap: () => onTapFile(item.key),
                child: Row(
                  key: Key("prs_hcr_" + item.key),
                  children: [
                    item.selected ? sizeBoxed : sizeBox,
                    padding6,
                    item.icon,
                    padding4,
                    Expanded(
                        child: Row(children: [
                      Flexible(
                          flex: 1,
                          fit: FlexFit.loose,
                          child: Container(
                              key: Key("prs_hcr_n_" + item.key),
                              child: Text(item.title, softWrap: false, overflow: TextOverflow.ellipsis, maxLines: 2)))
                    ])),
                    Container(
                        key: Key("prs_hcr_s_" + item.key),
                        width: 88,
                        alignment: Alignment.centerRight,
                        child: Text(item.filesizestr, style: textStyle, maxLines: 1, softWrap: false)),
                    padding12,
                    Container(
                      key: Key("prs_hcr_t_" + item.key),
                      width: 44,
                      alignment: Alignment.centerRight,
                      child: Text(item.filetimestr, style: textStyle, textAlign: TextAlign.center, maxLines: 2),
                    ),
                    padding12,
                  ],
                ))));
  }
}
