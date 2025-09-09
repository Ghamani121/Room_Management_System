import 'package:flutter/material.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/users/models/users.model.dart';
import 'package:rms/features/users/services/display_users.service.dart';
import 'package:provider/provider.dart';

class DisplayUsersViewModel {
  final DisplayUsersService _service = DisplayUsersService();

  Future<List<User>> fetchUsers(
    BuildContext context,{
    String? sortBy,
    String? sortOrder,
    String? startTime,
    String? endTime,
    }
  ) async {

    print("viewmodel");

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";

    return await _service.getUsers(
      token
    );
  }
}
