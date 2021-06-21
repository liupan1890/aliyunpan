import 'dart:io';

import 'package:alixby/api/GoServer.dart';
import 'package:alixby/states/SettingState.dart';
import 'package:alixby/pagepan/DropUploadDialog.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:split_view/split_view.dart';

import 'utils/MColors.dart';
import 'utils/handleError.dart';

import 'views/PageLeft.dart';
import 'views/PageRight.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'states/Global.dart';
//import 'package:flutter/painting.dart';
import 'package:dropfiles_window/dropfiles_window.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  handleError(runApp(
    MultiProvider(
      key: navigatorKey,
      providers: [
        ChangeNotifierProvider(create: (_) => Global.userState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.settingState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.panTreeState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.xiangceTreeState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.panFileState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.xiangceFileState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.pageDownState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.pageRssMiaoChuanState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.pageRssSearchState, lazy: false),
      ],
      child: MyApp(),
    ),
  ));
  //980
  Future.delayed(Duration(milliseconds: 200), () {
    GoServer.connServer();
  });

  //
  if (Platform.isWindows == true) {
    print("DropfilesWindow");
    UniqueKey? upload;
    // Platform messages may fail, so we use a try/catch PlatformException.
    try {
      DropfilesWindow.modifyWindowAcceptFiles((String files) {
        var box = Global.userState.box;
        var parentid = Global.getFileState(box).pageRightDirKey;
        var parentname = Global.getFileState(box).getSelectedFileParentPath();
        if (upload != null) {
          BotToast.remove(upload!, "upload");
        }
        Future.delayed(Duration(milliseconds: 100), () {
          var key = UniqueKey();
          upload = key;
          BotToast.showEnhancedWidget(
              toastBuilder: (_) {
                return WillPopScope(
                    onWillPop: () async => false, //关键代码
                    child: DropUploadDialog(
                        ukey: key, box: box, parentid: parentid, parentname: parentname, files: files));
              },
              key: key,
              groupKey: "upload",
              allowClick: false,
              clickClose: false,
              crossPage: true,
              duration: null,
              backButtonBehavior: BackButtonBehavior.ignore,
              ignoreContentClick: false,
              backgroundColor: Color(0x99000000),
              onClose: () {
                upload = null;
              });
        });
      });
    } on PlatformException {
      BotToast.showText(text: '拖放文件出错,请重试');
    }
  }
}

final GlobalKey<NavigatorState> navigatorKey = new GlobalKey<NavigatorState>();

