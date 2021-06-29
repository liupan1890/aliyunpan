import 'dart:math';

import 'package:flutter/widgets.dart';

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
        return '∞';
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

  static String joinChar(String str) {
    return Characters(str).replaceAll(Characters(''), Characters('\u{200B}')).toString();
  }

  static int sortNumber1(String a, String b) {
    RegExp exp = new RegExp(r"[0-9]+");
    var aNums = exp.allMatches(a);
    var bNums = exp.allMatches(b);

    if (aNums.isEmpty || bNums.isEmpty) {
      return a.compareTo(b);
    }
    for (var i = 0, minLen = min(aNums.length, bNums.length); i < minLen; i++) {
      var ai = aNums.elementAt(i);
      var bi = bNums.elementAt(i);
      var aIndex = ai.start;
      var bIndex = bi.start;

      var aPrefix = a.substring(0, aIndex);
      var bPrefix = b.substring(0, bIndex);

      if (aIndex != bIndex || aPrefix != bPrefix) {
        return a.compareTo(b);
      }
      var astr = ai.group(0).toString(); //0012
      var aval = int.parse(astr); //12
      var bstr = bi.group(0).toString(); //012
      var bval = int.parse(bstr); //12

      if (astr == bstr) {
        if (i == minLen - 1) {
          //最后一次了，必须比较了
          return a.substring(aIndex).compareTo(b.substring(bIndex));
        }
      } else if (aval == bval) {
        return astr.lastIndexOf(aval.toString()) - bstr.lastIndexOf(bval.toString()); //比较数字位置
      } else {
        return aval - bval; //比较数字大小
      }
    }
    return a.compareTo(b);
  }
}
