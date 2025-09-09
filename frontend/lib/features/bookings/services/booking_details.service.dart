import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';

class BookingDetailsService {
  Future<bool> deleteBooking(String token, String bookingId) async {
    final url = Uri.parse(
      "${ConfigService.baseUrl}/bookings/v1/$bookingId",
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
