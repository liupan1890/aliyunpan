import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:url_launcher/url_launcher.dart';

class PageRightRss extends StatefulWidget {
  @override
  _PageRightRssState createState() => _PageRightRssState();
}

class _PageRightRssState extends State<PageRightRss> with AutomaticKeepAliveClientMixin {
  @override
  void initState() {
    super.initState();
    print('_PageRightRssState initState');
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    return Container(
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
          Text("此功能正在开发中"),
          Padding(padding: EdgeInsets.only(top: 18)),
          Text("这是一个正在开发中的版本，"),
          Text("遇到BUG不要慌，反馈给我就好"),
          Padding(padding: EdgeInsets.only(top: 18)),
          Linkify(
              onOpen: (link) {
                launch(Uri.encodeFull(link.url));
              },
              text: "aliyundrive.com",
              linkifiers: [
                FileLinkifier(
                    "https://github.com/liupan1890/aliyunpan", "https://github.com/liupan1890/aliyunpan/issues")
              ],
              linkStyle: TextStyle(fontSize: 14, color: MColors.linkColor, decoration: TextDecoration.none))
        ]));
  }

  @override
  bool get wantKeepAlive => true;
}
