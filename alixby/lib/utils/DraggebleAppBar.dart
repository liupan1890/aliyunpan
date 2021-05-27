import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ignore: must_be_immutable
class DraggebleAppBar extends StatelessWidget implements PreferredSizeWidget {
  static const platform_channel_draggable = MethodChannel('samples.go-flutter.dev/draggable');

  late AppBar appBar;

  DraggebleAppBar(String title) {
    appBar = AppBar(
      backgroundColor: Colors.transparent,
      title: Text(title),
      actions: <Widget>[
        new IconButton(
          icon: new Icon(Icons.close),
          onPressed: () async => await platform_channel_draggable.invokeMethod("onClose"),
        ),
      ],
      leading: new Container(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(child: appBar, onPanStart: onPanStart, onPanUpdate: onPanUpdate);
  }

  @override
  Size get preferredSize => new Size.fromHeight(kToolbarHeight);

  void onPanUpdate(DragUpdateDetails details) async {
    await platform_channel_draggable.invokeMethod('onPanUpdate');
  }

  void onPanStart(DragStartDetails details) async {
    await platform_channel_draggable
        .invokeMethod('onPanStart', {"dx": details.globalPosition.dx, "dy": details.globalPosition.dy});
  }
}
