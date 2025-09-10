import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';

class UserDetailsService {
  Future<bool> deleteUser(String token, String userId) async {
    final url = Uri.parse(
      "${ConfigService.baseUrl}/users/v1/$userId",
    );

    debugPrint("$url");

    final response = await http.delete(
      url,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 204) {
      return true;
    } else {
      throw Exception("Failed to delete user: ${response.body}");
    }
  }
}
