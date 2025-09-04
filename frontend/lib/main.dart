import 'package:flutter/material.dart';
import 'package:rms/features/bookings/views/display_bookings.view.dart';
import 'features/rooms/views/register_room.view.dart';
import 'features/bookings/views/book_room.view.dart';
import 'features/auth/views/login.view.dart';
import 'config.service.dart';

// entry point of flutter application
//every flutter app starts from main funciton
//runApp loads the root widget which is MyApp onto the widget tree
void main() async {

  runApp(const MyApp());
}

//root of the widget tree

//stateless-app itself doesn't need to store/change the internal state
//stateless just builds the ui and delegates funtionality to its children
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
      // home: const RegisterRoomView(),
      // home:const BookRoomView(),
      home: const LoginView(),
      // home:const BookRoomView(),
      // home: const DisplayBookingsView(),
    );
  }
}
