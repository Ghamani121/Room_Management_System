import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';

class DisplayBookingsService {
  final String baseUrl = "${ConfigService.baseUrl}/bookings/v1/bookings";//changed from locat host so it can print on pc using 10.0.2.2

  final String token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTY5OTBlZmIwYmEwMzgxNzQ1MmUwYiIsIm5hbWUiOiJOaXJtYWxhIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJjaGVycnltZXJyeTEyMUBnbWFpbC5jb20iLCJpYXQiOjE3NTU3NjUxOTEsImV4cCI6MTc1ODM1NzE5MX0.oS-1652Ug_zrNjAbx-h2nmHUMEDHAR_eOjViBNQX7cA";
  
  Future<List<dynamic>> getBookings() async {
    // print("hello");
    final response = await http.get(
      Uri.parse(baseUrl),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );
    // print("Response status: ${response.statusCode}");
    // print("Response body: ${response.body}");
    // print("gekk");
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);

      // If backend wraps data
      if (decoded is Map<String, dynamic> && decoded.containsKey('data')) {
        return decoded['data'] as List<dynamic>;
      }

      // If backend directly returns a list
      if (decoded is List) {
        return decoded;
      }

      throw Exception("Unexpected response format: ${response.body}");
    } else {
      throw Exception("Failed to fetch bookings: ${response.statusCode}");
    }
  }
}
