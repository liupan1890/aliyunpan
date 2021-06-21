import 'package:json_annotation/json_annotation.dart';

@JsonSerializable(explicitToJson: true)
class FileItem {
  FileItem();
  static FileItem newFileItem(String box, String key, String parentkey, String name) {
    return FileItem()
      ..box = box
      ..key = key
      ..parentkey = parentkey
      ..name = name;
  }

  String box = "";
  String key = "";
  String parentkey = "";
  String name = "";
  String type = "";
  DateTime time = DateTime(1990, 1, 1);
  int size = 0;

  // ignore: non_constant_identifier_names
  String sizestr = "";
  String timestr = "";
  String icon = "";

  bool starred = false;
  String status = "";

  bool get isFile => type == "file";
  bool get isDir => type != "file";
  bool get isWeiFa => status == "illegal";
  List<FileItem> children = [];

  factory FileItem.fromJson(String box, Map<String, dynamic> json) {
    var model = FileItem();
    model.box = box;
    var item = json['key'];
    model.key = item == null ? "" : item as String;
    item = json['name'];
    model.name = item == null ? "" : item as String;
    item = json['type'];
    model.type = item == null ? "" : item as String;
    item = json['time'];
    model.time = item == null ? DateTime(1990, 1, 1) : DateTime.fromMillisecondsSinceEpoch(item * 1000 as int);
    item = json['size'];
    model.size = item == null ? 0 : item as int;
    item = json['starred'];
    model.starred = item == null ? false : item as bool;
    item = json['status'];
    model.status = item == null ? "" : item as String;
    item = json['pid'];
    model.parentkey = item == null ? "" : item as String;
    item = json['sizestr'];
    model.sizestr = item == null ? "" : item as String;
    item = json['timestr'];
    model.timestr = item == null ? "" : item as String;
    item = json['icon'];
    model.icon = item == null ? "" : item as String;

    var cdlist = json["children"];
    if (cdlist != null && cdlist.length > 0) {
      model.children = cdlist.map((m) => new FileItem.fromJson(box, m)).toList();
    }
    return model;
  }
}
