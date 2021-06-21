import 'package:alixby/api/AliFile.dart';
import 'package:alixby/api/Downloader.dart';
import 'package:alixby/api/Uploader.dart';
import 'package:alixby/pagepan/SaveMiaoChuan115Dialog.dart';
import 'package:alixby/pagepan/SaveMiaoChuanXbyDialog.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/states/PanData.dart';
import 'package:alixby/utils/Loading.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/pagepan/CreatMiaoChuanDialog.dart';
import 'package:alixby/pagepan/RenameMutlDialog.dart';
import 'package:alixby/pagepan/SaveMiaoChuanTxtDialog.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:file_selector_platform_interface/file_selector_platform_interface.dart';
import 'package:alixby/pagepan/CreatDirDialog.dart';
import 'package:alixby/pagepan/DownSaveDialog.dart';
import 'package:alixby/pagepan/MoveDialog.dart';
import 'package:alixby/pagepan/RenameDialog.dart';

// ignore: must_be_immutable
class PanRightTopButton extends StatefulWidget {
  PanRightTopButton(this.box, this.selectCount, this.selectKey)
      : super(key: Key('prbk_' + selectKey + "_" + (selectCount > 0 ? "selected" : "no")));
  int selectCount = 0;
  String selectKey = "";
  String box = "";
  @override
  _PanRightTopButtonState createState() => _PanRightTopButtonState();
}

class _PanRightTopButtonState extends State<PanRightTopButton> {
  @override
  void initState() {
    super.initState();
  }

  @override
  // ignore: must_call_super
  Widget build(BuildContext context) {
    var selectCount = widget.selectCount;
    var selectKey = widget.selectKey;
    if (selectKey == "trash") return (selectCount == 0) ? _buildButtons_refresh() : _buildButtons_trashSelect();
    if (selectKey == "favorite") return (selectCount == 0) ? _buildButtons_refresh() : _buildButtons_favoriteSelect();
    if (selectKey == "safebox") return _buildButtons_safebox();
    if (selectKey == "xiangce") return (selectCount == 0) ? _buildButtons_refresh() : _buildButtons_xiangceSelect();

    //默认显示文件列表
    return (selectCount == 0) ? _buildButtons_dir() : _buildButtons_dirSelect();
  }

