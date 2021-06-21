import 'package:alixby/states/FileState.dart';
import 'package:alixby/states/TreeState.dart';
import 'package:alixby/states/pageDownState.dart';
import 'package:alixby/states/pageRssMiaoChuanState.dart';
import 'package:alixby/states/pageRssSearchState.dart';
import 'package:alixby/states/UserState.dart';
import 'package:alixby/states/SettingState.dart';

class PanFileState extends FileState {
  PanFileState();
}

class XiangCeFileState extends FileState {
  XiangCeFileState();
}

class PanTreeState extends TreeState {
  PanTreeState() : super('box', "网盘目录树", 1);
}

class XiangCeTreeState extends TreeState {
  XiangCeTreeState() : super('xiangce', '相册目录树', 2);
}

class Global {
  // 是否为release版
  static bool get isRelease => bool.fromEnvironment("dart.vm.product");
  static String get appTitle => "阿里云盘小白羊版 v1.6.21";
  static String get appVer => "v1.6.21";

  static PanTreeState panTreeState = PanTreeState();
  static XiangCeTreeState xiangceTreeState = XiangCeTreeState();
  static PanFileState panFileState = PanFileState();
  static XiangCeFileState xiangceFileState = XiangCeFileState();

  static UserState userState = UserState();
  static SettingState settingState = SettingState();
  static PageDownState pageDownState = PageDownState();
  static PageRssMiaoChuanState pageRssMiaoChuanState = PageRssMiaoChuanState();
  static PageRssSearchState pageRssSearchState = PageRssSearchState();

  static int ctrlTime = 0;
  static int shiftTime = 0;
  static bool ctrlMac = false;
  static bool shiftMac = false;
  static bool get isCtrl => ctrlMac || DateTime.now().millisecondsSinceEpoch - 600 < ctrlTime; //1秒内按下过crtl
  static bool get isShift => shiftMac || DateTime.now().millisecondsSinceEpoch - 600 < shiftTime; //1秒内按下过shift
  static set isCtrl(bool val) {
    ctrlTime = DateTime.now().millisecondsSinceEpoch;
  }

  static set isShift(bool val) {
    shiftTime = DateTime.now().millisecondsSinceEpoch;
  }

  static FileState getFileState(String box) {
    if (box == "xiangce") return xiangceFileState;
    return panFileState;
  }

  static TreeState getTreeState(String box) {
    if (box == "xiangce") return xiangceTreeState;
    return panTreeState;
  }

  static void pageInitByTheme() {
    panTreeState.pageInitByTheme();
    xiangceTreeState.pageInitByTheme();
  }

  static void pageExpandedNodeByRoot() {
    panTreeState.pageExpandedNode('root', true);
    xiangceTreeState.pageExpandedNode('root', true);
  }

  static void pageClearNodeByLogoff() {
    panTreeState.userLogoff();
    panFileState.userLogoff();
    xiangceTreeState.userLogoff();
    xiangceFileState.userLogoff();
  }

  //初始化全局信息，会在APP启动时执行
  static Future init() async {}
}
