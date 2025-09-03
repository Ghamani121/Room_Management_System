import 'package:flutter/material.dart';
import 'package:rms/features/bookings/viewmodels/dashboard.viewmodel.dart';
import 'package:rms/features/bookings/views/book_room.view.dart';
import 'package:rms/features/bookings/bookings.model.dart';
import 'booking_details.view.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  DashboardViewModel viewModel = DashboardViewModel();

  //to store booking temporarily
  final List<Booking> _bookings = [];

  //because user enters room name which needs to converted to booking id format
  final Map<String, String> roomNames = {
    'r1': 'Board Room',
    'r2': 'Conference Room',
  };

  Future<void> _navigateToBookRoom() async {
    final booking = await Navigator.push<Booking>(
      context,
      MaterialPageRoute(builder: (_) => const BookRoomView()),
    );
    //add data from booking to a _booking list
    if (booking != null) {
      setState(() {
        _bookings.add(booking);
      });
    }
  }

  @override
  // void dispose() {
  //   viewModel.disposeControllers();
  //   super.dispose();
  // }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Dashboard",
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFC60210),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [_buildBookingCard()],
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: _buildAddBooking(),
    );
  }

  Widget _buildBookingCard() {
    if (_bookings.isEmpty) {
      return const Center(child: Text("No bookings yet. Tap + to create"));
    }
    return ListView.builder(
          shrinkWrap: true, // ✅ makes ListView fit content
          physics: const NeverScrollableScrollPhysics(), // ✅ disables inner scrolling
      itemCount: _bookings.length,
      itemBuilder: (context, index) {
        final booking = _bookings[index];
        return Card(
          child: ListTile(
            title: Text("Room: ${booking.roomId}"),
            subtitle:
                booking.title != null
                    ? Text(booking.title!)
                    : const Text("No title"),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => BookingDetailsView(booking: booking),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildAddBooking() {
    return FloatingActionButton(
      backgroundColor: const Color(0xFFC60210),
      onPressed: _navigateToBookRoom, // <-- call the function
      child: const Icon(Icons.add, color: Colors.white),
    );
  }



}
