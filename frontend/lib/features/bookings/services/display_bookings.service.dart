import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:rms/config.service.dart';
import 'package:rms/features/bookings/bookings.model.dart';

class DisplayBookingsService {
  
  final String baseUrl = "${ConfigService.baseUrl}/bookings/v1/bookings";

  Future<List<Booking>> getBookings(
    String token,{  
    String? sortBy,
    String? sortOrder,
    String? startTime,
    String? endTime,
    }
  ) async {

    final queryParams = <String, String>{};

    if (sortBy != null) queryParams['sortBy'] = sortBy;
    if (sortOrder != null) queryParams['sortOrder'] = sortOrder;
    if (startTime != null) queryParams['startTime'] = startTime;
    if (endTime != null) queryParams['endTime'] = endTime;

    final uri = Uri.parse(baseUrl).replace(queryParameters: queryParams);
  print("\n\n\n\nFetching bookings from: $uri");
  print("📦 Query Params: $queryParams");

    final response = await http.get(
      uri,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
    );

    
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);

      // If backend wraps data
        if (decoded is Map<String, dynamic> && decoded.containsKey('data')) {
          return (decoded['data'] as List)
              .map((e) => Booking.fromJson(e))
              .toList();
        }

        // backend returns list
        if (decoded is List) {
          return decoded.map((e) => Booking.fromJson(e)).toList();
        }

      throw Exception("Unexpected response format: ${response.body}");
    } else {
      throw Exception("Failed to fetch bookings: ${response.statusCode}");
    }
  }
}
