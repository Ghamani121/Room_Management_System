import 'package:flutter/material.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/users/users.model.dart';
import 'package:rms/features/users/services/create_user.service.dart';
import 'package:provider/provider.dart';

class CreateUserViewModel extends ChangeNotifier {
  /// Form state
  String? name;
  String? email;
  String? role;

  final TextEditingController nameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();

  /// Validation errors
  String? nameError;
  String? emailError;
  String? roleError;

  /// Dispose controllers
  void disposeControllers() {
    nameController.dispose();
    emailController.dispose();
  }

  final UserService _service = UserService();

  Future<void> createUser(BuildContext context) async {
    if (!validateForm()) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";

    final user = User(
      name: nameController.text.trim(),
      email: emailController.text.trim(),
      role: role!,
      password: "123456",
    );

    debugPrint(
      "\n\n\nCreated user: ${user.name},${user.email},${user.role},${user.password}",
    );

    try {
      final createdUser = await _service.createUser(user, token);

      // show success snackbar
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("User created successfully")),
      );

      debugPrint("Created user: ${createdUser.id}");

      Navigator.pop(context, createdUser); // return to list page
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  String? validateName() {
  final name = nameController.text.trim();
  if (name.isEmpty) {
    return "Enter name";
  }
  return null;
}


  String? validateEmail() {
    final email = emailController.text.trim();
    if (email.isEmpty) {
      return "Enter email";
    } else if (!_isValidEmail(email)) {
      return "Enter a valid email";
    }
    return null;
  }

    String? validateRole() {
      if (role == null || role!.isEmpty) {
        return "Select role";
      }
      return null;
    }

  /// Run all validations
  bool validateForm() {
    nameError = validateName();
    emailError = validateEmail();
    roleError = validateRole();

    notifyListeners(); // important to refresh UI

    if ([nameError,emailError,roleError].any((e) => e != null)) {
      debugPrint("Validation failed:");
      debugPrint("Name: nameError");
      debugPrint("Email: $emailError");
      debugPrint("Password: $roleError");
      return false;
    }
    return true;
  }

  bool _isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
    return emailRegex.hasMatch(email);
  }
}
