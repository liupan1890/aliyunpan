import 'dart:convert';

import 'package:alixby/models/FileItem.dart';
import 'package:alixby/utils/APILoadingWidget.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';

import 'HttpHelper.dart';

class FileListModel {
  FileListModel(this.time, this.box, this.key, this.name);
  int time = 0;
  String box = "";
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
  static Future<FileListModel> apiFileList(int time, String box, String parentid, String name,
      {String marker = ""}) async {
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
    var model = FileListModel(time, box, parentid, name);
    if (marker != "") model.isMarker = true;

    try {
      var result = await HttpHelper.postToServer(
          "ApiFileList", jsonEncode({'box': box, 'parentid': parentid, "marker": marker}));
      if (result["code"] == 0) {
        model.next_marker = result["next_marker"] as String;
        var items = result["items"];
        List<FileItem> list = [];
        for (int i = 0; i < items.length; i++) {
          var m = new FileItem.fromJson(box, items[i]);
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
  static Future<FileListModel> apiDirList(String box, String parentid, String name) async {
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
    var model = FileListModel(0, box, parentid, name);

    try {
      var result = await HttpHelper.postToServer("ApiDirList", jsonEncode({'box': box, 'parentid': parentid}));
      if (result["code"] == 0) {
        var items = result["items"];
        List<FileItem> list = [];
        for (int i = 0; i < items.length; i++) {
          if (items[i]["key"] == "break") continue;
          var m = new FileItem.fromJson(box, items[i]);
          list.add(m);
        }
        model.list = list;
        return model;
      } else {
        BotToast.showText(text: "拉取 " + name + " 失败");
      }
    } catch (e) {
      print('apiDirList ' + e.toString());
      model.key = "error";
      BotToast.showText(text: "拉取 " + name + " 失败");
    } finally {
      fcHide();
    }
    return model;
  }

  static Future<String> apiCreatForder(String box, String parentkey, String dirname) async {
    try {
      var result = await HttpHelper.postToServer(
          "ApiCreatForder", jsonEncode({'box': box, 'parentid': parentkey, 'name': dirname}));
      if (result["code"] == 0 && result["file_id"] != "") {
        return "success";
      }
    } catch (e) {
      print('apiCreatForder ' + e.toString());
    }
    return "error";
  }

  static Future<String> apiRename(String box, String key, String newname) async {
    try {
      var result =
          await HttpHelper.postToServer("ApiRename", jsonEncode({'box': box, 'file_id': key, 'name': newname}));
      if (result["code"] == 0 && result["file_id"] != "") {
        return "success";
      }
    } catch (e) {
      print('apiRename ' + e.toString());
    }
    return "error";
  }

  static Future<int> apiRenameBatch(String box, List<String> keylist, List<String> namelist) async {
    try {
      var result = await HttpHelper.postToServer(
          "ApiRenameBatch", jsonEncode({'box': box, 'keylist': keylist, "namelist": namelist}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('apiRenameBatch ' + e.toString());
    }
    return 0;
  }

  // ignore: non_constant_identifier_names
  static Future<List<String>> apiUncompress(String box, String file_id, String target_file_id, String password) async {
    try {
      var result = await HttpHelper.postToServer("ApiUncompress",
          jsonEncode({'box': box, 'file_id': file_id, 'target_file_id': target_file_id, "password": password}));
      if (result["code"] == 0 && result["file_id"] != "") {
        return [result["state"], result["task_id"], result["domain_id"], result["file_id"]];
      } else {
        return [result["message"]];
      }
    } catch (e) {
      print('apiUncompress ' + e.toString());
    }
    return ["error"];
  }

  // ignore: non_constant_identifier_names
  static Future<List<String>> apiUncompressCheck(String box, String file_id, String domain_id, String task_id) async {
    try {
      var result = await HttpHelper.postToServer("ApiUncompressCheck",
          jsonEncode({'box': box, 'file_id': file_id, 'domain_id': domain_id, "task_id": task_id}));
      if (result["code"] == 0 && result["file_id"] != "") {
        return [result["state"], result["progress"].toString()];
      }
    } catch (e) {
      print('apiUncompressCheck ' + e.toString());
    }
    return ["error"];
  }

  static Future<int> apiTrashBatch(String box, List<String> filelist) async {
    try {
      var result = await HttpHelper.postToServer("ApiTrashBatch", jsonEncode({'box': box, 'filelist': filelist}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('apiTrashBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiMoveBatch(String box, List<String> filelist, String movetobox, String movetoid) async {
    try {
      var result = await HttpHelper.postToServer(
          "ApiMoveBatch", jsonEncode({'box': box, 'filelist': filelist, "movetobox": movetobox, "movetoid": movetoid}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('apiMoveBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiCopyBatch(
      String box, String parentid, List<String> filelist, String copytobox, String copytoid) async {
    try {
      var result = await HttpHelper.postToServer(
          "ApiCopyBatch",
          jsonEncode(
              {'box': box, "parentid": parentid, 'filelist': filelist, "copytobox": copytobox, "copytoid": copytoid}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('apiCopyBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiTrashDeleteBatch(String box, List<String> filelist) async {
    try {
      var result = await HttpHelper.postToServer("ApiTrashDeleteBatch", jsonEncode({'box': box, 'filelist': filelist}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('apiTrashDeleteBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiTrashRestoreBatch(String box, List<String> filelist) async {
    try {
      var result =
          await HttpHelper.postToServer("ApiTrashRestoreBatch", jsonEncode({'box': box, 'filelist': filelist}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('apiTrashRestoreBatch ' + e.toString());
    }
    return 0;
  }

  static Future<int> apiFavorBatch(String box, bool isfavor, List<String> filelist) async {
    try {
      var result = await HttpHelper.postToServer(
          "ApiFavorBatch", jsonEncode({'box': box, "isfavor": isfavor, 'filelist': filelist}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('apiFavorBatch ' + e.toString());
    }
    return 0;
  }
}
