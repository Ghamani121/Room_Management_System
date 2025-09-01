import 'package:flutter/material.dart';

//provides notifications for the widget when state changes
class LoginViewModel extends ChangeNotifier {
  //these are form state to be preserved
  String? email;
  String? password;

  //texteditingcontroller: get text,clear text, display defalt text
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  //for validation error
  String? emailError;
  String? passwordError;

  //dispose controllers
  void disposeControllers() {
    emailController.dispose();
    passwordController.dispose();
  }

  //reset form state
  void resetForm() {
    email = null;
    emailController.clear();
    password = null;
    passwordController.clear();
    emailError = null;
    passwordError = null;

    notifyListeners();
  }

  bool validateForm()
  {
    
  }













}


