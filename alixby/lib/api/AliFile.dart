import 'dart:convert';

import 'package:alixby/models/FileItem.dart';
import 'package:alixby/utils/APILoadingWidget.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';

import 'HttpHelper.dart';

class FileListModel {
  FileListModel(this.time, this.key, this.name);
  int time = 0;
  String key = "";
  String name = "";
  List<FileItem> list = [];
  // ignore: non_constant_identifier_names
  String next_marker = "";
  bool isMarker = false;
}

class AliFile {
  AliFile();

  //name updated_at  created_at  size
  static Future<FileListModel> apiFileList(int time, String parentid, String name, {String marker = ""}) async {
    var fcHide = BotToast.showCustomLoading(
        toastBuilder: (cancelFunc) {
          return APILoadingWidget(cancelFunc: cancelFunc, title: (marker == "" ? '列文件：' : "分页中：") + name);
        },
        allowClick: true,
        clickClose: false,
        crossPage: true,
        duration: null,
        align: Alignment.topRight,
        backButtonBehavior: BackButtonBehavior.ignore,
        ignoreContentClick: true,
        backgroundColor: Colors.transparent);

    if (parentid == "") parentid = "root";
    var model = FileListModel(time, parentid, name);
    if (marker != "") model.isMarker = true;

    try {
      var result = await HttpHelper.postToServer("ApiFileList", jsonEncode({'parentid': parentid, "marker": marker}));
      if (result["code"] == 0) {
        model.next_marker = result["next_marker"] as String;
        var items = result["items"];
        List<FileItem> list = [];
        for (int i = 0; i < items.length; i++) {
          var m = new FileItem.fromJson(items[i]);
          list.add(m);
        }
        model.list = list;
        return model;
      } else {
        BotToast.showText(text: "拉取 " + name + " 失败");
      }
    } catch (e) {
      print('apiFileList ' + e.toString());
      model.next_marker = "error";
      BotToast.showText(text: "拉取 " + name + " 失败");
    } finally {
      fcHide();
    }
    return model;
  }

  //name updated_at  created_at  size
  static Future<FileListModel> apiDirList(String parentid, String name) async {
    var fcHide = BotToast.showCustomLoading(
        toastBuilder: (cancelFunc) {
          return APILoadingWidget(cancelFunc: cancelFunc, title: '列文件夹：' + name);
        },
        allowClick: true,
        clickClose: false,
        crossPage: true,
        duration: null,
        align: Alignment.topRight,
        backButtonBehavior: BackButtonBehavior.ignore,
        ignoreContentClick: true,
        backgroundColor: Colors.transparent);

    if (parentid == "") parentid = "root";
    var model = FileListModel(0, parentid, name);

    try {
      var result = await HttpHelper.postToServer("ApiDirList", jsonEncode({'parentid': parentid}));
      if (result["code"] == 0) {
        var items = result["items"];
        List<FileItem> list = [];
        for (int i = 0; i < items.length; i++) {
          if (items[i]["key"] == "break") continue;
          var m = new FileItem.fromJson(items[i]);
          list.add(m);
        }
        model.list = list;
        return model;
      } else {
        BotToast.showText(text: "拉取 " + name + " 失败");
      }
    } catch (e) {
      print('apiFileList ' + e.toString());
      model.key = "error";
      BotToast.showText(text: "拉取 " + name + " 失败");
    } finally {
      fcHide();
    }
    return model;
  }

  static Future<String> apiCreatForder(String parentkey, String dirname) async {
    try {
      print('apiCreatForder');
      var result =
          await HttpHelper.postToServer("ApiCreatForder", jsonEncode({'parentid': parentkey, 'name': dirname}));
      if (result["code"] == 0 && result["file_id"] != "") {
        return "success";
      }
    } catch (e) {
      print('apiCreatForder ' + e.toString());
    }
    return "error";
  }

  static Future<String> apiRename(String key, String newname) async {
    try {
      print('apiRename');
      var result = await HttpHelper.postToServer("ApiRename", jsonEncode({'file_id': key, 'name': newname}));
      if (result["code"] == 0 && result["file_id"] != "") {
        return "success";
      }
    } catch (e) {
      print('apiRename ' + e.toString());
    }
    return "error";
  }

  static Future<int> apiTrashBatch(List<String> filelist) async {
    try {
      print('apiTrashBatch');
      var result = await HttpHelper.postToServer("ApiTrashBatch", jsonEncode({'filelist': filelist}));
      if (result["code"] == 0) {
        return result["count"];
      }
    } catch (e) {
      print('apiTrashBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiMoveBatch(List<String> filelist, String movetoid) async {
    try {
      print('apiMoveBatch');
      var result =
          await HttpHelper.postToServer("ApiMoveBatch", jsonEncode({'filelist': filelist, "movetoid": movetoid}));
      if (result["code"] == 0) {
        return result["count"];
      }
    } catch (e) {
      print('apiMoveBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiTrashDeleteBatch(List<String> filelist) async {
    try {
      print('apiTrashDeleteBatch');
      var result = await HttpHelper.postToServer("ApiTrashDeleteBatch", jsonEncode({'filelist': filelist}));
      if (result["code"] == 0) {
        return result["count"];
      }
    } catch (e) {
      print('apiTrashDeleteBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiTrashRestoreBatch(List<String> filelist) async {
    try {
      print('apiTrashRestoreBatch');
      var result = await HttpHelper.postToServer("ApiTrashRestoreBatch", jsonEncode({'filelist': filelist}));
      if (result["code"] == 0) {
        return result["count"];
      }
    } catch (e) {
      print('apiTrashRestoreBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiFavorBatch(bool isfavor, List<String> filelist) async {
    try {
      print('apiFavorBatch');
      var result =
          await HttpHelper.postToServer("ApiFavorBatch", jsonEncode({"isfavor": isfavor, 'filelist': filelist}));
      if (result["code"] == 0) {
        return result["count"];
      }
    } catch (e) {
      print('apiFavorBatch ' + e.toString());
    }
    return 0;
  }
}
