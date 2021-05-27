import 'package:json_annotation/json_annotation.dart';

@JsonSerializable(explicitToJson: true)
class FileItem {
  FileItem();
  static FileItem newFileItem(String key, String parentkey, String name) {
    return FileItem()
      ..key = key
      ..parentkey = parentkey
      ..name = name;
  }

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
  List<FileItem> children = [];

  factory FileItem.fromJson(Map<String, dynamic> json) {
    var model = FileItem();
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
    if (cdlist != null) {
      model.children = cdlist.map((m) => new FileItem.fromJson(m)).toList();
    }

    return model;
  }
}
