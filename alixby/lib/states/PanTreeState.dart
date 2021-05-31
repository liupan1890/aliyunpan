import 'package:alixby/models/FileItem.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_treeview/flutter_treeview.dart';
import 'package:hovering/hovering.dart';

import 'package:flutter/material.dart';

import 'PanData.dart';

class PanTreeState extends ChangeNotifier {
  PanTreeState() {
    treeController = TreeViewController(children: [_makeNode("", "root", "网盘目录树", 0, [])]);
    width = _updateWidth(treeController.children) * double.parse(Global.settingState.setting.textScale);
    height = _updateHeight(treeController.children);
  }

  TreeViewController treeController = TreeViewController();
  //文件树的最小宽度
  double width = 300;
  //文件数的最小高度
  double height = 300;
  //当前选中的文件夹
  String selectKey = "root";

  pageInitByTheme() {
    Node node = _makeNode("", "root", "网盘目录树", 0, []);
    DirNode dir = node.data;
    var leve = dir.leve + 1;
    //动态新增
    List<Node> children = [];
    FileItem? file = PanData.getFileItem("root");
    if (file != null) {
      var total = file.children.length;
      for (int i = 0; i < total; i++) {
        var m = file.children[i];
        if (m.isDir) children.add(_makeNode(m.parentkey, m.key, m.name, leve, []));
      }
      Node node2 = node.copyWith(expanded: true, parent: true, children: children); //注意这里更新了parent
      //更新并展开
      List<Node> updated = treeController.updateNode("root", node2);
      _updateTree(treeController.copyWith(children: updated, selectedKey: selectKey));
    }
  }

  //页面调用，点击回收站、收藏夹、最近访问、保险箱时触发
  pageMenuSelectKey(String key) {
    Global.userState.updatePageIndex(1);
    selectKey = key;
    _updateTree(treeController.copyWith(selectedKey: key)); //实际上是为了清空文件树的选中节点，因为现在要选中回收站
    if (key == "trash" || key == "favorite" || key == "safebox" || key == "calendar") {
      var file = PanData.getFileItem(key);
      if (file != null) {
        Global.panFileState.pageSelectNode(key); //显示右侧文件列表
        if (file.children.length == 0) {
          PanData.loadFileList(key, key); //触发联网加载
        }
      }
    }
  }

  //内部调用，刷新文件树的显示
  _updateTree(TreeViewController tree) {
    treeController = tree;
    width = _updateWidth(tree.children) * double.parse(Global.settingState.setting.textScale);
    if (width < 290) width = 290;
    height = _updateHeight(treeController.children) + 12;
    notifyListeners();
  }

  //页面调用，点击文件树的一个文件夹时触发
  pageSelectNode(String key, bool expanded) {
    Global.userState.updatePageIndex(1);
    Node? node = treeController.getNode(key);
    if (node != null) {
      if (node.isParent && expanded && node.expanded == false) {
        pageExpandedNode(node.key, true); //选中的文件夹必须展开下级，列出所有子文件夹
      } else {
        print('selectNode ' + key);
        selectKey = key;
        _updateTree(treeController.copyWith(selectedKey: key));
        Global.panFileState.pageSelectNode(key); //显示右侧文件列表
      }
    }
  }

  //页面调用，点击文件树的一个文件夹时触发
  pageExpandedNode(String key, bool expanded) {
    Node? node = treeController.getNode(key);
    if (node != null) {
      selectKey = key;
      //选中并展开
      print((expanded ? 'expanded ' : 'close ') + key);
      Node node2 = node.copyWith(expanded: expanded);
      List<Node> updated = treeController.updateNode(key, node2);
      _updateTree(treeController.copyWith(children: updated, selectedKey: key));
      Global.panFileState.pageSelectNode(key); //显示右侧文件列表

      if (node.parent && node.children.length == 0 && expanded == true) {
        //是文件夹&&children子文件数==0&&要展开显示了
        //注意node.parent,当联网后发现是空文件夹，node.parent会变成false
        PanData.loadFileList(key, node.label); //触发联网加载
      }
    }
  }

  //页面调用，刷新子文件列表
  pageRefreshNode() {
    Global.userState.updatePageIndex(1);
    var key = selectKey;
    Node? node = treeController.getNode(key);
    if (node != null) {
      PanData.loadFileList(key, node.label); //触发联网加载
    } else if (key == "trash" || key == "favorite" || key == "safebox" || key == "calendar") {
      PanData.loadFileList(key, key); //触发联网加载
    }
  }

  //用户退出
  userLogoff() {
    treeController = TreeViewController(children: [_makeNode("", "root", "网盘目录树", 0, [])]);
    selectKey = "root";
    width = _updateWidth(treeController.children) * double.parse(Global.settingState.setting.textScale);
    height = _updateHeight(treeController.children);
    notifyListeners();
  }

