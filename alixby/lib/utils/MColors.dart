import 'package:flutter/material.dart';

class MColors {
  static MColorsLight mcolor = MColorsLight();

  static void setTheme(String theme) {
    switch (theme) {
      case "dark":
        mcolor = MColorsDark();
        break;
      default:
        mcolor = MColorsLight();
        break;
    }
  }

  // ignore: non_constant_identifier_names
  static get app_main => mcolor.app_main;
  static get pageLeftBG => mcolor.pageLeftBG;
  static get userNavColor => mcolor.userNavColor;
  static get userNavBG => mcolor.userNavBG;
  static get userNavBtnColor => mcolor.userNavBtnColor;
  static get userNavBtnBG => mcolor.userNavBtnBG;
  static get userNavBtnBorder => mcolor.userNavBtnBorder;
  static get userNavMenuIconHover => mcolor.userNavMenuIconHover;
  static get userNavMenuIcon => mcolor.userNavMenuIcon;
  static get userNavMenuBGHover => mcolor.userNavMenuBGHover;
  static get userNavMenuBG => mcolor.userNavMenuBG;
  static get pageLeftDividerColor => mcolor.pageLeftDividerColor;
  static get pageRightBG => mcolor.pageRightBG;
  static get pageRightBorderColor => mcolor.pageRightBorderColor;

  static get pageLeftRowHeadColor => mcolor.pageLeftRowHeadColor;
  static get pageLeftRowItemColor => mcolor.pageLeftRowItemColor;
  static get pageLeftRowItemIconColor => mcolor.pageLeftRowItemIconColor;
  static get pageLeftRowItemBGSelect => mcolor.pageLeftRowItemBGSelect;
  static get pageLeftRowItemBGHover => mcolor.pageLeftRowItemBGHover;

  static get outlineBtnColor => mcolor.outlineBtnColor;
  static get outlineBtnBorderColor => mcolor.outlineBtnBorderColor;
  static get outlineBtnBG => mcolor.outlineBtnBG;
  static get outlineBtnBGHover => mcolor.outlineBtnBGHover;
  static get outlineBtnBGActive => mcolor.outlineBtnBGActive;

  static get elevatedBtnColor => mcolor.elevatedBtnColor;
  static get elevatedBtnBorderColor => mcolor.elevatedBtnBorderColor;
  static get elevatedBtnBG => mcolor.elevatedBtnBG;
  static get elevatedBtnBGHover => mcolor.elevatedBtnBGHover;
  static get elevatedBtnBGActive => mcolor.elevatedBtnBGActive;

  static get linkColor => mcolor.linkColor;
  static get disabledColor => mcolor.disabledColor;
  static get inputBorderColor => mcolor.inputBorderColor;
  static get inputBorderHover => mcolor.inputBorderHover;

  static get iconFolder => mcolor.iconFolder;
  static get iconFile => mcolor.iconFile;
  static get iconVideo => mcolor.iconVideo;
  static get iconAudio => mcolor.iconAudio;
  static get iconZip => mcolor.iconZip;
  static get iconImage => mcolor.iconImage;
  static get iconTxt => mcolor.iconTxt;
  static get iconWeiFa => mcolor.iconWeiFa;

  static get iconDown => mcolor.iconDown;
  static get iconSelect => mcolor.iconSelect;
  static get iconSelected => mcolor.iconSelected;

  static get pageRightPathColor => mcolor.pageRightPathColor;
  static get pageRightFileColor => mcolor.pageRightFileColor;
  static get pageRightFileBG => mcolor.pageRightFileBG;
  static get pageRightFileBGHover => mcolor.pageRightFileBGHover;
  static get pageRightFileBGSelect => mcolor.pageRightFileBGSelect;
  static get pageRightDownSpeedColor => mcolor.pageRightDownSpeedColor;

  static get dialogBgColor => mcolor.dialogBgColor;

  static get thumbColor => mcolor.thumbColor;
  static get trackColor => mcolor.trackColor;
  static get trackBorderColor => mcolor.trackBorderColor;
  static get textColor => mcolor.textColor;
  static get textColorGray => mcolor.textColorGray;
  static get textColorRed => mcolor.textColorRed;
  static get textColorYellow => mcolor.textColorYellow;
}

class MColorsLight {
  // ignore: non_constant_identifier_names
  Color app_main = Color(0xFF4688FA);
  Color pageLeftBG = Color(0xfff9f8f8);
  Color userNavColor = Color(0xff312727);
  Color userNavBG = Color(0xffeeecec);
  Color userNavBtnColor = Color(0xdd312727);
  Color userNavBtnBorder = Color(0x99df5659);
  Color userNavBtnBG = Colors.white;

  Color userNavMenuIconHover = Color(0xffdf5659);
  Color userNavMenuIcon = Color(0xdd312727);
  Color userNavMenuBGHover = Color(0x1acf4747);
  Color userNavMenuBG = Color(0xffeeecec);

  Color pageLeftRowHeadColor = Color(0xff8a9ca5);
  Color pageLeftRowItemColor = Color(0xff655757);
  Color pageLeftRowItemIconColor = Color(0xffbcb3b3);
  Color pageLeftRowItemBGSelect = Color(0x1adf5659);
  Color pageLeftRowItemBGHover = Color(0xffeeecec);

  Color pageLeftDividerColor = Colors.white;
  Color pageRightBG = Colors.white;
  Color pageRightBorderColor = Color(0x99e5e8ed);

  Color outlineBtnColor = Color(0xffdf5659);
  Color outlineBtnBorderColor = Color(0xaadf5659);
  Color outlineBtnBG = Color(0x00000000);
  Color outlineBtnBGHover = Color(0x1acf4747);
  Color outlineBtnBGActive = Color(0x1adf5659);

