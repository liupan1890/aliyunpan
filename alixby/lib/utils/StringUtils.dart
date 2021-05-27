import 'dart:math';

class StringUtils {
  StringUtils();

  static String subStr(String html, String key) {
    var findkey = '"' + key + '":"';
    var findindex = html.indexOf(findkey);
    if (findindex < 0) return "";
    var find = html.substring(findindex + findkey.length);
    find = find.substring(0, find.indexOf('"'));
    return find;
  }

  static String subInt(String html, String key) {
    var findkey = '"' + key + '":';
    var findindex = html.indexOf(findkey);
    if (findindex < 0) return "";
    var find = html.substring(findindex + findkey.length);

    var f1 = find.indexOf(',');
    var f2 = find.indexOf('}');
    var f0 = 0;
    if (f1 >= 0) f0 = f1;
    if (f2 >= 0) f0 = min(f0, f2);
    find = find.substring(0, f0);
    return find;
  }

  static String formatLastTime(double lasttime) {
    var info = '';
    if (lasttime > 86400) {
      var tday = (lasttime / 86400).floor();
      if (tday > 99) {
        info += '∞';
      } else {
        info += (lasttime / 86400).floor().toString() + '天';
      }
      lasttime = lasttime % 86400;
    }
    if (lasttime > 3600) {
      info += (lasttime / 3600).floor().toString() + '小时';
      lasttime = lasttime % 3600;
    }
    if (lasttime > 60 && info.length < 6) {
      info += (lasttime / 60).floor().toString().padLeft(2, '0') + '分';
      lasttime = lasttime % 60;
    }
    if (lasttime > 0 && info.length < 6) {
      info += lasttime.toStringAsFixed(0).padLeft(2, '0') + '秒';
    }
    return info;
  }
}
