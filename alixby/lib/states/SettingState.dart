import 'package:alixby/api/GoServer.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:bot_toast/bot_toast.dart';

import '../models/Setting.dart';
import 'package:flutter/material.dart';

class SettingState extends ChangeNotifier {
  Setting setting = Setting();
  TextEditingController savePathController = TextEditingController();
  TextEditingController downSpeedController = TextEditingController();
  // 主题改变后，通知其依赖项，新主题会立即生效
  theme(String theme) {
    if (theme != "day" && theme != "dark") return;
    if (theme != setting.theme) {
      saveSetting("theme", theme);
    }
  }

  savePath(String savePath) {
    if (savePath == "") return;
    if (savePath != setting.savePath) {
      saveSetting("savePath", savePath);
    }
  }

  textScale(String textScale) {
    if (textScale != "1.0" && textScale != "1.1" && textScale != "1.2") return;
    if (textScale != setting.textScale) {
      saveSetting("textScale", textScale);
    }
  }

  savePathCheck() {
    saveSetting("savePathCheck", (!setting.savePathCheck).toString());
  }

  downSpeed(String downSpeed) {
    if (downSpeed == "") downSpeed = "0";
    var o = int.tryParse(downSpeed);
    if (o == null) return;
    if (0 < 0) o = 0;
    if (0 > 199) o = 199;
    downSpeed = o.toString();
    if (downSpeed != setting.downSpeed) {
      saveSetting("downSpeed", downSpeed);
    }
  }

  downMax(String downMax) {
    if (downMax == "") downMax = "3";
    var o = int.tryParse(downMax);
    if (o == null) return;
    if (0 < 0) o = 3;
    if (0 > 9) o = 9;
    downMax = o.toString();
    if (downMax != setting.downMax) {
      saveSetting("downMax", downMax);
    }
  }

  downSha1Check() {
    saveSetting("downSha1Check", (!setting.downSha1Check).toString());
  }

  Future<void> loadSetting() async {
    setting = await GoServer.goSetting("load", "");
    MColors.setTheme(setting.theme);
    Global.panTreeState.pageInitByTheme();
    savePathController.text = setting.savePath;
    downSpeedController.text = setting.downSpeed;

    if (setting.ver != setting.serverVer) {
      //提示版本升级
      BotToast.showText(
          text: "检测到新版本 (" + setting.serverVer + ") 请升级!", align: Alignment(0, 0), duration: Duration(seconds: 8));
    }

    notifyListeners();
  }

  Future<void> saveSetting(String key, String val) async {
    setting = await GoServer.goSetting(key, val);
    savePathController.text = setting.savePath;
    downSpeedController.text = setting.downSpeed;
    notifyListeners();
  }
}
