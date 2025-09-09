import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/bookings/services/booking_details.service.dart';

class BookingDetailsViewmodel {
  final BookingDetailsService _service = BookingDetailsService();

  Future<bool> deleteBooking(BuildContext context, String bookingId) async {
    print("entered viewmodel");

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";

    return await _service.deleteBooking(token, bookingId);
  }
}
