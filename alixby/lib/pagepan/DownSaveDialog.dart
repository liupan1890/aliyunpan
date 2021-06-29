import 'package:alixby/api/Downloader.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/utils/SpinKitRing.dart';
import 'package:argon_buttons_flutter/argon_buttons_flutter.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:file_selector_platform_interface/file_selector_platform_interface.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class DownSaveDialog extends StatefulWidget {
  DownSaveDialog(
      {Key? key, required this.box, required this.parentid, required String parentPath, required this.filelist})
      : super(key: key) {
    var savePath = Global.settingState.setting.savePath;
    var spc = "\\";
    if (savePath.contains("/")) {
      spc = "/"; //mac linux
    } else {
      parentPath = parentPath.replaceAll('/', '\\');
    }
    while (savePath.endsWith(spc)) {
      savePath = savePath.substring(0, savePath.length - 1);
    }
    savePath = savePath + spc;
    while (parentPath.startsWith(spc)) {
      parentPath = parentPath.substring(1);
    }
    controller.text = savePath + parentPath;
  }
  String box = "";
  String parentid = "";
  List<String> filelist = [];
  TextEditingController controller = TextEditingController();
  @override
  _DownSaveDialogState createState() => _DownSaveDialogState();
}

class _DownSaveDialogState extends State<DownSaveDialog> {
  void _getDirectoryPath() async {
    final directoryPath = await FileSelectorPlatform.instance.getDirectoryPath(
      initialDirectory: widget.controller.text,
      confirmButtonText: "选择保存到的文件夹",
    );
    if (directoryPath != null) widget.controller.text = directoryPath;
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
                height: 240,
                width: 460,
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
                        child: Text("选择下载文件保存位置",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                      width: 380,
                      padding: EdgeInsets.only(top: 20),
                      child: Stack(
                        children: [
                          ConstrainedBox(
                              constraints: BoxConstraints(maxHeight: 60),
                              child: TextField(
                                controller: widget.controller,
                                maxLines: 1,
                                autocorrect: false,
                                enableSuggestions: false,
                                style: TextStyle(fontSize: 14, color: MColors.textColor, fontFamily: "opposans"),
                                cursorColor: MColors.inputBorderHover,
                                decoration: InputDecoration(
                                  helperText: "默认是保存位置+网盘全路径+文件名，不推荐修改",
                                  helperStyle:
                                      TextStyle(fontSize: 13, color: MColors.textColor, fontFamily: "opposans"),
                                  contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 8),
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
                                  child: ArgonButton(
                                    height: 32,
                                    width: 80,
                                    minWidth: 80,
                                    borderRadius: 3.0,
                                    roundLoadingShape: false,
                                    color: MColors.elevatedBtnBG,
                                    child: Text(
                                      "选择",
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
                                      _getDirectoryPath();
                                    },
                                  ))),
                        ],
                      ),
                    ),
                    Container(
                        width: 380,
                        padding: EdgeInsets.only(top: 38, bottom: 8),
                        child: OutlinedButton.icon(
                          icon: Icon(MIcons.download, size: 16),
                          label: Text('立即下载'),
                          onPressed: () {
                            String savepath = widget.controller.text;
                            savepath = savepath.replaceAll('"', '').trim();
                            var fcHide = Loading.showLoading();
                            Downloader.goDownFile(widget.box, widget.parentid, savepath, widget.filelist).then((value) {
                              fcHide();
                              if (value > 0) {
                                BotToast.showText(text: "成功创建" + value.toString() + "个文件的下载任务");
                                Navigator.of(context).pop('ok');
                              } else {
                                BotToast.showText(text: "创建下载任务失败请重试");
                              }
                            });
                          },
                          style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
                        )),
                  ],
                ),
              )),
            )));
  }
}
