import 'package:flutter_linkify/flutter_linkify.dart';

class FileLinkifier extends Linkifier {
  FileLinkifier(String name, String fileid, String box) {
    list.add(FileElement(name, fileid, box));
  }
  final list = <LinkifyElement>[];
  @override
  List<LinkifyElement> parse(elements, options) {
    return list;
  }
}

/// Represents an element containing an email address
class FileElement extends LinkableElement {
  // ignore: non_constant_identifier_names
  final String box;
  final String key;
  final String name;

  FileElement(this.name, this.key, this.box) : super(name, key);

  @override
  String toString() {
    return name;
  }

  @override
  bool operator ==(other) => equals(other);

  @override
  bool equals(other) => other is FileElement && super.equals(other) && other.key == key && other.box == box;

  @override
  int get hashCode => super.hashCode;
}
