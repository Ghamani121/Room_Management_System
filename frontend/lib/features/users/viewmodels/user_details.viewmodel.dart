import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/users/services/user_details.services.dart';

class UserDetailsViewmodel {
  final UserDetailsService _service = UserDetailsService();

  Future<bool> deleteUser(BuildContext context, String userId) async {
    print("entered viewmodel");

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";

    return await _service.deleteUser(token, userId);
  }
}
