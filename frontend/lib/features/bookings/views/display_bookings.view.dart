import 'package:flutter/material.dart';
import 'package:rms/features/bookings/viewmodels/display_bookings.viewmodel.dart';
import 'package:rms/features/bookings/views/book_room.view.dart';
import 'package:rms/features/bookings/bookings.model.dart';
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:rms/features/rooms/views/register_room.view.dart';

class DisplayBookingsView extends StatefulWidget {
  const DisplayBookingsView({super.key});

  @override
  State<DisplayBookingsView> createState() => _DisplayBookingsViewState();
}

class _DisplayBookingsViewState extends State<DisplayBookingsView> {
  DisplayBookingsViewModel viewModel = DisplayBookingsViewModel();
  List<Booking> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  void _loadBookings() async {
    try {
      List<Booking> bookings = await viewModel.fetchBookings();
      setState(() {
        _bookings = bookings;
        _isLoading = false;
      });
    } catch (e) {
      print("Error fetching bookings: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Bookings",
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFC60210),
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _bookings.isEmpty
                ? const Center(child: Text("No bookings available"))
                : ListView.builder(
                    padding: const EdgeInsets.all(20.0),
                    itemCount: _bookings.length,
                    itemBuilder: (context, index) {
                      final booking = _bookings[index];
                      return GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => BookingDetailsView(booking: booking),
                            ),
                          );
                        },
                        child: BookingCard(booking: booking),
                      );
                    },
                  ),
      ),
      floatingActionButton: _buildAddItems(),
    );
  }


Widget _buildAddItems() {
  return SpeedDial(
    icon: Icons.add,
    activeIcon: Icons.close,
    backgroundColor: const Color(0xFFC60210),
    foregroundColor: Colors.white,
    spacing: 12,
    spaceBetweenChildren: 8,
    children: [
      // ✅ Create Room
      SpeedDialChild(
        child: const Icon(Icons.meeting_room, color: Colors.white),
        backgroundColor: Colors.blue,
        label: 'Create Room',
        onTap: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const RegisterRoomView()),
          );
          if (result != null) {
            _loadBookings(); // or reload rooms if needed
          }
        },
      ),
      // ✅ Create Booking
      SpeedDialChild(
        child: const Icon(Icons.event, color: Colors.white),
        backgroundColor: Colors.green,
        label: 'Create Booking',
        onTap: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const BookRoomView()),
          );
          if (result != null) {
            _loadBookings();
          }
        },
      ),
    ],
  );
}


}

class BookingCard extends StatelessWidget {
  final Booking booking;
  const BookingCard({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 10),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        title: Text(booking.title ?? "Untitled Booking"),
        subtitle: Text("Room: ${booking.roomId}\nUser: ${booking.userId}"),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      ),
    );
  }
}

class BookingDetailsView extends StatelessWidget {
  final Booking booking;
  const BookingDetailsView({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Booking Details"),
        backgroundColor: const Color(0xFFC60210),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Card(
          elevation: 5,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Booking ID: ${booking.id ?? "-"}",
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Text("Room ID: ${booking.roomId}"),
                Text("User ID: ${booking.userId ?? "-"}"),
                Text("Title: ${booking.title ?? "-"}"),
                const SizedBox(height: 10),
                Text("Start Time: ${booking.startTime}"),
                Text("End Time: ${booking.endTime}"),
                const SizedBox(height: 10),
                Text("Status: ${booking.status ?? "-"}"),
                const SizedBox(height: 10),
                Text("Attendees: ${booking.attendees?.map((a) => a.name).join(", ") ?? "None"}"),
                const SizedBox(height: 10),
                Text("Created At: ${booking.createdAt ?? "-"}"),
                Text("Updated At: ${booking.updatedAt ?? "-"}"),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
