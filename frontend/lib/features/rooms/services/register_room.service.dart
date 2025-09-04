import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/features/rooms/rooms.model.dart';
import 'package:rms/config.service.dart';

class RegisterRoomService {
    final String token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTY5OTBlZmIwYmEwMzgxNzQ1MmUwYiIsIm5hbWUiOiJOaXJtYWxhIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJjaGVycnltZXJyeTEyMUBnbWFpbC5jb20iLCJpYXQiOjE3NTU3NjUxOTEsImV4cCI6MTc1ODM1NzE5MX0.oS-1652Ug_zrNjAbx-h2nmHUMEDHAR_eOjViBNQX7cA";

  Future<Room> createRoom(Room room) async {

    final url = Uri.parse("${ConfigService.baseUrl}/rooms/v1/room");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json",
      "Authorization": "Bearer $token"},
      body: jsonEncode(room.toCreateJson()),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return Room.fromJson(jsonDecode(response.body));
    } else {
      throw Exception(
          "Failed to create booking: ${response.statusCode} ${response.body}");
    }
  }
}
