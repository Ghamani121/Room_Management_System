import 'package:flutter/material.dart';
import 'package:rms/features/bookings/models/bookings.model.dart';
import 'package:intl/intl.dart';
import 'package:rms/features/bookings/viewmodels/booking_details.viewmodel.dart';

const Color primaryRed = Color(0xFFC60210);

class BookingDetailsView extends StatefulWidget {
  final Booking booking;
  final String? roomName;

  const BookingDetailsView({
    super.key,
    required this.booking,
    this.roomName,
  });

  @override
  State<BookingDetailsView> createState() => _BookingDetailsViewState();
}

class _BookingDetailsViewState extends State<BookingDetailsView> {
  late Booking booking;
  String? roomName;
  late BookingDetailsViewmodel viewmodel;

  @override
  void initState() {
    super.initState();
    booking = widget.booking;
    roomName = widget.roomName;
    viewmodel = BookingDetailsViewmodel();
  }

  Future<void> _cancelBooking() async {
    try {
      final success = await viewmodel.deleteBooking(context, booking.id ?? "");
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Booking cancelled successfully")),
        );
        Navigator.pop(context, true); // go back and refresh list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Failed to cancel booking: $e")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Meeting Details",
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: primaryRed,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Card(
                color: Colors.white,
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TitleSection(title: booking.title),
                      const SizedBox(height: 16),
                      DateSection(date: booking.startTime),
                      const SizedBox(height: 16),
                      TimeSection(
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                      ),
                      const SizedBox(height: 16),
                      RoomSection(roomId: booking.roomId),
                      if (booking.attendees != null &&
                          booking.attendees!.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        AttendeesSection(attendees: booking.attendees!),
                      ],
                      const SizedBox(height: 30),
                      Center(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryRed,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 50, vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                            elevation: 3,
                          ),
                          onPressed: _cancelBooking,
                          child: const Text(
                            "Cancel Meeting",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Title / Purpose Widget
class TitleSection extends StatelessWidget {
  final String? title;
  const TitleSection({super.key, this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title ?? "-",
      style: const TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
      ),
    );
  }
}

// Date Widget
class DateSection extends StatelessWidget {
  final DateTime? date;
  const DateSection({super.key, this.date});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('dd MMM yyyy');
    return Row(
      children: [
        const Icon(Icons.calendar_today, color: primaryRed),
        const SizedBox(width: 12),
        Text(
          date != null ? formatter.format(date!) : "-",
          style: const TextStyle(fontSize: 16, color: Colors.black87),
        ),
      ],
    );
  }
}

// Start and End Time Widget
class TimeSection extends StatelessWidget {
  final DateTime? startTime;
  final DateTime? endTime;

  const TimeSection({super.key, this.startTime, this.endTime});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('hh:mm a');
    return Row(
      children: [
        const Icon(Icons.access_time, color: primaryRed),
        const SizedBox(width: 12),
        Text(
          startTime != null && endTime != null
              ? "${formatter.format(startTime!)} - ${formatter.format(endTime!)}"
              : "-",
          style: const TextStyle(fontSize: 16, color: Colors.black87),
        ),
      ],
    );
  }
}

// Room Widget
class RoomSection extends StatelessWidget {
  final String? roomId;
  const RoomSection({super.key, this.roomId});

  String _getRoomName(String? id) {
    switch (id) {
      case "68baaa17f3c57cf3841ab985":
        return "Board Room";
      case "68b81073797fd4e4212cc824":
        return "Conference Room";
      default:
        return "Unknown Room";
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.meeting_room, color: primaryRed),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            _getRoomName(roomId),
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}

// Attendees Widget
class AttendeesSection extends StatelessWidget {
  final List attendees;
  const AttendeesSection({super.key, required this.attendees});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.group, color: primaryRed),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            attendees.map((a) => a.name).join(", "),
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}
