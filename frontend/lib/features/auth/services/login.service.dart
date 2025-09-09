import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';
import 'package:rms/features/auth/login.model.dart';

class LoginService {
  
  /// Replace with your auth token if needed
  final String? token;

  LoginService({this.token});

  /// Login API call
  Future<Welcome> login(String email, String password) async {
    final url = Uri.parse("${ConfigService.baseUrl}/auth/v1/login");

    try {
      final response = await http.post(
        url,
        headers: {
          "Content-Type": "application/json",
          if (token != null) "Authorization": "Bearer $token",
        },
        body: jsonEncode({
          "email": email,
          "password": password,
        }),
      );

      if (response.statusCode == 200) {
        // Parse response JSON into Welcome model
        return Welcome.fromJson(jsonDecode(response.body));
      } else {
        throw Exception(
            "Login failed: ${response.statusCode} ${response.body}");
      }
    } catch (e) {
      print("Error in login: $e");
      rethrow;
    }
  }
}
