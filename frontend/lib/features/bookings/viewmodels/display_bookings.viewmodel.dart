import 'package:flutter/material.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/bookings/bookings.model.dart';
import 'package:rms/features/bookings/services/display_bookings.service.dart';
import 'package:provider/provider.dart';

class DisplayBookingsViewModel {
  final DisplayBookingsService _service = DisplayBookingsService();

  Future<List<Booking>> fetchBookings(
    BuildContext context,{
    String? sortBy,
    String? sortOrder,
    String? startTime,
    String? endTime,
    }
  ) async {

    print("viewmodel");

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";

    return await _service.getBookings(
      token,
      sortBy: sortBy,
      sortOrder: sortOrder,
      startTime: startTime,
      endTime: endTime,
    );
  }
}