  Color elevatedBtnColor = Color(0xffffffff);
  Color elevatedBtnBorderColor = Color(0xaadf5659);
  Color elevatedBtnBG = Color(0xffdf5659);
  Color elevatedBtnBGHover = Color(0xffeb8381);
  Color elevatedBtnBGActive = Color(0xffb83e44);

  Color linkColor = Colors.blueAccent;
  Color disabledColor = Color(0xFFD4E2FA);
  Color inputBorderColor = Color(0xFFd0d0d0);
  Color inputBorderHover = Color(0xffeb8381);

  Color iconFolder = Color(0xffffb74d);
  Color iconFile = Color(0xffbcb3b3);
  Color iconVideo = Color(0xff3482F0);
  Color iconAudio = Color(0xff474DE2);
  Color iconZip = Color(0xff8D51DB);
  Color iconImage = Color(0xffE03450);
  Color iconTxt = Color(0xff8BC755);
  Color iconWeiFa = Color(0xffd81e06);

  Color iconDown = Color(0x66bcb3b3);
  Color iconSelect = Color(0x66bcb3b3);
  Color iconSelected = Color(0xff637dff);
  Color pageRightPathColor = Color(0xAA333333);
  Color pageRightFileColor = Color(0xb3000000);
  Color pageRightFileBG = Color(0xffffffff);
  Color pageRightFileBGHover = Color(0xddf7f8fa);
  Color pageRightFileBGSelect = Color(0xfff7f8fa);
  Color pageRightDownSpeedColor = Color(0x30000000);

  Color dialogBgColor = Colors.white;

  Color thumbColor = Colors.grey.shade400;
  Color trackColor = Color(0x66e0e0e0);
  Color trackBorderColor = Color(0x99e0e0e0);
  Color textColor = Color(0xee000000);
  Color textColorGray = Color(0xaa333333);
  Color textColorRed = Color(0xffeb8381);
  Color textColorYellow = Color(0xfffc5531);
}

class MColorsDark extends MColorsLight {
  // ignore: non_constant_identifier_names
  Color app_main = Color(0xFF4688FA);
  Color pageLeftBG = Color(0xff202023); //
  Color userNavColor = Color(0xccffffff); //
  Color userNavBG = Color(0xff2c2c2f); //

  Color userNavBtnColor = Color(0xb2ffffff); //
  Color userNavBtnBorder = Color(0x99df5659); //
  Color userNavBtnBG = Color(0xff333538); //

  Color userNavMenuIconHover = Color(0xffdf5659); //
  Color userNavMenuIcon = Color(0xddb3b3b3); //
  Color userNavMenuBGHover = Color(0x33ff4747); //
  Color userNavMenuBG = Color(0xff464444); //

  Color pageLeftRowHeadColor = Color(0xff8a9ca5); //
  Color pageLeftRowItemColor = Color(0xffcccccc); //
  Color pageLeftRowItemIconColor = Color(0xffcccccc); //
  Color pageLeftRowItemBGSelect = Color(0x33ff4747); //
  Color pageLeftRowItemBGHover = Color(0xff464444); //

  Color pageLeftDividerColor = Color(0xff28282a); //
  Color pageRightBG = Color(0xff28282a); //
  Color pageRightBorderColor = Color(0x99444444); //

  Color outlineBtnColor = Color(0xffdf5659);
  Color outlineBtnBorderColor = Color(0xaadf5659);
  Color outlineBtnBG = Color(0x00000000);
  Color outlineBtnBGHover = Color(0x1acf4747);
  Color outlineBtnBGActive = Color(0x1adf5659);

  Color elevatedBtnColor = Color(0xffffffff);
  Color elevatedBtnBorderColor = Color(0xaadf5659);
  Color elevatedBtnBG = Color(0xffdf5659);
  Color elevatedBtnBGHover = Color(0xffeb8381);
  Color elevatedBtnBGActive = Color(0xffb83e44);

  Color linkColor = Colors.blueAccent;
  Color disabledColor = Color(0xFFD4E2FA);
  Color inputBorderColor = Color(0xFFd0d0d0);
  Color inputBorderHover = Color(0xffeb8381);

  Color iconFolder = Color(0xffffb74d);
  Color iconFile = Color(0xffbcb3b3);
  Color iconVideo = Color(0xff3482F0);
  Color iconAudio = Color(0xff474DE2);
  Color iconZip = Color(0xff8D51DB);
  Color iconImage = Color(0xffE03450);
  Color iconTxt = Color(0xff8BC755);
  Color iconWeiFa = Color(0xffd81e06);

  Color iconDown = Color(0x66bcb3b3);
  Color iconSelect = Color(0x66bcb3b3);
  Color iconSelected = Color(0xff637dff);
  Color pageRightPathColor = Color(0xAAffffff);
  Color pageRightFileColor = Color(0xffffffff); //
  Color pageRightFileBG = Color(0xff28282a); //
  Color pageRightFileBGHover = Color(0xdd47474a); //
  Color pageRightFileBGSelect = Color(0xff47474a); //
  Color pageRightDownSpeedColor = Color(0xff67676a);

  Color dialogBgColor = Color(0xff333538); //

  Color thumbColor = Colors.grey.shade400;
  Color trackColor = Color(0x99e0e0e0);
  Color trackBorderColor = Color(0x99e0e0e0);
  Color textColor = Colors.white;
  Color textColorGray = Color(0x99ffffff);
  Color textColorRed = Color(0xffeb8381);
  Color textColorYellow = Color(0xfffbc02d);
}
