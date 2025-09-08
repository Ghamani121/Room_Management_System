import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';

class DisplayRoomsService {

  final String baseUrl = "${ConfigService.baseUrl}/rooms/v1/rooms";//changed from locat host so it can print on pc using 10.0.2.2
  
  Future<List<dynamic>> getRooms(String token) async {
    final response = await http.get(
      Uri.parse(baseUrl),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List;
    } else {
      throw Exception("Failed to fetch rooms: ${response.statusCode}");
    }
  }
}
