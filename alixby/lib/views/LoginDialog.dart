import 'dart:async';
import 'package:alixby/api/AliLogin.dart';
import 'package:alixby/states/Global.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:alixby/views/LoginDialogCookie.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

class LoginDialog extends StatefulWidget {
  const LoginDialog({
    Key? key,
  }) : super(key: key);
  @override
  _LoginDialogState createState() => _LoginDialogState();
}

class _LoginDialogState extends State<LoginDialog> {
  void updateState(fn) {
    if (mounted) {
      setState(fn);
    }
  }

  String _qrcodeUrl = "";
  //每一次setState，都会触发执行这里
  Future _qrcodeCheck() async {
    if (loadError || loadQrcode) return;
    if (loadQrcode == false) {
      _qrcodeUrl = await AliLogin.apiQrcodeGenerate();
      bool isLoadQrcode = _qrcodeUrl != "";
      updateState(() {
        loadError = !isLoadQrcode;
        loadQrcode = isLoadQrcode;
      });
    }
  }

  Future _qrcodeQuery() async {
    if (loadQrcode == true) {
      String result = await AliLogin.apiQrcodeQuery();
      if (result == "success") {
        Global.userState.loadUser(true);
        Navigator.of(context).pop('ok');
      } else if (result == "retry") {
        updateState(() {
          loadError = true;
          loadQrcode = false;
        });
      }
    }
  }

  Widget _buildFuture(BuildContext context, AsyncSnapshot snapshot) {
    switch (snapshot.connectionState) {
      case ConnectionState.none:
        return Text('');
      case ConnectionState.active:
        return Text('');
      case ConnectionState.waiting:
        return Center(
          child: CircularProgressIndicator(),
        );
      case ConnectionState.done:
        if (snapshot.hasError) {
          return Text('网络错误');
        } else if (_qrcodeUrl == "") {
          return Text('网络错误');
        } else {
          return QrImage(
            data: _qrcodeUrl,
            version: QrVersions.auto,
            size: 160,
            gapless: false,
          );
        }
      default:
        return Text('');
    }
  }

  late Timer timer;
  //初始化时需要先读取html数据
  bool loadHtml = false;
  //是否显示二维码（不显示二维码就显示刷新按钮）
  bool loadQrcode = false;
  //第一次强制隐藏刷新按钮
  bool loadError = false;
  //避免重复执行timer
  bool loading = false;

  @override
  void initState() {
    super.initState();
    loadError = false;
    loadHtml = false;
    loadQrcode = false;
    timer = Timer.periodic(Duration(milliseconds: 1500), (timer) {
      if (loading) return;
      loading = true;
      try {
        _qrcodeQuery();
      } catch (e) {}
      loading = false;
    });
  }

  @override
  void dispose() {
    timer.cancel();
    loadHtml = false;
    loadQrcode = false;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
        type: MaterialType.transparency,
        child: MediaQuery(
            data: MediaQuery.of(context)
                .copyWith(textScaleFactor: double.parse(context.watch<SettingState>().setting.textScale)),
            child: DefaultTextStyle(
              //1.设置文本默认样式
              style: TextStyle(color: MColors.textColor, fontFamily: "opposans"),
              child: Center(
                  child: Container(
                height: 300,
                width: 300,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.white,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: <Widget>[
                    Container(
                        alignment: Alignment.topRight,
                        padding: EdgeInsets.only(top: 8, right: 8, bottom: 8),
                        child: MouseRegion(
                            cursor: SystemMouseCursors.click,
                            child: GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              child: Icon(MIcons.close, size: 18, color: MColors.textColor),
                              onTap: () => Navigator.of(context).pop('ok'),
                            ))),
                    Container(
                        child: Text("请用阿里云盘 App 扫码登录",
                            style: TextStyle(fontSize: 20, color: MColors.textColor, fontFamily: "opposans"))),
                    Container(
                        width: 170,
                        height: 170,
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            FutureBuilder(
                              builder: _buildFuture,
                              future: _qrcodeCheck(),
                            ),
                            Container(
                                color: Color(0xeeffffff),
                                alignment: Alignment.center,
                                width: loadError ? 160 : 0,
                                height: 160,
                                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: <Widget>[
                                  Text("二维码已失效"),
                                  Padding(padding: EdgeInsets.only(top: 20)),
                                  ElevatedButton(
                                    child: Text("刷新二维码"),
                                    onPressed: () {
                                      updateState(() {
                                        loadError = false;
                                        loadQrcode = false;
                                      });
                                    },
                                  )
                                ])),
                          ],
                        )),
                    Container(
                        padding: EdgeInsets.only(top: 8),
                        child: TextButton(
                            child:
                                Text("使用Cookie登录", style: TextStyle(color: MColors.linkColor, fontFamily: "opposans")),
                            onPressed: () {
                              Navigator.of(context).pop('ok');
                              showDialog(
                                  barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                                  context: context,
                                  builder: (context) {
                                    return WillPopScope(
                                      onWillPop: () async => false, //关键代码
                                      child: LoginDialogCookie(),
                                    );
                                  });
                            })),
                  ],
                ),
              )),
            )));
  }
}
