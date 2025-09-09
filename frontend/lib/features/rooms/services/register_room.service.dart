import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/features/rooms/models/rooms.model.dart';
import 'package:rms/config.service.dart';

class RegisterRoomService {

  Future<Room> createRoom(Room room,String token) async {

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
