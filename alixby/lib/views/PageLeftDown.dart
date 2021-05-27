import 'package:alixby/states/Global.dart';
import 'package:alixby/states/pageDownState.dart';
import 'package:provider/provider.dart';
import '../utils/MIcons.dart';

import '../utils/MColors.dart';
import 'package:hovering/hovering.dart';

import '../models/PageLeftRowItem.dart';
import 'package:flutter/material.dart';

class PageLeftDown extends StatefulWidget {
  @override
  _PageLeftDownState createState() => _PageLeftDownState();
}

class _PageLeftDownState extends State<PageLeftDown> with AutomaticKeepAliveClientMixin {
  final data = <PageLeftRowItem>[
    PageLeftRowItem.newPageLeftRowItem("downing", "download", "下载中"),
    PageLeftRowItem.newPageLeftRowItem("downed", "desktop", "已下载完"),
    PageLeftRowItem.newPageLeftRowItem("uploading", "upload", "上传中"),
    PageLeftRowItem.newPageLeftRowItem("uploaded", "cloud_success", "已上传完"),
  ];

  void onPageLeftRowItemChanged(String key) {
    Global.pageDownState.pageChange(key);
  }

  @override
  void initState() {
    super.initState();
    print('_PageLeftDownState initState');
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
                      "本地下载的文件",
                      style: TextStyle(fontSize: 13, color: MColors.pageLeftRowHeadColor),
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

  Widget _buildItem(PageLeftRowItem item) {
    var selectKey = context.watch<PageDownState>().getPageName;
    return Container(
      alignment: Alignment.centerLeft,
      child: HoverContainer(
          width: double.infinity,
          height: 32,
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2.0),
              color: selectKey == item.key ? MColors.pageLeftRowItemBGSelect : MColors.pageLeftBG),
          hoverDecoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2.0),
              color: selectKey == item.key ? MColors.pageLeftRowItemBGSelect : MColors.pageLeftRowItemBGHover),
          child: InkWell(
              onTap: () => onPageLeftRowItemChanged(item.key),
              child: Container(
                  padding: EdgeInsets.only(left: 18, right: 18),
                  child: Row(mainAxisSize: MainAxisSize.max, children: [
                    Icon(MIcons.Get(item.icon),
                        size: 20,
                        color: selectKey == item.key ? MColors.userNavMenuIconHover : MColors.pageLeftRowItemIconColor),
                    Padding(padding: EdgeInsets.only(left: 4)),
                    Text(
                      item.title,
                      style: TextStyle(
                          color: selectKey == item.key ? MColors.userNavMenuIconHover : MColors.pageLeftRowItemColor),
                    )
                  ])))),
    );
  }

  @override
  bool get wantKeepAlive => true;
}
