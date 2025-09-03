import 'package:flutter/material.dart';
import 'package:rms/features/bookings/bookings.model.dart';
import 'package:rms/features/bookings/viewmodels/booking_details.viewmodel.dart';

class BookingDetailsView extends StatefulWidget {
  final Booking booking;

  const BookingDetailsView({super.key, required this.booking});

  @override
  State<BookingDetailsView> createState() => _BookingDetailsViewState();
}

class _BookingDetailsViewState extends State<BookingDetailsView> {
  BookingDetailsViewModel viewModel = BookingDetailsViewModel();

  @override
  void initState() {
    super.initState();
    viewModel = BookingDetailsViewModel(widget.booking);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Booking Details"),
        backgroundColor: const Color(0xFFC60210),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            _buildDetailRow("Room ID", viewModel.roomId),
            _buildDetailRow("Title", viewModel.title ?? "No title"),
            _buildDetailRow("Start Time", viewModel.formattedStartTime),
            _buildDetailRow("End Time", viewModel.formattedEndTime),
            _buildDetailRow("Status", viewModel.status ?? "-"),
            if (viewModel.attendeesList.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                "Attendees:",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 8),
              ...viewModel.attendeesList.map((a) => Text("- $a")),
            ],
            const SizedBox(height: 30),
            _buildCancelButton(),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "$label: ",
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCancelButton() {
    return Center(
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.red,
          padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
        onPressed: () {
          setState(() {
            viewModel.cancelBooking();
          });

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Booking cancelled")),
          );

          Navigator.pop(context); // Close details after cancel
        },
        child: const Text(
          "Cancel Booking",
          style: TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }
}