  //网络回调更新子文件列表
  notifyFileListChanged(String loadKey) {
    Node? node = treeController.getNode(loadKey);
    if (node != null) {
      DirNode dir = node.data;
      var leve = dir.leve + 1;
      //动态新增
      List<Node> children = [];

      FileItem? file = PanData.getFileItem(loadKey);
      if (file != null) {
        var total = file.children.length;
        for (int i = 0; i < total; i++) {
          var m = file.children[i];
          if (m.isDir) children.add(_makeNode(m.parentkey, m.key, m.name, leve, []));
        }
        Node node2 = node.copyWith(expanded: true, parent: children.length > 0, children: children); //注意这里更新了parent
        //更新并展开
        List<Node> updated = treeController.updateNode(loadKey, node2);
        _updateTree(treeController.copyWith(children: updated, selectedKey: selectKey));
      }
    }
  }

  double _updateWidth(List<Node> childs) {
    double maxwidth = 0;
    for (int i = 0; i < childs.length; i++) {
      DirNode? node = childs[i].data;
      if (node != null) {
        if (node.labelSize > maxwidth) maxwidth = node.labelSize;
        if (childs[i].children.length > 0 && childs[i].expanded == true) {
          var s = _updateWidth(childs[i].children);
          if (s > maxwidth) maxwidth = s;
        }
      }
    }
    return maxwidth;
  }

  double _updateHeight(List<Node> childs) {
    double maxwidth = 0;
    for (int i = 0; i < childs.length; i++) {
      Node node = childs[i];
      maxwidth += 28;
      if (node.children.length > 0 && node.expanded == true) {
        maxwidth += _updateHeight(childs[i].children);
      }
    }
    return maxwidth;
  }

  static Node _makeNode(String parentkey, String key, String label, int leve, List<Node> children) {
    var dir = DirNode(parentkey, key, label, leve);
    return Node(label: dir.label, key: dir.key, parent: true, data: dir, children: children);
  }
}

class DirNode {
  DirNode(this.parentkey, this.key, this.label, this.leve) {
    labelSize = leve * 20 + textWidth(label) + 20 + 40;

    widget = Container(
        key: Key("pdt_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decoration,
                hoverDecoration: hoverDecoration,
                child: Container(
                    key: Key("pdt_rchc_" + key),
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_rchcr_" + key), mainAxisSize: MainAxisSize.max, children: [
                      icon,
                      padding2,
                      Text(
                        label,
                        key: Key("pdt_rchcrt_" + key),
                        style: style,
                      )
                    ])))));

    widgetSelect = Container(
        key: Key("pdt_rc_" + key),
        alignment: Alignment.centerLeft,
        padding: EdgeInsets.only(top: 2, bottom: 2),
        child: UnconstrainedBox(
            alignment: Alignment.centerLeft,
            child: HoverContainer(
                key: Key("pdt_rch_" + key),
                cursor: SystemMouseCursors.click,
                height: 24,
                decoration: decorations,
                hoverDecoration: hoverDecorations,
                child: Container(
                    key: Key("pdt_rchc_" + key),
                    height: 24,
                    padding: padding,
                    child: Row(key: Key("pdt_rchcr_" + key), mainAxisSize: MainAxisSize.max, children: [
                      icons,
                      padding2,
                      Text(
                        label,
                        key: Key("pdt_rchcrt_" + key),
                        style: styles,
                      )
                    ])))));
  }

  String label = "";
  String key = "";
  //父文件夹key
  String parentkey = "";
  //文件夹层级
  int leve = 0;
  //label字符串的显示宽度
  double labelSize = 0;

  Widget widget = Container();
  Widget widgetSelect = Container();

  var decoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG);
  var decorations = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGSelect);

  var hoverDecoration = BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGHover);
  var hoverDecorations =
      BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftRowItemBGSelect);

  var padding = EdgeInsets.only(left: 3, right: 3);
  var padding2 = Padding(padding: EdgeInsets.only(left: 8));
  var icon = Icon(MIcons.folder, size: 20, color: MColors.iconFolder);
  var icons = Icon(MIcons.folder, size: 20, color: MColors.userNavMenuIconHover);
  var style = TextStyle(fontSize: 14, color: MColors.pageLeftRowItemColor);
  var styles = TextStyle(fontSize: 14, color: MColors.userNavMenuIconHover);

  static double textWidth(String text) {
    if (text.isEmpty) return 0;

    final TextPainter textPainter = TextPainter(
        textDirection: TextDirection.ltr,
        locale: Locale("zh", "zh-Hans"),
        text: TextSpan(text: text, style: TextStyle(fontSize: 15)),
        maxLines: 1)
      ..layout(maxWidth: double.infinity);
    return textPainter.size.width;
  }
}
