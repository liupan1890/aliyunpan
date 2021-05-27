import 'dart:async';

import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// 登录模块的输入框封装
class MyTextField extends StatefulWidget {
  const MyTextField(
      {Key? key,
      required this.controller,
      this.maxLength = 16,
      this.autoFocus = false,
      this.keyboardType = TextInputType.text,
      this.hintText = '',
      this.focusNode,
      this.isInputPwd = false,
      this.getVCode,
      this.keyName})
      : super(key: key);

  final TextEditingController controller;
  final int maxLength;
  final bool autoFocus;
  final TextInputType keyboardType;
  final String hintText;
  final FocusNode? focusNode;
  final bool isInputPwd;
  final Future<bool> Function()? getVCode;

  /// 用于集成测试寻找widget
  final String? keyName;

  @override
  _MyTextFieldState createState() => _MyTextFieldState();
}

class _MyTextFieldState extends State<MyTextField> {
  bool _isShowPwd = false;
  bool _isShowDelete = false;
  bool _clickable = true;

  /// 倒计时秒数
  final int _second = 30;

  /// 当前秒数
  late int _currentSecond;
  StreamSubscription? _subscription;

  @override
  void initState() {
    /// 获取初始化值
    _isShowDelete = widget.controller.text.isNotEmpty;

    /// 监听输入改变
    widget.controller.addListener(isEmpty);
    super.initState();
  }

  void isEmpty() {
    final bool isNotEmpty = widget.controller.text.isNotEmpty;

    /// 状态不一样在刷新，避免重复不必要的setState
    if (isNotEmpty != _isShowDelete) {
      setState(() {
        _isShowDelete = isNotEmpty;
      });
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    widget.controller.removeListener(isEmpty);
    super.dispose();
  }

  Future _getVCode() async {
    final bool isSuccess = await widget.getVCode!();
    if (isSuccess) {
      setState(() {
        _currentSecond = _second;
        _clickable = false;
      });
      _subscription = Stream.periodic(const Duration(seconds: 1), (int i) => i).take(_second).listen((int i) {
        setState(() {
          _currentSecond = _second - i - 1;
          _clickable = _currentSecond < 1;
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final ThemeData themeData = Theme.of(context);

    Widget textField = TextField(
      focusNode: widget.focusNode,
      maxLength: widget.maxLength,
      obscureText: widget.isInputPwd && !_isShowPwd,
      autofocus: widget.autoFocus,
      controller: widget.controller,
      textInputAction: TextInputAction.done,
      keyboardType: widget.keyboardType,
      // 数字、手机号限制格式为0到9， 密码限制不包含汉字
      inputFormatters: (widget.keyboardType == TextInputType.number || widget.keyboardType == TextInputType.phone)
          ? [FilteringTextInputFormatter.allow(RegExp('[0-9]'))]
          : [FilteringTextInputFormatter.deny(RegExp('[\u4e00-\u9fa5]'))],
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.symmetric(vertical: 16.0),
        hintText: widget.hintText,
        counterText: '',
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: themeData.primaryColor,
            width: 1,
          ),
        ),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: Theme.of(context).dividerTheme.color!,
            width: 1,
          ),
        ),
      ),
    );

    late Widget clearButton;

    if (_isShowDelete) {
      clearButton = Semantics(
          label: '清空',
          hint: '清空输入框',
          child: SizedBox(
            width: 18,
            height: 40,
            child: IconButton(
              icon: Icon(MIcons.close),
              onPressed: () => widget.controller.text = '',
            ),
          ));
    }

    late Widget pwdVisible;
    if (widget.isInputPwd) {
      pwdVisible = Semantics(
          label: '密码可见开关',
          hint: '密码是否可见',
          child: SizedBox(
            width: 18,
            height: 40,
            child: IconButton(
              key: Key('${widget.keyName}_showPwd'),
              icon: Icon(MIcons.close),
              onPressed: () {
                setState(() {
                  _isShowPwd = !_isShowPwd;
                });
              },
            ),
          ));
    }

    late Widget getVCodeButton;
    if (widget.getVCode != null) {
      getVCodeButton = TextButton(
          key: const Key('getVerificationCode'),
          onPressed: _clickable ? _getVCode : null,
          child: Text(_clickable ? '发送验证码' : '（$_currentSecond s）',
              style: TextStyle(
                fontSize: 12,
              )),
          style: ButtonStyle(
            foregroundColor: MaterialStateProperty.resolveWith((states) {
              if (states.contains(MaterialState.disabled)) {
                return MColors.disabledColor;
              }
              return themeData.primaryColor;
            }),
            minimumSize: MaterialStateProperty.all<Size>(Size(76, 26)),
            padding: MaterialStateProperty.all<EdgeInsetsGeometry>(EdgeInsets.symmetric(horizontal: 8.0)),
            shape: MaterialStateProperty.all<OutlinedBorder>(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(1),
              ),
            ),
            side: MaterialStateProperty.all<BorderSide>(BorderSide(
              color: _clickable ? themeData.primaryColor : Colors.transparent,
              width: 1,
            )),
          ));
    }

    return Stack(
      alignment: Alignment.centerRight,
      children: <Widget>[
        textField,
        Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            /// _isShowDelete参数动态变化，为了不破坏树结构，false时放一个空Widget。
            /// 对于其他参数，为初始配置参数，基本可以确定树结构，就不做空Widget处理。
            if (_isShowDelete) clearButton else SizedBox.shrink(),
            if (widget.isInputPwd) SizedBox(width: 15),
            if (widget.isInputPwd) pwdVisible,
            if (widget.getVCode != null) SizedBox(width: 15),
            if (widget.getVCode != null) getVCodeButton,
          ],
        )
      ],
    );
  }
}
