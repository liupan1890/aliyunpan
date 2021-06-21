import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:url_launcher/url_launcher.dart';

class PageRightRssHelp extends StatefulWidget {
  @override
  _PageRightRssHelpState createState() => _PageRightRssHelpState();
}

class _PageRightRssHelpState extends State<PageRightRssHelp> {
  @override
  void initState() {
    super.initState();
  }

  final verticalScroll = ScrollController();
  @override
  void dispose() {
    verticalScroll.dispose();
    super.dispose();
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    var stylegray = TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans");
    var styleQ = TextStyle(
        fontFamily: "opposans",
        decoration: TextDecoration.underline,
        decorationStyle: TextDecorationStyle.solid,
        decorationThickness: 2,
        decorationColor: Colors.yellowAccent.shade700);
    return Column(children: [
      Container(
          height: 52,
          width: double.infinity,
          alignment: Alignment.centerLeft,
          child: RichText(
              textAlign: TextAlign.left,
              text: WidgetSpan(
                  child: Linkify(
                      onOpen: null,
                      text: "操作帮助",
                      linkifiers: [FileLinkifier("操作帮助", "", "")],
                      linkStyle: TextStyle(
                          fontSize: 13,
                          color: MColors.linkColor,
                          decoration: TextDecoration.none,
                          fontFamily: "opposans"))))),
      Container(height: 1, width: double.infinity, color: MColors.pageRightBorderColor),
      Expanded(
          child: Scrollbar(
              controller: verticalScroll,
              isAlwaysShown: true,
              showTrackOnHover: true,
              thickness: 9,
              hoverThickness: 9,
              child: SingleChildScrollView(
                  controller: verticalScroll,
                  scrollDirection: Axis.vertical,
                  physics: ClampingScrollPhysics(),
                  child: Container(
                      alignment: Alignment.topLeft,
                      padding: EdgeInsets.only(left: 8, right: 100),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷使用中遇到XX问题，发现XXBUG，希望有XX功能", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                            child: Linkify(
                                onOpen: (link) {
                                  launch(Uri.encodeFull(link.url));
                                },
                                text: "github",
                                linkifiers: [
                                  FileLinkifier("https://github.com/liupan1890/aliyunpan",
                                      "https://github.com/liupan1890/aliyunpan/issues", "")
                                ],
                                linkStyle: TextStyle(
                                    fontSize: 14,
                                    color: MColors.linkColor,
                                    decoration: TextDecoration.none,
                                    fontFamily: "opposans"))),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷关闭后还能继续下载吗？怎么彻底退出？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:当你点击X号关闭，只是关闭了窗口，程序在后台继续运行（继续下载/上传）。此时鼠标右键点击桌面右下角任务栏里的托盘小图标，会显示 [显示主界面] 和 [彻底退出] 按钮，点击彻底退出按钮，才是真的关闭程序",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷不能选择多个文件后批量操作吗？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:当然可以，支持配合Ctrl键、Shift键，实现自由选中多个文件，\n跟win10文件管理器里选择多个文件的操作是一样的\n按住Ctrl键，再点击1个文件就是多选，还可以取消选中这个文件\n先点击一个文件，按住Shift键，再点击1个文件，会自动选中之间的全部文件",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷可以一次下载整个文件夹吗？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:当然可以，选择一个文件夹，点击下载按钮即可！还可以一次选择多个文件夹+文件，点击下载按钮批量下载！没有文件数量的限制！下载文件时也支持断点续传，可以随时暂停恢复继续下载",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷可以指定把文件下载到哪里吗？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:当然可以，在设置里勾选　[　每次下载都让我选择下载位置　]　后，就可以选择把文件下载到哪里了，默认是按照阿里云盘的完整路径保存的，勾选后就会去掉阿里云盘的完整路径直接保存到你选择的文件夹里",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷可以一次上传整个文件夹吗？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:当然可以，点击上传，选择上传文件夹，选择一个你电脑上的文件夹就可以了，会自动上传这个文件夹下面的所有文件和所有子文件夹！没有上传数量的限制！但阿里云盘限制单个文件最大30GB！上传文件时支持秒传，支持断点续传，可以随时暂停恢复继续上传！\nWindow系统用户还支持直接拖拽一堆文件扔到窗口上自动上传",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷不能导入115分享链接？百度分享链接？磁力链接？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:当然都　不可以，但是可以导入115秒传链接(115://........)和阿里云盘秒传链接(aliyunpan://........)",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷聚合搜索是什么？搜不到想要的文件？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:所有用户导入115秒传链接时，可以主动勾选分享，分享的链接可以在聚合搜索中给其他人搜索到，方便其他人！因为搜索刚刚上线所以搜索结果很少，等以后自然就多了",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷支持在线预览哪些文件？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:支持预览所有的音视频格式（支持音轨、字幕、倍速快放、倍速慢放、音量/对比度/亮度调整等等，具体操作请百度 “ mpv播放器 ” ），还支持在线预览图片和txt",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷运行后提示更新，怎么升级版本呢？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:去github下载最新版本的压缩包，直接解压缩替换旧版本文件即可。所有用户数据都存放在 旧版\\data\\user.db 这个文件里，只要最终保留user.db这个文件就好了！甚至还可以直接复制这个文件到新版解压位置后删除旧版文件夹",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷可以更换自己喜欢的字体吗？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:当然可以！将[data\\flutter_assets\\assets\\fonts\\OPPOSans-R.ttf]这个文件替换成你自己的ttf字体文件就可以了。就是这么简单",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷相册和网盘有什么区别？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:功能上并没有区别，相册内文件同样占用网盘的总空间。但相册在官网只能显示图片和视频，所以虽然可以把网盘里的任意文件 复制/移动 到相册，但并不推荐这样做，请遵守官方的规则只往相册里存放图片和视频。",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷不想用了怎么卸载？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:小白羊是绿色软件，直接删除小白羊所在的文件夹就可以了，没有任何安装残留！",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                        Container(
                          child: Text("Q∷会泄露我的隐私吗？", style: styleQ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 8)),
                        Container(
                          child: Text(
                            "答:小白羊是开源软件，除了提交秒传链接和聚合搜索，小白羊并没有其他上传数据的操作！你的所有数据也都只存放在阿里云盘里，我们很注意保护你的隐私！",
                            style: stylegray,
                            softWrap: true,
                          ),
                        ),
                        Padding(padding: EdgeInsets.only(top: 32)),
                      ])))))
    ]);
  }
}
