import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:provider/provider.dart';
import 'package:alixby/states/SettingState.dart';

// ignore: must_be_immutable
class UnrarBackDialog extends StatelessWidget {
  UnrarBackDialog({Key? key, required this.state}) : super(key: key);
  String state = "";
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
                height: 280,
                width: 460,
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
                        child: Text("成功调用解压缩命令",
                            style:
                                TextStyle(fontSize: 20, color: MColors.textColor, height: 0, fontFamily: "opposans"))),
                    Container(padding: EdgeInsets.only(top: 20)),
                    Container(
                      width: 420,
                      padding: EdgeInsets.only(top: 20),
                      child: Text("操作成功并且而收到了正确的返回值[" +
                          state +
                          "]\n\n解压缩可能会耗时较久，请稍后到选择的文件夹里查看解压结果！\n\n对于有密码的压缩包如果输入的密码错误会解压失败！当前失败后无任何提示，后面的版本会增加解压进度刷新"),
                    ),
                    Container(
                      width: 420,
                      margin: EdgeInsets.only(top: 24),
                      alignment: Alignment.centerRight,
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop('ok'),
                        child: Text("  关闭  "),
                        style: ButtonStyle(minimumSize: MaterialStateProperty.all(Size(0, 36))),
                      ),
                    )
                  ],
                ),
              )),
            )));
  }
}
