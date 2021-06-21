import 'package:alixby/views/UserNavMenu.dart';
import 'package:hovering/hovering.dart';

import 'package:alixby/views/UserNav.dart';
import 'package:alixby/utils/MColors.dart';
import 'package:flutter/material.dart';

class PageLeft extends StatefulWidget {
  @override
  _PageLeftState createState() => _PageLeftState();
}

class _PageLeftState extends State<PageLeft> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(0),
      decoration: BoxDecoration(color: MColors.pageLeftBG),
      child: Column(
        children: [
          Container(height: 10),
          Container(
              height: 40,
              margin: EdgeInsets.only(left: 8, right: 8, top: 2, bottom: 2),
              alignment: Alignment.topLeft,
              child: SizedBox(
                  width: 274,
                  child: HoverContainer(
                      decoration: BoxDecoration(color: MColors.pageLeftBG),
                      hoverDecoration: BoxDecoration(color: MColors.userNavBG),
                      child: Container(
                        padding: EdgeInsets.all(7),
                        child: UserNav(key: Key("UserNav")),
                      )))),
          Expanded(
            child: UserNavMenu(),
          ),
          Padding(padding: EdgeInsets.only(bottom: 8))
        ],
      ),
    );
  }
}
