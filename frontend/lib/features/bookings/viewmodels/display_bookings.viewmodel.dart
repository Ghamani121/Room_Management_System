import 'package:rms/features/bookings/bookings.model.dart';
import 'package:rms/features/bookings/services/display_bookings.service.dart';

class DisplayBookingsViewModel {
  final DisplayBookingsService _service = DisplayBookingsService();

  Future<List<Booking>> fetchBookings() async {
    print("viewmodel");
    final data = await _service.getBookings();
    return data.map<Booking>((json) => Booking.fromJson(json)).toList();
  }
}
