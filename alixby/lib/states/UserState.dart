import 'package:alixby/api/AliLogin.dart';
import 'package:alixby/states/Global.dart';

import 'package:flutter/material.dart';

class UserState extends ChangeNotifier {
  AliUserInfo user = AliUserInfo();

  // APP是否登录(如果有用户信息，则证明登录过)
  bool get isLogin => user.userID != "";
  //登录后显示用户名，未登录时显示 点击登录
  String get userName => user.userID == "" ? "点击登录" : user.userName;
  String get userPanUsed => "网盘空间 " + user.panUsed + " / " + user.panTotal;
  //登录后显示退出按钮，未登录时不显示
  double get userBtnWidth => user.userID == "" ? 0 : 26;
  //当前所在页面 0=Rss 1=Pan 2=Down 3=Setting
  int userNavPageIndex = 1;
  final pageController = PageController(initialPage: 1);
  updatePageIndex(int index) {
    if (index == userNavPageIndex) return;
    userNavPageIndex = index;
    pageController.jumpToPage(index);
    notifyListeners();
  }

  Future<bool> loadUser() async {
    user = await AliLogin.apiUserInfo();
    if (user.userID != "") {
      Global.panTreeState.pageExpandedNode('root', true);
    }
    notifyListeners();
    return user.userID != "";
  }

  Future<void> logoffUser() async {
    await AliLogin.apiUserLogoff();
    user = AliUserInfo();
    Global.panTreeState.userLogoff();
    Global.panFileState.userLogoff();
    notifyListeners();
  }
}
