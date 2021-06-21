import 'dart:convert';
import 'HttpHelper.dart';

class AliUserInfo {
  String userID = "";
  String userName = "";
  String userFace = "";
  String panUsed = "";
  String panTotal = "";
  // ignore: non_constant_identifier_names
  String drive_size = "";
  // ignore: non_constant_identifier_names
  String safe_box_size = "";
  // ignore: non_constant_identifier_names
  String upload_size = "";
}

class AliLogin {
  AliLogin();

  static Future<AliUserInfo> apiUserInfo() async {
    try {
      var result = await HttpHelper.postToServer("ApiUserInfo", "");
      if (result["code"] == 0) {
        String infojson = result["info"];
        if (infojson != "") {
          Map<String, dynamic> info = jsonDecode(infojson);
          var user = AliUserInfo();
          user.userID = info["userID"];
          user.userName = info["userName"];
          user.userFace = info["userFace"];
          user.panUsed = info["panUsed"];
          user.panTotal = info["panTotal"];
          user.drive_size = info["drive_size"];
          user.safe_box_size = info["safe_box_size"];
          user.upload_size = info["upload_size"];
          return user;
        }
      }
    } catch (e) {
      print('apiUserInfo ' + e.toString());
    }
    return AliUserInfo();
  }

  static Future apiUserLogoff() async {
    try {
      await HttpHelper.postToServer("ApiUserLogoff", "");
    } catch (e) {
      print('apiUserLogoff ' + e.toString());
    }
  }

  static Future<String> apiQrcodeGenerate() async {
    try {
      var result = await HttpHelper.postToServer("ApiQrcodeGenerate", "");
      if (result["code"] == 0) return result["codeContent"];
    } catch (e) {
      print('apiQrcodeGenerate ' + e.toString());
    }
    return "";
  }

  static Future<String> apiQrcodeQuery() async {
    try {
      var result = await HttpHelper.postToServer("ApiQrcodeQuery", "");
      if (result["code"] == 0) return result["loginResult"];
    } catch (e) {
      print('apiQrcodeQuery ' + e.toString());
    }
    return "nothing";
  }

  static Future<String> apiTokenRefresh(String refreshToken) async {
    if (refreshToken == "") return "retry";
    try {
      var result = await HttpHelper.postToServer("ApiTokenRefresh", jsonEncode({'refreshToken': refreshToken}));
      if (result["code"] == 0) return result["loginResult"];
    } catch (e) {
      print('apiTokenRefresh ' + e.toString());
    }
    return "retry";
  }
}
