import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/features/bookings/bookings.model.dart';
import 'package:rms/config.service.dart';

class BookingService {

  Future<Booking> createBooking(Booking booking, String token) async {
    
    final url = Uri.parse("${ConfigService.baseUrl}/bookings/v1/booking");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json",
      "Authorization": "Bearer $token"},
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
