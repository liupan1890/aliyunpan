import 'dart:convert';

import 'package:alixby/api/HttpHelper.dart';
import 'package:alixby/models/PageRightFileItem.dart';
import 'package:alixby/models/PageRightMiaoChuanItem.dart';
import 'package:alixby/utils/APILoadingWidget.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';

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
  String shareid = ""; //分享链接 特殊
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

class LinkSearchModel {
  List<PageRightFileItem> searchlist = [];
  int pageIndex = 0;
  int pageCount = 0;
  int fileCount = 0;
}

class Linker {
  Linker();

  static Future<List<PageRightMiaoChuanItem>> goLinkList() async {
    List<PageRightMiaoChuanItem> filelist = [];
    try {
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
      var result = await HttpHelper.postToServer("GoLinkDelete", jsonEncode({"link": link}));
      if (result["code"] == 0) {
        return "success";
      }
    } catch (e) {
      print('goLinkDelete ' + e.toString());
    }
    return "error";
  }

  static Future<List<String>> goLinkCreatFile(
      String filename, String jianjie, String box, String parentid, List<String> filelist) async {
    List<String> list = [];
    try {
      var result = await HttpHelper.postToServer(
          "GoLinkCreatFile",
          jsonEncode(
              {"jianjie": jianjie, "filename": filename, 'box': box, "parentid": parentid, "filelist": filelist}));
      if (result["code"] == 0) {
        list.add(result["info"]); //n个文件 n个文件夹
        list.add(result["aliyun"]); //aliyunpan://xxxx
        return list;
      } else if (result["code"] == 503) {
        list.add(result["message"]);
        return list;
      }
    } catch (e) {
      print('goLinkCreatFile ' + e.toString());
    }
    list.add("未知错误");
    return list;
  }

  static Future<LinkFileModel> goLinkParse(String link, String password, bool ispublic) async {
    LinkFileModel parse = LinkFileModel.newFileItem("", 0, "error", true);
    try {
      var result = await HttpHelper.postToServer(
          "GoLinkParse", jsonEncode({"link": link, "password": password, "ispublic": ispublic}));
      if (result["code"] == 0) {
        //正确返回文件列表
        parse = LinkFileModel.fromJson(result["link"]);
        parse.fulljson = json.encode(result["link"]);
        parse.name = result["info"] + "  " + parse.name;
      } else if (result["code"] == 503) {
        parse.hash = result["message"];
      }
    } catch (e) {
      print('goLinkParse ' + e.toString());
    }
    return parse;
  }

  static Future<LinkFileModel> goLinkShare(String link, String password, bool ispublic) async {
    LinkFileModel parse = LinkFileModel.newFileItem("", 0, "error", true);
    try {
      var result = await HttpHelper.postToServer(
          "GoLinkShare", jsonEncode({"link": link, "password": password, "ispublic": ispublic}));
      if (result["code"] == 0) {
        //正确返回文件列表
        parse = LinkFileModel.fromJson(result["link"]);
        parse.fulljson = json.encode(result["link"]);
        parse.name = result["info"] + "  " + parse.name;
        if (link.toLowerCase().contains("aliyundrive.com/s/")) {
          parse.shareid = result["shareid"];
        }
      } else if (result["code"] == 503) {
        parse.hash = result["message"];
      }
    } catch (e) {
      print('goLinkParse ' + e.toString());
    }
    return parse;
  }

  static Future<int> goLinkShareUpload(String box, String parentid, String shareid, String linkstr) async {
    try {
      var result = await HttpHelper.postToServer(
          "GoLinkShareUpload", jsonEncode({'box': box, "parentid": parentid, "shareid": shareid, "linkstr": linkstr}));
      if (result["code"] == 0) {
        //正确返回文件列表
        return result["filecount"];
      }
    } catch (e) {
      print('goLinkUpload ' + e.toString());
    }
    return 0;
  }

  static Future<int> goLinkUpload(String box, String parentid, String linkstr) async {
    try {
      var result = await HttpHelper.postToServer(
          "GoLinkUpload", jsonEncode({'box': box, "parentid": parentid, "linkstr": linkstr}));
      if (result["code"] == 0) {
        //正确返回文件列表
        return result["filecount"];
      }
    } catch (e) {
      print('goLinkUpload ' + e.toString());
    }
    return 0;
  }

//name updated_at  created_at  size
  static Future<LinkSearchModel> goLinkSearch(String search, int pageindex) async {
    if (search == "") search = "search";
    LinkSearchModel linksearch = new LinkSearchModel();
    linksearch.searchlist = [];
    linksearch.pageIndex = pageindex;
    var fcHide = BotToast.showCustomLoading(
        toastBuilder: (cancelFunc) {
          return APILoadingWidget(cancelFunc: cancelFunc, title: "搜索中：" + search);
        },
        allowClick: true,
        clickClose: false,
        crossPage: true,
        duration: null,
        align: Alignment.topRight,
        backButtonBehavior: BackButtonBehavior.ignore,
        ignoreContentClick: true,
        backgroundColor: Colors.transparent);

    try {
      var result =
          await HttpHelper.postToServer("GoLinkSearch", jsonEncode({'search': search, "pageindex": pageindex}));
      if (result["code"] == 0) {
        linksearch.fileCount = result["fileCount"];
        linksearch.pageCount = (linksearch.fileCount / 100).ceil();

        final Icon iconFile = Icon(MIcons.wenjian, key: Key("file"), size: 22, color: MColors.iconFile);
        final Icon iconImage = Icon(MIcons.file_img, key: Key("image"), size: 22, color: MColors.iconImage);
        final Icon iconVideo = Icon(MIcons.file_video, key: Key("video"), size: 22, color: MColors.iconVideo);
        final Icon iconAudio = Icon(MIcons.file_audio, key: Key("audio"), size: 22, color: MColors.iconAudio);
        final Icon iconZip = Icon(MIcons.file_zip, key: Key("zip"), size: 22, color: MColors.iconZip);
        final Icon iconTxt = Icon(MIcons.file_txt2, key: Key("txt"), size: 22, color: MColors.iconTxt);

        var items = result["items"];
        List<PageRightFileItem> list = [];
        for (int i = 0; i < items.length; i++) {
          var item = items[i];
          var model = PageRightFileItem.newPageRightFileItem(
              'search',
              item["Key"],
              (item["Icon"] == "video"
                  ? iconVideo
                  : item["Icon"] == "audio"
                      ? iconAudio
                      : item["Icon"] == "image"
                          ? iconImage
                          : item["Icon"] == "txt"
                              ? iconTxt
                              : item["Icon"] == "zip"
                                  ? iconZip
                                  : iconFile),
              item["Name"],
              item["Size"],
              DateTime.fromMillisecondsSinceEpoch(item["Time"] * 1000 as int),
              false,
              false,
              item["Hash"]);
          list.add(model);
        }
        linksearch.searchlist = list;
        return linksearch;
      } else {
        BotToast.showText(text: "拉取搜索 " + search + " 失败");
      }
    } catch (e) {
      print('goLinkSearch ' + e.toString());
      BotToast.showText(text: "拉取搜索 " + search + " 失败");
    } finally {
      fcHide();
    }
    return linksearch;
  }
}
