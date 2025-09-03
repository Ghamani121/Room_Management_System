import 'package:flutter/material.dart';
import 'package:rms/features/bookings/bookings.model.dart';

class BookingDetailsViewModel {
  late String roomId;
  String? title;
  DateTime? startTime;
  DateTime? endTime;
  String? status;
  List<String> attendeesList = [];

  BookingDetailsViewModel([Booking? booking]) {
    if (booking != null) {
      roomId = booking.roomId;
      title = booking.title;
      startTime = booking.startTime;
      endTime = booking.endTime;
      status = booking.status ?? "Confirmed";
      attendeesList =
          booking.attendees?.map((a) => "${a.name} (${a.email})").toList() ?? [];
    } else {
      roomId = "";
      status = "Pending";
    }
  }

  void cancelBooking() {
    status = "Cancelled";
  }

  String get formattedStartTime =>
      startTime != null ? startTime.toString() : "-";

  String get formattedEndTime => endTime != null ? endTime.toString() : "-";
}
