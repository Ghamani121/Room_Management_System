import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/features/users/models/users.model.dart';
import 'package:rms/config.service.dart';

class UserService {

  Future<User> createUser(User user, String token) async {
    
    final url = Uri.parse("${ConfigService.baseUrl}/users/v1/user");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json",
      "Authorization": "Bearer $token"},
      body: jsonEncode(user.toJson()),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception(
          "Failed to create user: ${response.statusCode} ${response.body}");
    }
  }
}
