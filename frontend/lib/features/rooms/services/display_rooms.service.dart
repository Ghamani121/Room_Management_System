import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';
import 'package:rms/features/rooms/rooms.model.dart';

class DisplayRoomsService {
  final String baseUrl = "${ConfigService.baseUrl}/rooms/v1/rooms";

  Future<List<Room>> getRooms(String token) async {
    final response = await http.get(
      Uri.parse(baseUrl),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);

      if (decoded is Map<String, dynamic> && decoded.containsKey('data')) {
        return (decoded['data'] as List).map((e) => Room.fromJson(e)).toList();
      }

      // backend returns list
      if (decoded is List) {
        return decoded.map((e) => Room.fromJson(e)).toList();
      }

      // if decoded is neither Map nor List
      throw Exception("Unexpected response format: $decoded");
    } else {
      throw Exception("Failed to fetch rooms: ${response.statusCode}");
    }
  }
}
