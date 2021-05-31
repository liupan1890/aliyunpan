import 'package:alixby/states/pageDownState.dart';
import '../states/UserState.dart';
import '../states/SettingState.dart';
import 'PanTreeState.dart';
import 'PanFileState.dart';

class Global {
  // 是否为release版
  static bool get isRelease => bool.fromEnvironment("dart.vm.product");
  static String get appTitle => "阿里云盘小白羊版 v1.5.31";
  static String get appVer => "v1.5.31";

  static UserState userState = UserState();
  static SettingState settingState = SettingState();
  static PanTreeState panTreeState = PanTreeState();
  static PanFileState panFileState = PanFileState();
  static PageDownState pageDownState = PageDownState();

  static int ctrlTime = 0;
  static int shiftTime = 0;
  static bool get isCtrl => DateTime.now().millisecondsSinceEpoch - 600 < ctrlTime; //1秒内按下过crtl
  static bool get isShift => DateTime.now().millisecondsSinceEpoch - 600 < shiftTime; //1秒内按下过shift
  static set isCtrl(bool val) {
    ctrlTime = DateTime.now().millisecondsSinceEpoch;
  }

  static set isShift(bool val) {
    shiftTime = DateTime.now().millisecondsSinceEpoch;
  }

  //初始化全局信息，会在APP启动时执行
  static Future init() async {}
}