  // ignore: non_constant_identifier_names
  Widget _buildButtons_dir() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRefresh(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildCreatDir(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildUpload(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildSaveMiaoChuan(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildSaveShare(),
      ],
    );
  }

  // ignore: non_constant_identifier_names
  Widget _buildButtons_dirSelect() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRefresh(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildDown(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildMove(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildCopy(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildRename(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildFavor(true),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildTrash(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildCreatMiaoChuan(),
      ],
    );
  }

  // ignore: non_constant_identifier_names
  Widget _buildButtons_refresh() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRefresh(),
        Padding(padding: EdgeInsets.only(left: 12)),
      ],
    );
  }

  // ignore: non_constant_identifier_names
  Widget _buildButtons_favoriteSelect() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRefresh(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildDown(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildMove(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildCopy(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildRename(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildFavor(false),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildTrash(),
        Padding(padding: EdgeInsets.only(left: 12)),
      ],
    );
  }

  // ignore: non_constant_identifier_names
  Widget _buildButtons_trashSelect() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRefresh(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildTrashRestore(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildTrashDelete(),
        Padding(padding: EdgeInsets.only(left: 12)),
      ],
    );
  }

  // ignore: non_constant_identifier_names
  Widget _buildButtons_safebox() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRefresh(),
        Padding(padding: EdgeInsets.only(left: 12)),
      ],
    );
  }

  // ignore: non_constant_identifier_names
  Widget _buildButtons_xiangceSelect() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildRefresh(),
        Padding(padding: EdgeInsets.only(left: 12)),
        _buildOpenDir(),
        Padding(padding: EdgeInsets.only(left: 12)),
      ],
    );
  }

  Widget _buildRefresh() {
    return OutlinedButton.icon(
        icon: Icon(MIcons.sync, size: 16),
        label: Text('刷新'),
        onPressed: () => Global.getTreeState(widget.box).pageRefreshNode());
  }

  Widget _buildCreatDir() {
    return OutlinedButton.icon(
        icon: Icon(MIcons.folderadd, size: 16),
        label: Text('新建文件夹'),
        onPressed: () {
          showDialog(
              barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
              context: context,
              builder: (context) {
                return WillPopScope(
                    onWillPop: () async => false, //关键代码
                    child: CreatDirDialog(box: widget.box));
              });
        });
  }

  Widget _buildUpload() {
    return SizedBox(
        child: PopupMenuButton<String>(
      onSelected: (value) {
        var parentid = Global.getFileState(widget.box).pageRightDirKey;
        if (value == "uploadfiles") {
          FileSelectorPlatform.instance.openFiles(confirmButtonText: "上传选中的文件").then((values) {
            if (values.length > 0) {
              List<String> filelist = [];
              for (int i = 0; i < values.length; i++) {
                filelist.add(values[i].path);
              }
              var fcHide = Loading.showLoading();
              Uploader.goUploadFile(widget.box, parentid, filelist).then((value) {
                fcHide();
                if (value > 0) {
                  BotToast.showText(text: "成功创建" + value.toString() + "个文件的上传任务");
                } else {
                  BotToast.showText(text: "创建文件上传任务失败请重试");
                }
              });
            }
          });
        } else {
          FileSelectorPlatform.instance.getDirectoryPath(confirmButtonText: "上传整个选中的文件夹").then((dirpath) {
            if (dirpath != null) {
              var fcHide = Loading.showLoading();
              Uploader.goUploadDir(widget.box, parentid, dirpath).then((value) {
                fcHide();
                if (value > 0) {
                  BotToast.showText(text: "成功创建" + value.toString() + "个文件夹的上传任务");
                } else {
                  BotToast.showText(text: "创建文件夹上传任务失败请重试");
                }
              });
            }
          });
        }
      },
      offset: Offset(0, 28),
      shape: RoundedRectangleBorder(
          side: BorderSide(color: MColors.userNavBtnBorder), borderRadius: BorderRadius.circular(4)),
      tooltip: "批量上传文件/文件夹",
      padding: EdgeInsets.all(0),
      color: MColors.userNavBtnBG,
      child: OutlinedButton.icon(
        icon: Icon(MIcons.upload, size: 16),
        label: Text('上传'),
        onPressed: null,
        style: ButtonStyle(mouseCursor: MaterialStateMouseCursor.clickable),
      ),
      itemBuilder: (context) {
        return <PopupMenuEntry<String>>[
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15, fontFamily: "opposans"),
            height: 32,
            value: 'uploadfiles',
            child: Text('上传文件'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15, fontFamily: "opposans"),
            height: 32,
            value: 'uploaddir',
            child: Text('上传文件夹'),
          ),
        ];
      },
    ));
  }

  Widget _buildDown() {
    var txt = "下载";

    return OutlinedButton.icon(
        icon: Icon(MIcons.download, size: 16),
        label: Text(txt),
        onPressed: () {
          if (Global.settingState.setting.savePath == "") {
            BotToast.showText(text: "需要先设置一下下载保存位置");
            Global.userState.updatePageIndex(4);
            return;
          }
          var parentid = Global.getFileState(widget.box).pageRightDirKey;
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();

          if (Global.settingState.setting.savePathCheck == false) {
            //直接下载
            var savepath = Global.settingState.setting.savePath.replaceAll('"', '').trim();
            var fcHide = Loading.showLoading();
            Downloader.goDownFile(widget.box, parentid, savepath, filelist).then((value) {
              fcHide();
              if (value > 0) {
                BotToast.showText(text: "成功创建" + value.toString() + "个文件的下载任务");
              } else {
                BotToast.showText(text: "创建下载任务失败请重试");
              }
            });
            return;
          } else {
            //显示弹窗
            var parentPath = Global.getFileState(widget.box).getSelectedFileParentPath();
            showDialog(
                barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                context: context,
                builder: (context) {
                  return WillPopScope(
                      onWillPop: () async => false, //关键代码
                      child: DownSaveDialog(
                          box: widget.box, parentid: parentid, parentPath: parentPath, filelist: filelist));
                });
          }
        });
  }

  Widget _buildMove() {
    return OutlinedButton.icon(
        icon: Icon(MIcons.scissor, size: 16),
        label: Text("移动"),
        onPressed: () {
          var parentid = Global.getFileState(widget.box).pageRightDirKey;
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();
          showDialog(
              barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
              context: context,
              builder: (context) {
                return WillPopScope(
                    onWillPop: () async => false, //关键代码
                    child: MoveDialog(iscopy: false, box: widget.box, parentid: parentid, filelist: filelist));
              });
        });
  }

  Widget _buildCopy() {
    return OutlinedButton.icon(
        icon: Icon(MIcons.copy, size: 16),
        label: Text("复制"),
        onPressed: () {
          var parentid = Global.getFileState(widget.box).pageRightDirKey;
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();
          showDialog(
              barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
              context: context,
              builder: (context) {
                return WillPopScope(
                    onWillPop: () async => false, //关键代码
                    child: MoveDialog(iscopy: true, box: widget.box, parentid: parentid, filelist: filelist));
              });
        });
  }

  // ignore: unused_element
  Widget _buildCreatMiaoChuan() {
    return ElevatedButton.icon(
        icon: Icon(MIcons.link2, size: 16),
        label: Text("创建秒传"),
        onPressed: () {
          var parentid = Global.getFileState(widget.box).pageRightDirKey;
          var parentname = Global.getFileState(widget.box).pageRightDirName;
          var files = Global.getFileState(widget.box).getSelectedFiles();
          if (files.length == 1) {
            parentname = files[0].title;
          }
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();
          showDialog(
              barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
              context: context,
              builder: (context) {
                return WillPopScope(
                    onWillPop: () async => false, //关键代码
                    child: CreatMiaoChuanDialog(
                        box: widget.box, parentid: parentid, parentname: parentname, filelist: filelist));
              });
        });
  }

  Widget _buildSaveMiaoChuan() {
    return SizedBox(
        child: PopupMenuButton<String>(
      onSelected: (value) {
        var parentid = Global.getFileState(widget.box).pageRightDirKey;
        var parentname = Global.getFileState(widget.box).getSelectedFileParentPath();
        Widget dialog = Container();
        if (value == "txt") {
          dialog = SaveMiaoChuanTxtDialog(box: widget.box, parentid: parentid, parentname: parentname);
        } else if (value == "aliyunpan" || value == "115") {
          dialog = SaveMiaoChuan115Dialog(box: widget.box, parentid: parentid, parentname: parentname);
        } else if (value == "xby") {
          dialog = SaveMiaoChuanXbyDialog(box: widget.box, parentid: parentid, parentname: parentname);
        }
        showDialog(
            barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
            context: context,
            builder: (context) {
              return WillPopScope(
                  onWillPop: () async => false, //关键代码
                  child: dialog);
            });
      },
      offset: Offset(0, 28),
      shape: RoundedRectangleBorder(
          side: BorderSide(color: MColors.userNavBtnBorder), borderRadius: BorderRadius.circular(4)),
      tooltip: "各种秒传链接保存到网盘",
      padding: EdgeInsets.all(0),
      color: MColors.userNavBtnBG,
      child: ElevatedButton.icon(
        icon: Icon(MIcons.link2, size: 16),
        label: Text('导入秒传'),
        onPressed: null,
        style: ButtonStyle(mouseCursor: MaterialStateMouseCursor.clickable),
      ),
      itemBuilder: (context) {
        return <PopupMenuEntry<String>>[
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15, fontFamily: "opposans"),
            height: 32,
            value: 'txt',
            child: Text('秒传文件(txt)'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15, fontFamily: "opposans"),
            height: 32,
            value: 'aliyunpan',
            child: Text('aliyunpan://秒传'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15, fontFamily: "opposans"),
            height: 32,
            value: '115',
            child: Text('115://秒传链接'),
          ),
          PopupMenuItem<String>(
            textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15, fontFamily: "opposans"),
            height: 32,
            value: 'xby',
            child: Text('xby.writeas.com'),
          ),
        ];
      },
    ));
  }

  Widget _buildSaveShare() {
    return OutlinedButton.icon(
        icon: Icon(MIcons.link2, size: 16),
        label: Text("导入分享",
            style: TextStyle(decorationStyle: TextDecorationStyle.solid, decoration: TextDecoration.lineThrough)),
        onPressed: () {
          BotToast.showText(text: "此功能还在开发中");
        });
  }

  Widget _buildRename() {
    if (widget.selectCount <= 1) {
      return OutlinedButton.icon(
          icon: Icon(MIcons.edit_square, size: 16),
          label: Text('改名'),
          onPressed: () {
            var filelist = Global.getFileState(widget.box).getSelectedFiles();
            showDialog(
                barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                context: context,
                builder: (context) {
                  return WillPopScope(
                      onWillPop: () async => false, //关键代码
                      child: RenameDialog(box: widget.box, fileid: filelist[0].key, filename: filelist[0].title));
                });
          });
    } else {
      return OutlinedButton.icon(
          icon: Icon(MIcons.edit_square, size: 16),
          label: Text('批量改名'),
          onPressed: () {
            var filelist = Global.getFileState(widget.box).getSelectedFiles();
            showDialog(
                barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                context: context,
                builder: (context) {
                  return WillPopScope(
                      onWillPop: () async => false, //关键代码
                      child: RenameMutlDialog(box: widget.box, filelist: filelist));
                });
          });
    }
  }

  Widget _buildTrash() {
    return OutlinedButton.icon(
        icon: Icon(MIcons.rest, size: 16),
        label: Text("回收站"),
        onPressed: () {
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();
          if (filelist.length > 0) {
            var fcHide = Loading.showLoading();

            AliFile.apiTrashBatch(widget.box, filelist).then((value) {
              fcHide();
              Future.delayed(Duration(milliseconds: 200), () {
                Global.getTreeState(widget.box).pageRefreshNode();
              });
              PanData.clearTrash();
              BotToast.showText(text: "成功移到回收站" + value.toString() + "个文件");
            });
          }
        });
  }

  Widget _buildTrashDelete() {
    var txt = "彻底删除";
    if (widget.selectCount > 1) txt = "批量" + txt;
    return OutlinedButton.icon(
        icon: Icon(MIcons.delete, size: 16),
        label: Text(txt),
        onPressed: () {
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();
          if (filelist.length > 0) {
            var fcHide = Loading.showLoading();
            AliFile.apiTrashDeleteBatch(widget.box, filelist).then((value) {
              fcHide();
              Future.delayed(Duration(milliseconds: 200), () {
                Global.getTreeState(widget.box).pageRefreshNode();
              });
              BotToast.showText(text: "成功" + txt + value.toString() + "个文件");
            });
          }
        });
  }

  Widget _buildTrashRestore() {
    var txt = "恢复文件";
    if (widget.selectCount > 1) txt = "批量" + txt;
    return OutlinedButton.icon(
        icon: Icon(MIcons.recover, size: 16),
        label: Text(txt),
        onPressed: () {
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();
          if (filelist.length > 0) {
            var fcHide = Loading.showLoading();

            AliFile.apiTrashRestoreBatch(widget.box, filelist).then((value) {
              fcHide();
              Future.delayed(Duration(milliseconds: 200), () {
                Global.getTreeState(widget.box).pageRefreshNode();
              });
              BotToast.showText(text: "成功" + txt + value.toString() + "个文件");
            });
          }
        });
  }

  Widget _buildOpenDir() {
    if (widget.selectCount == 1) {
      return OutlinedButton.icon(
          icon: Icon(MIcons.search, size: 16),
          label: Text('打开所在目录'),
          onPressed: widget.selectCount == 0
              ? null
              : () {
                  //todo::打开所在目录
                  print('打开所在目录');
                  BotToast.showText(text: "此功能还在开发中");
                });
    } else
      return Container();
  }

  Widget _buildFavor(bool isfavor) {
    var txt = "取消收藏";
    if (isfavor) txt = "收藏";
    return OutlinedButton.icon(
        icon: Icon(MIcons.crown, size: 16),
        label: Text(txt),
        onPressed: () {
          var filelist = Global.getFileState(widget.box).getSelectedFileKeys();
          if (filelist.length > 0) {
            var fcHide = Loading.showLoading();

            AliFile.apiFavorBatch(widget.box, isfavor, filelist).then((value) {
              fcHide();
              Future.delayed(Duration(milliseconds: 200), () {
                Global.getTreeState(widget.box).pageRefreshNode();
              });
              if (isfavor) PanData.clearFavor();
              BotToast.showText(text: "成功" + txt + value.toString() + "个文件");
            });
          }
        });
  }
}
