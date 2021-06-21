import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';

class MyBouncingScrollPhysics extends BouncingScrollPhysics {
  const MyBouncingScrollPhysics({ScrollPhysics? parent}) : super(parent: parent);

  @override
  MyBouncingScrollPhysics applyTo(ScrollPhysics? ancestor) {
    return MyBouncingScrollPhysics(parent: buildParent(ancestor));
  }

  @override
  SpringDescription get spring => SpringDescription.withDampingRatio(
        mass: 0.5,
        stiffness: 300.0, // Increase this value as you wish.
        ratio: 1.1,
      );
}

class MyClampingScrollPhysics extends ClampingScrollPhysics {
  const MyClampingScrollPhysics({ScrollPhysics? parent}) : super(parent: parent);

  @override
  MyClampingScrollPhysics applyTo(ScrollPhysics? ancestor) {
    return MyClampingScrollPhysics(parent: buildParent(ancestor));
  }

  @override
  SpringDescription get spring => SpringDescription.withDampingRatio(
        mass: 0.5,
        stiffness: 300.0, // Increase this value as you wish.
        ratio: 1.1,
      );
}
