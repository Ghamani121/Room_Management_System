import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';

class RoomDetailsService {
  Future<bool> deleteRoom(String token, String roomId) async {
    final url = Uri.parse(
      "${ConfigService.baseUrl}/rooms/v1/$roomId",
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
      throw Exception("Failed to delete room: ${response.body}");
    }
  }
}
