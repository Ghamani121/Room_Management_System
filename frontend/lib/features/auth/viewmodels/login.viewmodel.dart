import 'package:flutter/material.dart';
import 'package:rms/features/auth/service/login.service.dart';

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

  final LoginService _service = LoginService();

  //dispose controllers
  void disposeControllers() {
    emailController.dispose();
    passwordController.dispose();
  }


Future<bool> login() async {
  if (!formKey.currentState!.validate()) return false;

  try {
    final result = await _service.login(
      emailController.text.trim(),
      passwordController.text.trim(),
    );

    // Print the actual data returned by backend
    print("Login successful: ${result.user.name}, token: ${result.token}");
    return true;
  } catch (e) {
    print("Login failed: $e");
    return false;
  }
}



  Future<void> _loginApi() async {
    try {
      final result = await _service.login(
        emailController.text.trim(),
        passwordController.text.trim(),
      );
      print("\n\n\nLogin successful: ${result.user.name}, email: ${result.user.email}");

    } catch (e) {
      print("\n\n\nLogin failed: $e");
    }
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
}
