import 'dart:convert';
import 'package:http/http.dart' as http;

class DisplayRoomsService {
  final String baseUrl = "http://192.168.1.108:5000/api/rooms/v1/rooms";//changed from locat host so it can print on pc using 10.0.2.2
  final String token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTY5OTBlZmIwYmEwMzgxNzQ1MmUwYiIsIm5hbWUiOiJOaXJtYWxhIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJjaGVycnltZXJyeTEyMUBnbWFpbC5jb20iLCJpYXQiOjE3NTU3NjUxOTEsImV4cCI6MTc1ODM1NzE5MX0.oS-1652Ug_zrNjAbx-h2nmHUMEDHAR_eOjViBNQX7cA";
  
  Future<List<dynamic>> getRooms() async {
    print("hello");
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
      return jsonDecode(response.body) as List;
    } else {
      throw Exception("Failed to fetch rooms: ${response.statusCode}");
    }
  }
}
