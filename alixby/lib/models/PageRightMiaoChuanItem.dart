import 'package:json_annotation/json_annotation.dart';

@JsonSerializable()
class PageRightMiaoChuanItem {
  PageRightMiaoChuanItem();

  String link = '';
  String linkFull = '';
  int logTime = 0;
  String logTimeStr = "";
  bool selected = false;

  factory PageRightMiaoChuanItem.fromJson(Map<String, dynamic> json) {
    var m = PageRightMiaoChuanItem();

    m.linkFull = json['Link'] as String;
    m.link = m.linkFull;
    if (m.link.indexOf("密码") > 0) {
      m.link = m.link.substring(0, m.link.indexOf("密码"));
    }
    m.logTime = json['LogTime'] as int;
    var dt2 = new DateTime.fromMillisecondsSinceEpoch(m.logTime * 1000);
    m.logTimeStr =
        "${dt2.year.toString()}-${dt2.month.toString().padLeft(2, '0')}-${dt2.day.toString().padLeft(2, '0')} ${dt2.hour.toString().padLeft(2, '0')}:${dt2.minute.toString().padLeft(2, '0')}:${dt2.second.toString().padLeft(2, '0')}";
    return m;
  }
}