class MyApp extends StatelessWidget {
  // This widget is the root of your application.

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        //showPerformanceOverlay: true, //性能监视器
        //checkerboardOffscreenLayers: true,
        //checkerboardRasterCacheImages: true,
        title: Global.appTitle,
        localizationsDelegates: [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: [const Locale("zh", "zh-Hans")],
        theme: ThemeData(
            primaryColor: Colors.blue,
            fontFamily: "opposans",
            elevatedButtonTheme: ElevatedButtonThemeData(
                style: ButtonStyle(
                    foregroundColor: MaterialStateProperty.all(MColors.elevatedBtnColor),
                    side: MaterialStateProperty.all(BorderSide(width: 1, color: MColors.elevatedBtnBorderColor)),
                    shape: MaterialStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(3))),
                    minimumSize: MaterialStateProperty.all(Size(0, 30)),
                    padding: MaterialStateProperty.all(EdgeInsets.symmetric(horizontal: 12, vertical: 6)),
                    elevation: MaterialStateProperty.all(0),
                    visualDensity: VisualDensity.comfortable,
                    shadowColor: MaterialStateProperty.all(Colors.transparent),
                    backgroundColor: MaterialStateProperty.all(MColors.elevatedBtnBG),
                    textStyle:
                        MaterialStateProperty.all(TextStyle(color: MColors.elevatedBtnColor, fontFamily: "opposans")),
                    overlayColor: MaterialStateProperty.resolveWith((states) {
                      if (states.contains(MaterialState.pressed)) return MColors.elevatedBtnBGActive;
                      if (states.contains(MaterialState.focused)) return MColors.elevatedBtnBGHover;
                      if (states.contains(MaterialState.hovered)) return MColors.elevatedBtnBGHover;
                      if (states.contains(MaterialState.dragged)) return MColors.elevatedBtnBGHover;
                      if (states.contains(MaterialState.selected)) return MColors.elevatedBtnBGHover;
                      return Colors.transparent;
                    }))),
            outlinedButtonTheme: OutlinedButtonThemeData(
                style: ButtonStyle(
                    foregroundColor: MaterialStateProperty.all(MColors.outlineBtnColor),
                    side: MaterialStateProperty.all(BorderSide(width: 1, color: MColors.outlineBtnBorderColor)),
                    shape: MaterialStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(3))),
                    minimumSize: MaterialStateProperty.all(Size(0, 30)),
                    padding: MaterialStateProperty.all(EdgeInsets.symmetric(horizontal: 12, vertical: 6)),
                    elevation: MaterialStateProperty.all(0),
                    visualDensity: VisualDensity.comfortable,
                    shadowColor: MaterialStateProperty.all(Colors.transparent),
                    backgroundColor: MaterialStateProperty.all(MColors.outlineBtnBG),
                    textStyle:
                        MaterialStateProperty.all(TextStyle(color: MColors.outlineBtnColor, fontFamily: "opposans")),
                    overlayColor: MaterialStateProperty.resolveWith((states) {
                      if (states.contains(MaterialState.pressed)) return MColors.outlineBtnBGActive;
                      if (states.contains(MaterialState.focused)) return MColors.outlineBtnBGHover;
                      if (states.contains(MaterialState.hovered)) return MColors.outlineBtnBGHover;
                      if (states.contains(MaterialState.dragged)) return MColors.outlineBtnBGHover;
                      if (states.contains(MaterialState.selected)) return MColors.outlineBtnBGHover;
                      return Colors.transparent;
                    }))),
            textButtonTheme: TextButtonThemeData(
                style: ButtonStyle(
              shape: MaterialStateProperty.all(RoundedRectangleBorder(borderRadius: BorderRadius.circular(3))),
              minimumSize: MaterialStateProperty.all(Size(0, 30)),
              padding: MaterialStateProperty.all(EdgeInsets.symmetric(horizontal: 12, vertical: 4)),
              elevation: MaterialStateProperty.all(0),
              visualDensity: VisualDensity.comfortable,
              shadowColor: MaterialStateProperty.all(Colors.transparent),
            )),
            scrollbarTheme: ScrollbarThemeData(
                thumbColor: MaterialStateProperty.all(MColors.thumbColor),
                trackColor: MaterialStateProperty.all(MColors.trackColor),
                trackBorderColor: MaterialStateProperty.all(MColors.trackBorderColor))),
        themeMode: ThemeMode.light,
        builder: BotToastInit(),
        navigatorObservers: [BotToastNavigatorObserver()],
        home: MyHomePage(key: Key("MyHomePage")));
  }
}

class MyHomePage extends StatelessWidget {
  MyHomePage({required Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var screenWidth = MediaQuery.of(context).size.width;
    return Scaffold(
        //appBar: DraggebleAppBar("Draggable borderless"),
        body: MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaleFactor: double.parse(context.watch<SettingState>().setting.textScale)),
            child: DefaultTextStyle(
                //1.设置文本默认样式
                softWrap: false,
                style: TextStyle(color: MColors.textColor, fontFamily: "opposans", letterSpacing: 0.5),
                child: Container(
                    color: MColors.pageRightBG,
                    child: SplitView(
                      gripSize: 4,
                      gripColor: Color(0x00ffffff),
                      gripColorActive: Colors.blue,
                      children: [PageLeft(), PageRight()],
                      indicator: SplitIndicator(viewMode: SplitViewMode.Horizontal, color: Colors.blue),
                      activeIndicator: SplitIndicator(
                        viewMode: SplitViewMode.Horizontal,
                        isActive: true,
                      ),
                      controller: SplitViewController(
                          weights: [295 / screenWidth],
                          limits: [WeightLimit(min: 295 / screenWidth, max: (screenWidth - 600) / screenWidth)]),
                      viewMode: SplitViewMode.Horizontal,
                    )))));
  }
}
