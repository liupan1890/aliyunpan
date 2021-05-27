import 'package:json_annotation/json_annotation.dart';

@JsonSerializable()
class PageLeftRowItem {
  PageLeftRowItem();
  static PageLeftRowItem newPageLeftRowItem(String key, String icon, String title) {
    return PageLeftRowItem()
      ..key = key
      ..icon = icon
      ..title = title;
  }

  String key = '';
  String title = '';
  String titleColor = '';
  String url = "";
  String icon = "";
  String iconColor = "";

  factory PageLeftRowItem.fromJson(Map<String, dynamic> json) {
    return PageLeftRowItem()
      ..key = json['key'] as String
      ..title = json['title'] as String
      ..titleColor = json['titleColor'] as String
      ..url = json['url'] as String
      ..icon = json['icon'] as String
      ..iconColor = json['iconColor'] as String;
  }
  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'key': this.key,
      'title': this.title,
      'titleColor': this.titleColor,
      'url': this.url,
      'icon': this.icon,
      'iconColor': this.iconColor
    };
  }
}
