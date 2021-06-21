import 'package:alixby/states/Global.dart';

import 'package:alixby/utils/MIcons.dart';

import 'package:alixby/utils/MColors.dart';
import 'package:hovering/hovering.dart';

import 'package:alixby/models/PageLeftRowItem.dart';
import 'package:flutter/material.dart';

class PageLeftRss extends StatefulWidget {
  @override
  _PageLeftRssState createState() => _PageLeftRssState();
}

class _PageLeftRssState extends State<PageLeftRss> with AutomaticKeepAliveClientMixin {
  final data = <PageLeftRowItem>[
    PageLeftRowItem.newPageLeftRowItem("mlink", "link2", "秒传链接"),
    PageLeftRowItem.newPageLeftRowItem("msearch", "rvip", "聚合搜索"),
    PageLeftRowItem.newPageLeftRowItem("offline", "cloud", "离线任务"),
    PageLeftRowItem.newPageLeftRowItem("help", "bulb", "操作帮助"),
  ];

  String selectedKey = "mlink";

  void onPageLeftRowItemChanged(String key) {
    var index = 0;
    if (key == "mlink") index = 0;
    if (key == "msearch") index = 1;
    if (key == "offline") index = 2;
    if (key == "help") index = 3;
    Global.userState.updatePageRssIndex(index);
    setState(() {
      selectedKey = key;
    });
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    return Container(
        margin: EdgeInsets.only(left: 8, right: 8, top: 2, bottom: 2),
        alignment: Alignment.topLeft,
        child: SizedBox(
            width: 274,
            child: Column(
              children: [
                Container(
                    padding: EdgeInsets.only(left: 18, right: 18, top: 8, bottom: 4),
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "Rss订阅资源",
                      style: TextStyle(fontSize: 13, color: MColors.pageLeftRowHeadColor, fontFamily: "opposans"),
                    )),
                Expanded(
                    child: ListView.builder(
                  itemExtent: 32,
                  itemCount: data.length,
                  itemBuilder: (context, index) => _buildItem(data[index]),
                )),
              ],
            )));
  }

  Widget _buildItem(PageLeftRowItem item) => Container(
        alignment: Alignment.centerLeft,
        child: HoverContainer(
            width: double.infinity,
            height: 32,
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2.0),
                color: selectedKey == item.key ? MColors.pageLeftRowItemBGSelect : MColors.pageLeftBG),
            hoverDecoration: BoxDecoration(
                borderRadius: BorderRadius.circular(2.0),
                color: selectedKey == item.key ? MColors.pageLeftRowItemBGSelect : MColors.pageLeftRowItemBGHover),
            child: InkWell(
                onTap: () => onPageLeftRowItemChanged(item.key),
                child: Container(
                    padding: EdgeInsets.only(left: 18, right: 18),
                    child: Row(mainAxisSize: MainAxisSize.max, children: [
                      Icon(MIcons.Get(item.icon),
                          size: 20,
                          color: selectedKey == item.key
                              ? MColors.userNavMenuIconHover
                              : MColors.pageLeftRowItemIconColor),
                      Padding(padding: EdgeInsets.only(left: 4)),
                      Text(
                        item.title,
                        style: TextStyle(
                            color:
                                selectedKey == item.key ? MColors.userNavMenuIconHover : MColors.pageLeftRowItemColor,
                            fontFamily: "opposans"),
                      )
                    ])))),
      );

  @override
  bool get wantKeepAlive => true;
}
