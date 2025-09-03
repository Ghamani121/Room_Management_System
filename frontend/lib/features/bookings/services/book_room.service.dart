import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/features/bookings/bookings.model.dart';

class BookingService {
  static const String baseUrl = "http://192.168.1.108:5000/api";

  Future<Booking> createBooking(Booking booking) async {
    final url = Uri.parse("$baseUrl/room/book");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(booking.toJson()),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return Booking.fromJson(jsonDecode(response.body));
    } else {
      throw Exception(
          "Failed to create booking: ${response.statusCode} ${response.body}");
    }
  }
}
