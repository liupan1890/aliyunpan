import 'package:alixby/api/GoServer.dart';
import 'package:alixby/states/SettingState.dart';
import 'package:bot_toast/bot_toast.dart';
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
import 'package:flutter/painting.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  handleError(runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => Global.userState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.settingState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.panTreeState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.panFileState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.pageDownState, lazy: false),
        ChangeNotifierProvider(create: (_) => Global.pageRssMiaoChuanState, lazy: false),
      ],
      child: MyApp(),
    ),
  ));
  //980
  Future.delayed(Duration(milliseconds: 200), () {
    GoServer.connServer();
  });
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        //showPerformanceOverlay: true, //性能监视器
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
                    textStyle: MaterialStateProperty.all(TextStyle(color: MColors.elevatedBtnColor)),
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
                    textStyle: MaterialStateProperty.all(TextStyle(color: MColors.outlineBtnColor)),
                    overlayColor: MaterialStateProperty.resolveWith((states) {
                      if (states.contains(MaterialState.pressed)) return MColors.outlineBtnBGActive;
                      if (states.contains(MaterialState.focused)) return MColors.outlineBtnBGHover;
                      if (states.contains(MaterialState.hovered)) return MColors.outlineBtnBGHover;
                      if (states.contains(MaterialState.dragged)) return MColors.outlineBtnBGHover;
                      if (states.contains(MaterialState.selected)) return MColors.outlineBtnBGHover;
                      return Colors.transparent;
                    }))),
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
    var _data =
        MediaQuery.of(context).copyWith(textScaleFactor: double.parse(context.watch<SettingState>().setting.textScale));
    return Scaffold(
        //appBar: DraggebleAppBar("Draggable borderless"),
        body: MediaQuery(
            data: _data,
            child: DefaultTextStyle(
                //1.设置文本默认样式
                style: TextStyle(color: MColors.textColor),
                child: SplitView(
                    gripSize: 3,
                    gripColor: MColors.pageLeftDividerColor,
                    gripColorActive: Colors.blue,
                    minWidthSidebar: 295,
                    maxWidthSidebar: screenWidth - 600,
                    initialWeight: 0,
                    viewMode: SplitViewMode.Horizontal,
                    view1: PageLeft(),
                    view2: PageRight()))));
  }
}
