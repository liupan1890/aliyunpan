import 'package:alixby/api/Downloader.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:file_selector_platform_interface/file_selector_platform_interface.dart';

// ignore: must_be_immutable
class DownSaveDialog extends StatefulWidget {
  DownSaveDialog({Key? key, required this.parentID, required this.parentPath, required this.filelist})
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
  String parentID = "";
  String parentPath = "";
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
        child: DefaultTextStyle(
          //1.设置文本默认样式
          style: TextStyle(color: MColors.textColor),
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
                Container(child: Text("下载文件保存到", style: TextStyle(fontSize: 20, color: MColors.textColor))),
                Container(
                  width: 380,
                  margin: EdgeInsets.only(top: 24),
                  child: Stack(
                    children: [
                      ConstrainedBox(
                          constraints: BoxConstraints(maxHeight: 56),
                          child: TextField(
                            controller: widget.controller,
                            maxLines: 1,
                            autocorrect: false,
                            enableSuggestions: false,
                            style: TextStyle(fontSize: 14, color: MColors.textColor),
                            cursorColor: MColors.inputBorderHover,
                            decoration: InputDecoration(
                              helperText: "默认是下载文件夹+网盘路径+文件名，不推荐选择其他文件夹",
                              helperStyle: TextStyle(fontSize: 13, color: MColors.textColor),
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
                ),
                Container(
                    width: 380,
                    padding: EdgeInsets.only(top: 38, bottom: 8),
                    child: ElevatedButton.icon(
                      icon: Icon(MIcons.download, size: 16),
                      label: Text('立即下载  (选中的文件夹很多时要耐心等很久)'),
                      onPressed: () {
                        String savepath = widget.controller.text;
                        savepath = savepath.replaceAll('"', '').trim();
                        var fcHide = Loading.showLoading();
                        var parentid = Global.panFileState.pageRightDirKey;
                        Downloader.goDownFile(parentid, savepath, widget.filelist).then((value) {
                          fcHide();
                          if (value > 0) {
                            BotToast.showText(text: "成功创建" + value.toString() + "个文件的下载任务");
                            Navigator.of(context).pop('ok');
                          } else {
                            BotToast.showText(text: "创建下载任务失败请重试");
                          }
                        });
                      },
                      style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 35))),
                    )),
              ],
            ),
          )),
        ));
  }
}
