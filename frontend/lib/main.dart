import 'package:flutter/material.dart';
import 'features/rooms/screens/register_room.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Room Management System',
      theme: ThemeData(
        primarySwatch: Colors.red,
      ),
      home: const RegisterRoomScreen(),
    );
  }
}
