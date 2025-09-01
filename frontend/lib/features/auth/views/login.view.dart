import 'package:flutter/material.dart';

//we are creating a custom widget for login ui which extends stateful widget
//we can use mehtods from parent widget, we can ensure the given method exists usng overrride
//it validates that tht method exists in the parent class
//super.key= we pass the key of the widget to the parents class to optmise widget reuse
class LoginView extends StatefulWidget {
  //constuctor of logic view, it says that the widget can be constant to build durng compile time
  const LoginView({super.key});

  @override
  //create method to hold state(mutable data)
  //_ = means that the state is private, exists only in this file
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  LoginViewModel viewModel = LoginViewModel();

  @override
  void dispose()
  {
    
  }
}

