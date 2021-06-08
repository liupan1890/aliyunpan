import 'package:alixby/utils/LoadingWidget.dart';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';

class Loading {
  static CancelFunc showServer() {
    CancelFunc hidecb = BotToast.showCustomLoading(
        toastBuilder: (cancelFunc) {
          return LoadingWidget(cancelFunc: cancelFunc, title: "正在启动服务，可能需要40秒\n第一次运行时启动较慢请耐心等待！");
        },
        allowClick: false,
        clickClose: false,
        crossPage: true,
        duration: null,
        align: Alignment.center,
        backButtonBehavior: BackButtonBehavior.ignore,
        ignoreContentClick: false,
        backgroundColor: Color(0x99000000));
    return hidecb;
  }

  static CancelFunc showLoading() {
    CancelFunc hidecb = BotToast.showCustomLoading(
        toastBuilder: (cancelFunc) {
          //return LoadingWidget(cancelFunc: cancelFunc, title: "正在启动服务，可能需要40秒");
          return LoadingWidget(cancelFunc: cancelFunc, title: "正在执行操作可能需要3分钟\n放心程序没有出错请耐心等待！\n当包含多个子文件夹时需要更多时间！");
        },
        allowClick: false,
        clickClose: false,
        crossPage: true,
        duration: null,
        align: Alignment.center,
        backButtonBehavior: BackButtonBehavior.ignore,
        ignoreContentClick: false,
        backgroundColor: Color(0x99000000));
    return hidecb;
  }
}
