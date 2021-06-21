import 'package:alixby/states/Global.dart';
import 'package:alixby/views/LoginDialog.dart';
import 'package:extended_image/extended_image.dart';
import 'package:hovering/hovering.dart';

import 'package:alixby/states/UserState.dart';
import 'package:provider/provider.dart';
import 'package:alixby/utils/MIcons.dart';

import 'package:alixby/utils/MColors.dart';
import 'package:flutter/material.dart';

class UserNav extends StatefulWidget {
  UserNav({required Key key}) : super(key: key);
  @override
  _UserNavState createState() => _UserNavState();
}

class _UserNavState extends State<UserNav> {
  var userFaceTryTime = 0;

  @override
  Widget build(BuildContext context) {
    var userFace = context.watch<UserState>().userFace;
    var userName = context.watch<UserState>().userName;
    return Row(
      children: <Widget>[
        userFace == ""
            ? Image.asset("assets/images/app.png", width: 24, fit: BoxFit.cover)
            : ExtendedImage.network(
                userFace,
                width: 24,
                height: 24,
                fit: BoxFit.cover,
                cache: true,
                retries: 1,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.all(Radius.circular(5.0)),
                loadStateChanged: (ExtendedImageState state) {
                  switch (state.extendedImageLoadState) {
                    case LoadState.loading:
                      return null;
                    case LoadState.completed:
                      userFaceTryTime = 0;
                      return ExtendedRawImage(image: state.extendedImageInfo?.image);
                    case LoadState.failed:
                      userFaceTryTime++;
                      if (userFaceTryTime < 3) {
                        print("retry userface");
                        Future.delayed(Duration(milliseconds: 2000), () {
                          Global.userState.loadUser(false);
                        });
                      }
                      return Image.asset("assets/images/app.png", width: 24, fit: BoxFit.cover);
                  }
                },
                //cancelToken: cancellationToken,
              ),
        //Image.asset("assets/images/app.png", width: 24, fit: BoxFit.cover),

        Padding(padding: EdgeInsets.only(left: 6)),
        Expanded(
            child: InkWell(
                child: Text(
                  userName,
                  style: TextStyle(
                      color: MColors.userNavColor, fontSize: 16, fontWeight: FontWeight.bold, fontFamily: "opposans"),
                  maxLines: 1,
                  softWrap: false,
                  overflow: TextOverflow.clip,
                ),
                onTap: () async {
                  if (!Global.userState.isLogin) {
                    //先检查一遍是否登录
                    await Global.userState.loadUser(true);
                  } else {
                    //已经登录，就是刷新用户信息
                    Global.userState.loadUser(false);
                  }

                  if (Global.userState.isLogin) {
                    //todo::显示用户信息
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
                width: userName == "点击登录" ? 0 : 26,
                height: 26.0,
                child: HoverContainer(
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.pageLeftBG),
                    hoverDecoration:
                        BoxDecoration(borderRadius: BorderRadius.circular(3.0), color: MColors.userNavMenuBGHover),
                    child: IconButton(
                      iconSize: 22,
                      padding: EdgeInsets.all(0),
                      color: MColors.userNavMenuIcon,
                      icon: Icon(MIcons.setting),
                      onPressed: () => Global.userState.updatePageIndex(4),
                      tooltip: "APP设置",
                    )))),
        Padding(padding: EdgeInsets.only(left: 5)),
      ],
    );
  }
}
