import 'package:flutter/material.dart';

//provides notifications for the widget when state changes
class LoginViewModel extends ChangeNotifier {
  //texteditingcontroller: get text,clear text, display defalt text
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  // When you wrap inputs (TextFormField) inside a Form widget, Flutter keeps track of their validation using FormState.

  // The FormState provides methods like:
  // validate() → runs all the validators of the TextFormFields and returns true if all are valid.
  // save() → saves the form fields (if you set onSaved).
  // reset() → clears the form.

  //globalkey allows you to access the form state outside the form widget
  final formKey = GlobalKey<FormState>();

  //dispose controllers
  void disposeControllers() {
    emailController.dispose();
    passwordController.dispose();
  }

  //reset form state
  void resetForm() {
    emailController.clear();
    passwordController.clear();

    notifyListeners();
  }

  String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return "Email is required";
    }
    // very simple regex (user@domain.tld)
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
    if (!emailRegex.hasMatch(value)) {
      return "Enter a valid email address";
    }
    return null;
  }

  String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return "Password is required";
    }
    return null;
  }

  void login()
  {
    if(formKey.currentState!.validate())
    {
      debugPrint("Login with: ${emailController.text}, ${passwordController.text}");
    }
  }
}
