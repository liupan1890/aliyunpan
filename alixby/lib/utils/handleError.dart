import 'dart:async';

import 'package:flutter/widgets.dart';

/// 捕获全局异常，进行统一处理。
void handleError(void body) {
  bool isRelease = bool.fromEnvironment("dart.vm.product");

  /// 重写Flutter异常回调 FlutterError.onError
  FlutterError.onError = (FlutterErrorDetails details) {
    if (!isRelease) {
      // debug时，直接将异常信息打印。
      FlutterError.dumpErrorToConsole(details);
    } else {
      // release时，将异常交由zone统一处理。
      Zone.current.handleUncaughtError(details.exception, details.stack!);
    }
  };

  /// 使用runZonedGuarded捕获Flutter未捕获的异常
  runZonedGuarded(() => body, (Object error, StackTrace stackTrace) async {
    await _reportError(error, stackTrace);
  });
}

Future<void> _reportError(Object error, StackTrace stackTrace) async {
  bool isRelease = bool.fromEnvironment("dart.vm.product");
  if (!isRelease) {
    debugPrintStack(stackTrace: stackTrace, label: error.toString(), maxFrames: 100);
  } else {
    /// 将异常信息收集并上传到服务器。可以直接使用类似`flutter_bugly`插件处理异常上报。
  }
}
