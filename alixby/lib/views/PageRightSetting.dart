import 'package:alixby/states/Global.dart';
import 'package:alixby/states/SettingState.dart';
import 'package:alixby/states/UserState.dart';
import 'package:alixby/utils/FileLinkifier.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter_linkify/flutter_linkify.dart';
import 'package:provider/provider.dart';
import 'package:file_selector_platform_interface/file_selector_platform_interface.dart';

class PageRightSetting extends StatefulWidget {
  @override
  _PageRightSettingState createState() => _PageRightSettingState();
}

class _PageRightSettingState extends State<PageRightSetting> with AutomaticKeepAliveClientMixin {
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
    var userName = context.watch<UserState>().userName;
    return Column(
      children: [
        Container(
            height: 52,
            width: double.infinity,
            alignment: Alignment.centerLeft,
            child: RichText(
                textAlign: TextAlign.left,
                text: WidgetSpan(
                    child: Linkify(
                        onOpen: null,
                        text: "APP设置",
                        linkifiers: [FileLinkifier("APP设置", "", "")],
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
                      //color: Colors.blue,
                      padding: EdgeInsets.only(left: 32),
                      alignment: Alignment.topLeft,
                      child: Column(
                        children: [
                          Padding(padding: EdgeInsets.only(top: 32)),
                          Container(
                            width: 400,
                            child: Text("∷界面设置",
                                style: TextStyle(
                                    fontFamily: "opposans",
                                    decoration: TextDecoration.underline,
                                    decorationStyle: TextDecorationStyle.solid,
                                    decorationThickness: 2,
                                    decorationColor: Colors.yellowAccent.shade700)),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          _buildTextSize(context),
                          Padding(padding: EdgeInsets.only(top: 32)),
                          Container(
                            width: 400,
                            child: Text("∷下载文件保存位置",
                                style: TextStyle(
                                    fontFamily: "opposans",
                                    decoration: TextDecoration.underline,
                                    decorationStyle: TextDecorationStyle.solid,
                                    decorationThickness: 2,
                                    decorationColor: Colors.yellowAccent.shade700)),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          _buildSavePath(),
                          _buildSavePathCheck(context),
                          Padding(padding: EdgeInsets.only(top: 24)),
                          Container(
                            width: 400,
                            child: Text("∷全局下载速度限制",
                                style: TextStyle(
                                    fontFamily: "opposans",
                                    decoration: TextDecoration.underline,
                                    decorationStyle: TextDecorationStyle.solid,
                                    decorationThickness: 2,
                                    decorationColor: Colors.yellowAccent.shade700)),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          _buildDownSpeed(),
                          Padding(padding: EdgeInsets.only(top: 32)),
                          Container(
                            width: 400,
                            child: Text("∷同时上传/下载任务数",
                                style: TextStyle(
                                    fontFamily: "opposans",
                                    decoration: TextDecoration.underline,
                                    decorationStyle: TextDecorationStyle.solid,
                                    decorationThickness: 2,
                                    decorationColor: Colors.yellowAccent.shade700)),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          _buildDownMax(context),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          _buildSha1Check(context),
                          Padding(padding: EdgeInsets.only(top: 24)),
                          Container(
                            width: 400,
                            child: Text("∷账号设置",
                                style: TextStyle(
                                    fontFamily: "opposans",
                                    decoration: TextDecoration.underline,
                                    decorationStyle: TextDecorationStyle.solid,
                                    decorationThickness: 2,
                                    decorationColor: Colors.yellowAccent.shade700)),
                          ),
                          Padding(padding: EdgeInsets.only(top: 8)),
                          Container(
                              width: 400,
                              child: Row(children: [
                                Text(
                                  userName,
                                  style: TextStyle(
                                      color: MColors.userNavColor,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: "opposans"),
                                  maxLines: 1,
                                  softWrap: false,
                                  overflow: TextOverflow.clip,
                                ),
                                Padding(padding: EdgeInsets.only(left: 16)),
                                OutlinedButton(
                                  child: Text("退出登录"),
                                  onPressed: () => Global.userState.logoffUser(),
                                ),
                              ])),
                        ],
                      ),
                    )))),
      ],
    );
  }

  void _getDirectoryPath() async {
    final directoryPath = await FileSelectorPlatform.instance.getDirectoryPath(
      initialDirectory: Global.settingState.savePathController.text,
      confirmButtonText: "选择保存到的文件夹",
    );
    if (directoryPath != null) {
      Global.settingState.savePath(directoryPath);
    }
  }

  Widget _buildSavePath() {
    return Container(
      width: 400,
      child: Stack(
        children: [
          ConstrainedBox(
              constraints: BoxConstraints(maxHeight: 60),
              child: TextField(
                readOnly: true,
                controller: Global.settingState.savePathController,
                maxLines: 1,
                autocorrect: false,
                enableSuggestions: false,
                style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                cursorColor: MColors.inputBorderHover,
                decoration: InputDecoration(
                  helperText: "选择一个文件夹，所有文件默认都下载到此文件夹内",
                  helperStyle: TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans"),
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
          Positioned.directional(
              textDirection: TextDirection.rtl,
              start: 0,
              child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: 31),
                  child: ElevatedButton.icon(
                      icon: Icon(MIcons.file_folder, size: 16),
                      label: Text('选择'),
                      onPressed: () => _getDirectoryPath()))),
        ],
      ),
    );
  }

  Widget _buildSavePathCheck(BuildContext context) {
    return Container(
        width: 400,
        padding: EdgeInsets.only(right: 80),
        alignment: Alignment.topLeft,
        child: CheckboxListTile(
          tristate: true,
          dense: true,
          tileColor: Colors.transparent,
          contentPadding: EdgeInsets.all(0),
          selectedTileColor: Colors.transparent,
          checkColor: Colors.white,
          activeColor: MColors.inputBorderHover,
          title: Tooltip(
              message: '不推荐勾选，默认按照网盘全路径保存，勾选后可以自己选择路径',
              child: Text(
                '每次下载都提示我选择保存位置',
                style: TextStyle(
                    fontSize: 14,
                    color: Global.settingState.setting.savePathCheck ? MColors.inputBorderHover : MColors.textColor,
                    fontFamily: "opposans"),
              )),
          value: (context.watch<SettingState>().setting.savePathCheck ? true : null),
          selected: context.watch<SettingState>().setting.savePathCheck,
          onChanged: (bool? value) {
            Global.settingState.savePathCheck();
          },
        ));
  }

  Widget _buildDownSpeed() {
    return Container(
      width: 400,
      child: Stack(
        children: [
          ConstrainedBox(
              constraints: BoxConstraints(maxHeight: 60),
              child: TextField(
                controller: Global.settingState.downSpeedController,
                maxLines: 1,
                autocorrect: false,
                enableSuggestions: false,
                style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                cursorColor: MColors.inputBorderHover,
                decoration: InputDecoration(
                  helperText: "按照 '你填的' MB/s 限制最大下载速度，填0不限速",
                  helperStyle: TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans"),
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
          Positioned.directional(
              textDirection: TextDirection.rtl,
              start: 0,
              child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: 31),
                  child: ElevatedButton.icon(
                      icon: Icon(MIcons.edit_square, size: 16),
                      label: Text('保存'),
                      onPressed: () {
                        Global.settingState.downSpeed(Global.settingState.downSpeedController.text);
                        BotToast.showText(text: "设置已保存");
                      }))),
        ],
      ),
    );
  }

  Widget _buildDownMax(BuildContext context) {
    return Container(
        width: 400,
        alignment: Alignment.topLeft,
        child: UnconstrainedBox(
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
                  style: TextStyle(color: MColors.textColor, fontFamily: "opposans"),
                  itemHeight: 32, //需要修改kMinInteractiveDimension =32
                  elevation: 0,
                  value: context.watch<SettingState>().setting.downMax,
                  underline: Container(height: 0),
                  dropdownColor: MColors.userNavMenuBG,
                  onChanged: (String? newValue) {
                    if (newValue != null) Global.settingState.downMax(newValue);
                  },
                  items: <String>['1', '2', '3', '4', '5', '6', '7', '8', '9']
                      .map<DropdownMenuItem<String>>((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text('同时上传/下载' + value + '个文件',
                          style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans")),
                    );
                  }).toList(),
                ))));
  }

  Widget _buildSha1Check(BuildContext context) {
    return Container(
        width: 400,
        padding: EdgeInsets.only(right: 80),
        alignment: Alignment.topLeft,
        child: CheckboxListTile(
          dense: true,
          tristate: true,
          tileColor: Colors.transparent,
          contentPadding: EdgeInsets.all(0),
          selectedTileColor: Colors.transparent,
          checkColor: Colors.white,
          activeColor: MColors.inputBorderHover,
          title: Tooltip(
              message: '不推荐勾选，会占用大量CPU',
              child: Text(
                '每次下载完成后校验文件完整性(sha1)',
                style: TextStyle(
                    fontSize: 14,
                    color: Global.settingState.setting.downSha1Check ? MColors.inputBorderHover : MColors.textColor,
                    fontFamily: "opposans"),
              )),
          value: (context.watch<SettingState>().setting.downSha1Check ? true : null),
          selected: context.watch<SettingState>().setting.downSha1Check,
          onChanged: (bool? value) {
            Global.settingState.downSha1Check();
          },
        ));
  }

  Widget _buildTextSize(BuildContext context) {
    return Container(
        width: 400,
        alignment: Alignment.topLeft,
        child: Row(children: [
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
                      style: TextStyle(color: MColors.textColor, fontFamily: "opposans"),
                      itemHeight: 32, //需要修改kMinInteractiveDimension =32
                      elevation: 0,
                      value: context.watch<SettingState>().setting.textScale.toString(),
                      underline: Container(height: 0),
                      dropdownColor: MColors.userNavMenuBG,
                      onChanged: (String? newValue) {
                        if (newValue != null) Global.settingState.textScale(newValue);
                      },
                      items: [
                        DropdownMenuItem<String>(
                            value: "1.0",
                            child: Text('正常文字大小',
                                style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"))),
                        DropdownMenuItem<String>(
                            value: "1.1",
                            child: Text('较大文字大小',
                                style: TextStyle(fontSize: 15, color: MColors.textColor, fontFamily: "opposans"))),
                        DropdownMenuItem<String>(
                            value: "1.2",
                            child: Text('最大文字大小',
                                style: TextStyle(fontSize: 16, color: MColors.textColor, fontFamily: "opposans"))),
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
                      itemHeight: 32, //需要修改kMinInteractiveDimension =32
                      elevation: 0,
                      value: context.watch<SettingState>().setting.theme,
                      underline: Container(height: 0),
                      dropdownColor: MColors.userNavMenuBG,
                      onChanged: (String? newValue) {
                        if (newValue != null) {
                          Global.settingState.theme(newValue);
                          BotToast.showText(text: "皮肤模式需要退出程序重新打开后才能生效", duration: Duration(seconds: 10));
                        }
                      },
                      items: [
                        DropdownMenuItem<String>(
                            value: "day",
                            child: Text('浅色模式',
                                style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"))),
                        DropdownMenuItem<String>(
                            value: "dark",
                            child: Text('深色模式',
                                style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"))),
                      ]))),
        ]));
  }

  @override
  bool get wantKeepAlive => true;
}
