import 'dart:convert';

import 'package:alixby/api/HttpHelper.dart';
import 'package:alixby/models/PageRightMiaoChuanItem.dart';

class LinkFileModel {
  LinkFileModel();

  static LinkFileModel newFileItem(String name, int size, String hash, bool isdir) {
    return LinkFileModel()
      ..name = name
      ..hash = hash
      ..size = size
      ..isdir = isdir;
  }

  String name = ""; //name or jianjie
  String hash = ""; //hash or errormsg
  int size = 0;
  int leve = 0;
  bool isdir = false;
  List<LinkFileModel> children = [];
  String fulljson = "";

  factory LinkFileModel.fromJson(Map<String, dynamic> json) {
    var model = LinkFileModel();
    var item = json['Name'];
    model.name = item == null ? "" : item as String;
    item = json['Message'];
    model.hash = item == null ? "" : item as String;
    item = json['Size'];
    model.size = item == null ? 0 : item as int;
    model.isdir = true;
    model.children = [];
    var dirlist = json["DirList"];
    if (dirlist != null && dirlist.length > 0) {
      for (var n = 0; n < dirlist.length; n++) {
        var link = new LinkFileModel.fromJson(dirlist[n]);
        model.children.add(link);
      }
    }

    var filelist = json["FileList"];
    if (filelist != null && filelist.length > 0) {
      for (var n = 0; n < filelist.length; n++) {
        var str = filelist[n] as String;
        try {
          var link = new LinkFileModel();
          link.isdir = false;
          var i = str.lastIndexOf('|');
          link.hash = str.substring(i + 1);
          str = str.substring(0, i);
          i = str.lastIndexOf('|');
          link.size = int.parse(str.substring(i + 1));
          str = str.substring(0, i);
          link.name = str;
          model.children.add(link);
        } catch (e) {
          print('LinkFileModel.fromJson' + e.toString());
        }
      }
    }

    return model;
  }
}

class Linker {
  Linker();

//查询当前已下载的任务
  static Future<List<PageRightMiaoChuanItem>> goLinkList() async {
    List<PageRightMiaoChuanItem> filelist = [];
    try {
      print('goLinkList ');
      var result = await HttpHelper.postToServer("GoLinkList", "");
      if (result["code"] == 0) {
        var items = result["filelist"];
        for (int i = 0; i < items.length; i++) {
          var m = new PageRightMiaoChuanItem.fromJson(items[i]);
          filelist.add(m);
        }
        return filelist;
      }
    } catch (e) {
      print('goLinkList ' + e.toString());
    }
    return filelist;
  }

  static Future<String> goLinkDelete(String link) async {
    try {
      print('goLinkDelete ');
      var result = await HttpHelper.postToServer("GoLinkDelete", jsonEncode({"link": link}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goLinkDelete ' + e.toString());
    }
    return "error";
  }

  static Future<String> goLinkCreat(String jianjie, bool ispublic, String password, String outday, String outsave,
      String parentid, List<String> filelist) async {
    try {
      var result = await HttpHelper.postToServer(
          "GoLinkCreat",
          jsonEncode({
            "jianjie": jianjie,
            "ispublic": ispublic,
            "password": password,
            "outday": outday,
            "outsave": outsave,
            "parentid": parentid,
            "filelist": filelist
          }));
      if (result["code"] == 0) {
        return result["link"];
      } else if (result["code"] == 503) {
        return result["message"];
      }
    } catch (e) {
      print('goLinkCreat ' + e.toString());
    }
    return "未知错误";
  }

  static Future<LinkFileModel> goLinkParse(String link, String password) async {
    LinkFileModel parse = LinkFileModel.newFileItem("", 0, "error", true);
    try {
      var result = await HttpHelper.postToServer("GoLinkParse", jsonEncode({"link": link, "password": password}));
      if (result["code"] == 0) {
        //正确返回文件列表
        parse = LinkFileModel.fromJson(result["link"]);
        parse.fulljson = json.encode(result["link"]);
      } else if (result["code"] == 503) {
        parse.hash = result["message"];
      }
    } catch (e) {
      print('goLinkParse ' + e.toString());
    }
    return parse;
  }

  static Future<int> goLinkUpload(String parentid, String linkstr) async {
    try {
      var result =
          await HttpHelper.postToServer("GoLinkUpload", jsonEncode({"parentid": parentid, "linkstr": linkstr}));
      if (result["code"] == 0) {
        //正确返回文件列表
        return result["filecount"];
      }
    } catch (e) {
      print('goLinkUpload ' + e.toString());
    }
    return 0;
  }
}
