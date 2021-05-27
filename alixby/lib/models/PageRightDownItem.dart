import 'package:alixby/utils/StringUtils.dart';
import 'package:filesize/filesize.dart';
import 'package:json_annotation/json_annotation.dart';

@JsonSerializable()
class PageRightDownItem {
  PageRightDownItem();

  String key = '';
  String title = '';
  String path = '';
  String fileSize = "";
  String lastTime = "";
  int downProgress = 0;
  String downSpeed = "0B/s";
  bool selected = false;
  String downPage = "";
  bool isDowning = false;
  bool isFailed = false;
  String failedMessage = "";

  factory PageRightDownItem.fromJson(Map<String, dynamic> json, String downPage) {
    var size = json['size'] as int;

    var m = PageRightDownItem()
      ..key = json['id'] as String
      ..title = json['name'] as String
      ..path = json['sp'] as String
      ..fileSize = filesize(size)
      ..downProgress = json['dp'] as int
      ..downSpeed = json['spd'] as String
      ..isDowning = json['isd'] as bool
      ..isFailed = json['isf'] as bool
      ..failedMessage = json['fm'] as String
      ..downPage = downPage;
    if (m.isDowning) {
      var downSize = json['ds'] as int;
      var downSpeed = json['dpd'] as int;
      m.lastTime = StringUtils.formatLastTime((size - downSize + 1) / (downSpeed + 1));
    }
    return m;
  }
}

class PageRightDownModel {
  bool isError = false;
  int filecount = 0;
  List<PageRightDownItem> filelist = [];
}
