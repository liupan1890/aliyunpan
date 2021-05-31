import 'dart:convert';

import 'package:alixby/models/PageRightDownItem.dart';

import 'HttpHelper.dart';

class Downloader {
  //创建下载任务
  static Future<int> goDownFile(String parentid, String savepath, List<String> filelist) async {
    try {
      print('goDownFile');
      var result = await HttpHelper.postToServer(
          "GoDownFile", jsonEncode({"parentid": parentid, "savepath": savepath, 'filelist': filelist}));
      if (result["code"] == 0) {
        return result["filecount"];
      }
    } catch (e) {
      print('goDownFile ' + e.toString());
    }
    return 0;
  }

  //查询当前正在下载的任务
  static Future<PageRightDownModel> goDowningList() async {
    var downdata = PageRightDownModel();
    try {
      print('goDowningList');
      var result = await HttpHelper.postToServer("GoDowningList", "");
      if (result["code"] == 0) {
        downdata.filecount = result["filecount"];
        downdata.filelist = [];
        var items = result["filelist"];
        for (int i = 0; i < items.length; i++) {
          var m = new PageRightDownItem.fromJson(items[i], "downing");
          downdata.filelist.add(m);
        }
      }
    } catch (e) {
      downdata.isError = true;
      print('goDowningList ' + e.toString());
    }
    return downdata;
  }

  //查询当前已下载的任务
  static Future<PageRightDownModel> goDownedList() async {
    try {
      print('goDownedList ');
      var result = await HttpHelper.postToServer("GoDownedList", "");
      if (result["code"] == 0) {
        var downdata = PageRightDownModel();
        downdata.filecount = result["filecount"];
        downdata.filelist = [];
        var items = result["filelist"];
        for (int i = 0; i < items.length; i++) {
          var m = new PageRightDownItem.fromJson(items[i], "downed");
          downdata.filelist.add(m);
        }
        return downdata;
      }
    } catch (e) {
      print('goDownedList ' + e.toString());
    }
    return PageRightDownModel();
  }

  static Future<String> goDowningStart(String downid) async {
    try {
      print('goDowningStart');
      var result = await HttpHelper.postToServer("GoDowningStart", jsonEncode({"downid": downid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goDowningStart ' + e.toString());
    }
    return "error";
  }

  static Future<String> goDowningStop(String downid) async {
    try {
      print('goDowningStop');
      var result = await HttpHelper.postToServer("GoDowningStop", jsonEncode({"downid": downid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goDowningStop ' + e.toString());
    }
    return "error";
  }

  static Future<String> goDowningDelete(String downid) async {
    try {
      print('goDowningDelete');
      var result = await HttpHelper.postToServer("GoDowningDelete", jsonEncode({"downid": downid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goDowningDelete ' + e.toString());
    }
    return "error";
  }

  static Future<String> goDowningForder(String downid) async {
    try {
      print('goDowningForder');
      var result = await HttpHelper.postToServer("GoDowningForder", jsonEncode({"downid": downid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goDowningForder ' + e.toString());
    }
    return "error";
  }

  static Future<String> goDownedDelete(String downid) async {
    try {
      print('goDownedDelete ');
      var result = await HttpHelper.postToServer("GoDownedDelete", jsonEncode({"downid": downid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goDownedDelete ' + e.toString());
    }
    return "error";
  }

  static Future<String> goDownedForder(String downid) async {
    try {
      print('goDownedForder');
      var result = await HttpHelper.postToServer("GoDownedForder", jsonEncode({"downid": downid}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goDownedForder ' + e.toString());
    }
    return "error";
  }

  static Future<String> goPlay(String key) async {
    try {
      print('goPlay');
      var result = await HttpHelper.postToServer("GoPlay", jsonEncode({"file_id": key}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goPlay ' + e.toString());
    }
    return "error";
  }

  static Future<String> goImage(String key) async {
    try {
      print('goImage');
      var result = await HttpHelper.postToServer("GoImage", jsonEncode({"file_id": key}));
      if (result["code"] == 0) {
        return result["url"];
      }
    } catch (e) {
      print('goImage ' + e.toString());
    }
    return "error";
  }
}
