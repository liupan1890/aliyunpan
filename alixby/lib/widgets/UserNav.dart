import 'package:alixby/states/Global.dart';
import 'package:alixby/widgets/LoginDialog.dart';

import '../states/UserState.dart';
import 'package:provider/provider.dart';
import '../utils/MIcons.dart';

import '../utils/MColors.dart';
import 'package:flutter/material.dart';

class UserNav extends StatefulWidget {
  UserNav({required Key key}) : super(key: key);
  @override
  _UserNavState createState() => _UserNavState();
}

class _UserNavState extends State<UserNav> {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        ClipRRect(
          //剪裁为圆角矩形
          borderRadius: BorderRadius.circular(5.0),
          child: Image.asset("assets/images/app.png", width: 24, fit: BoxFit.cover),
        ),
        Padding(padding: EdgeInsets.only(left: 6)),
        Expanded(
            child: InkWell(
                child: Text(
                  context.watch<UserState>().userName,
                  style: TextStyle(color: MColors.userNavColor, fontSize: 16, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  softWrap: false,
                  overflow: TextOverflow.clip,
                ),
                onTap: () async {
                  if (!Global.userState.isLogin) {
                    //先检查一遍是否登录
                    bool islogin = await Global.userState.loadUser();
                    if (islogin) return;
                  }

                  //todo::显示用户信息
                  if (Global.userState.isLogin) {
                  } else {
                    showDialog(
                        barrierDismissible: true, //表示点击灰色背景的时候是否消失弹出框
                        context: context,
                        builder: (context) {
                          return WillPopScope(
                              onWillPop: () async => false, //关键代码
                              child: LoginDialog());
                        });
                  }
                })),
        Padding(padding: EdgeInsets.only(left: 8)),
        Material(
            color: Colors.transparent,
            shape: CircleBorder(),
            child: SizedBox(
                width: context.watch<UserState>().userBtnWidth,
                height: 26.0,
                child: PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == "logoff") Global.userState.logoffUser();
                  },
                  offset: Offset(0, 26),
                  shape: RoundedRectangleBorder(
                      side: BorderSide(color: MColors.userNavBtnBorder), borderRadius: BorderRadius.circular(4)),
                  tooltip: 'logoff',
                  padding: EdgeInsets.all(0),
                  color: MColors.userNavBtnBG,
                  icon: Icon(MIcons.logout, color: MColors.userNavBtnColor),
                  iconSize: 20,
                  itemBuilder: (context) {
                    return <PopupMenuEntry<String>>[
                      PopupMenuItem<String>(
                        textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15),
                        height: 32,
                        value: 'logoff',
                        child: Text('退出登录'),
                      ),
                      PopupMenuItem<String>(
                        textStyle: TextStyle(color: MColors.userNavBtnColor, fontSize: 15),
                        height: 32,
                        value: 'chance',
                        child: Text('取消'),
                      ),
                    ];
                  },
                ))),
        Padding(padding: EdgeInsets.only(left: 5)),
      ],
    );
  }
}
