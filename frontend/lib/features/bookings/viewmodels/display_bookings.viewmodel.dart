import 'package:flutter/material.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/bookings/models/bookings.model.dart';
import 'package:rms/features/bookings/services/display_bookings.service.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';

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
    final userId = auth.authData?.user?.id ?? "";

    return await _service.getBookings(
      token,
      userId,
      sortBy: sortBy,
      sortOrder: sortOrder,
      startTime: startTime,
      endTime: endTime,
    );
  }
}
