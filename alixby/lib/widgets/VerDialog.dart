import 'package:alixby/utils/MColors.dart';
import 'package:alixby/utils/MIcons.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

class VerDialog extends StatelessWidget {
  const VerDialog({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
        type: MaterialType.transparency,
        child: DefaultTextStyle(
          //1.设置文本默认样式
          style: TextStyle(color: MColors.textColor),
          child: Center(
              child: Container(
            height: 200,
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
                Container(child: Text("有新版本发布了", style: TextStyle(fontSize: 20, color: MColors.textColor))),
                Container(
                  width: 380,
                  margin: EdgeInsets.only(top: 24),
                  child: Text("！"),
                ),
              ],
            ),
          )),
        ));
  }
}
