import 'dart:convert';

import 'package:alixby/models/PageRightDownItem.dart';

import 'HttpHelper.dart';

class Uploader {
  //创建上传任务
  static Future<int> goUploadFile(String parentid, List<String> filelist) async {
    try {
      print('goUploadFile');
      var result =
          await HttpHelper.postToServer("GoUploadFile", jsonEncode({"parentid": parentid, 'filelist': filelist}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('goUploadFile ' + e.toString());
    }
    return 0;
  }

  //创建上传任务
  static Future<int> goUploadDir(String parentid, String dirpath) async {
    try {
      print('goUploadDir');
      var result = await HttpHelper.postToServer("GoUploadDir", jsonEncode({"parentid": parentid, 'dirpath': dirpath}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('goUploadDir ' + e.toString());
    }
    return 0;
  }

  //查询当前正在上传的任务
  static Future<PageRightDownModel> goUploadingList() async {
    var uploaddata = PageRightDownModel();
    try {
      print('goUploadingList');
      var result = await HttpHelper.postToServer("GoUploadingList", "");
      if (result["code"] == 0) {
        uploaddata.filecount = result["filecount"];
        uploaddata.filelist = [];
        var items = result["filelist"];
        for (int i = 0; i < items.length; i++) {
          var m = new PageRightDownItem.fromJson(items[i], "uploading");
          uploaddata.filelist.add(m);
        }
      }
    } catch (e) {
      uploaddata.isError = true;
      print('goUploadingList ' + e.toString());
    }
    return uploaddata;
  }

  //查询当前已上传的任务
  static Future<PageRightDownModel> goUploadList() async {
    try {
      print('goUploadList ');
      var result = await HttpHelper.postToServer("GoUploadList", "");
      if (result["code"] == 0) {
        var uploaddata = PageRightDownModel();
        uploaddata.filecount = result["filecount"];
        uploaddata.filelist = [];
        var items = result["filelist"];
        for (int i = 0; i < items.length; i++) {
          var m = new PageRightDownItem.fromJson(items[i], "upload");
          uploaddata.filelist.add(m);
        }
        return uploaddata;
      }
    } catch (e) {
      print('goUploadList ' + e.toString());
    }
    return PageRightDownModel();
  }

  static Future<String> goUploadingStart(String uploadid) async {
    try {
      print('goUploadingStart');
      var result = await HttpHelper.postToServer("GoUploadingStart", jsonEncode({"uploadid": uploadid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goUploadingStart ' + e.toString());
    }
    return "error";
  }

  static Future<String> goUploadingStop(String uploadid) async {
    try {
      print('goUploadingStop');
      var result = await HttpHelper.postToServer("GoUploadingStop", jsonEncode({"uploadid": uploadid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goUploadingStop ' + e.toString());
    }
    return "error";
  }

  static Future<String> goUploadingDelete(String uploadid) async {
    try {
      print('goUploadingDelete');
      var result = await HttpHelper.postToServer("GoUploadingDelete", jsonEncode({"uploadid": uploadid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goUploadingDelete ' + e.toString());
    }
    return "error";
  }

  static Future<String> goUploadingForder(String uploadid) async {
    try {
      print('goUploadingForder');
      var result = await HttpHelper.postToServer("GoUploadingForder", jsonEncode({"uploadid": uploadid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goUploadingForder ' + e.toString());
    }
    return "error";
  }

  static Future<String> goUploadDelete(String uploadid) async {
    try {
      print('goUploadDelete ');
      var result = await HttpHelper.postToServer("GoUploadDelete", jsonEncode({"uploadid": uploadid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goUploadDelete ' + e.toString());
    }
    return "error";
  }

  static Future<String> goUploadForder(String uploadid) async {
    try {
      print('goUploadForder');
      var result = await HttpHelper.postToServer("GoUploadForder", jsonEncode({"uploadid": uploadid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goUploadForder ' + e.toString());
    }
    return "error";
  }
}
