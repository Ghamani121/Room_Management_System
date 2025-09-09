import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';
import 'package:rms/features/users/models/users.model.dart';

class DisplayUsersService {
  
  final String baseUrl = "${ConfigService.baseUrl}/users/v1/users";

  Future<List<User>> getUsers(
    String token
  ) async {

    final queryParams = <String, String>{};

    final uri = Uri.parse(baseUrl).replace(queryParameters: queryParams);


      print("\n\n\n\nFetching users from: $uri");
      print("Query Params: $queryParams");

    final response = await http.get(
      uri,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );

    
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);

      // If backend wraps data
        if (decoded is Map<String, dynamic> && decoded.containsKey('data')) {
          return (decoded['data'] as List)
              .map((e) => User.fromJson(e))
              .toList();
        }

        // backend returns list
        if (decoded is List) {
          return decoded.map((e) => User.fromJson(e)).toList();
        }

      throw Exception("Unexpected response format: ${response.body}");
    } else {
      throw Exception("Failed to fetch users: ${response.statusCode}");
    }
  }
}
