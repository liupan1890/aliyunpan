import 'package:flutter/material.dart';
import 'package:json_annotation/json_annotation.dart';

@JsonSerializable()
class Setting {
  Setting();
  //下载保存位置
  String savePath = '';
  //浅色 day 深色 dark
  String theme = "day";
  //文字缩放1.0  1.1  1.2
  String textScale = "1.0";
  //每次下载都提示保存位置
  bool savePathCheck = true;
  //全局下载速度M
  String downSpeed = "0";
  //最大同时下载数
  String downMax = "3";
  //下载后校验sha1
  bool downSha1Check = false;
  String regKey = "";
  String ver = "";
  String serverVer = "";
  // ignore: non_constant_identifier_names
  static String UIVER = "1.6.6.0";

  factory Setting.fromJson(Map<String, dynamic> json) {
    return Setting()
      ..savePath = json['savePath'] as String
      ..theme = json['theme'] as String
      ..textScale = json['textScale'] as String
      ..savePathCheck = json['savePathCheck'] as bool
      ..downSpeed = json['downSpeed'] as String
      ..downMax = json['downMax'] as String
      ..downSha1Check = json['downSha1Check'] as bool
      ..regKey = json["regKey"] as String
      ..ver = json["ver"] as String
      ..serverVer = json["serverVer"] as String;
  }
  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'savePath': savePath,
      'theme': theme,
      'textScale': textScale,
      'savePathCheck': savePathCheck,
      "downSpeed": downSpeed,
      "downMax": downMax,
      "downSha1Check": downSha1Check,
      "regKey": regKey,
      "ver": ver,
      "serverVer": serverVer
    };
  }

  Color get themeColor {
    if (theme == "dark") return Colors.black;
    return Colors.blue;
  }
}
