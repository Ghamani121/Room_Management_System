import 'package:flutter/material.dart';
import 'package:rms/features/bookings/viewmodels/display_bookings.viewmodel.dart';
import 'package:rms/features/bookings/views/book_room.view.dart';
import 'package:rms/features/bookings/bookings.model.dart';
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:rms/features/rooms/views/register_room.view.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';

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
      List<Booking> bookings = await viewModel.fetchBookings(context);
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
    "Dashboard",
    style: TextStyle(
      fontSize: 30,
      fontWeight: FontWeight.bold,
      color: Colors.white,
    ),
  ),
  backgroundColor: const Color(0xFFC60210),
  actions: [
    // 🔹 Sort
    PopupMenuButton<String>(
      icon: const Icon(Icons.sort, color: Colors.white),
      onSelected: (value) {
        setState(() => _isLoading = true);
        viewModel.fetchBookings(
          context,
          sortBy: value,
          sortOrder: "asc", // or toggle asc/desc
        ).then((bookings) {
          setState(() {
            _bookings = bookings;
            _isLoading = false;
          });
        });
      },
      itemBuilder: (context) => [
        const PopupMenuItem(value: "title", child: Text("Title")),
        const PopupMenuItem(value: "startTime", child: Text("Start Time")),
        const PopupMenuItem(value: "roomId", child: Text("Room")),
      ],
    ),

    // 🔹 Filter
    PopupMenuButton<String>(
      icon: const Icon(Icons.filter_list, color: Colors.white),
      onSelected: (value) async {
        if (value == "date") {
          final picked = await showDateRangePicker(
            context: context,
            firstDate: DateTime(2020),
            lastDate: DateTime(2030),
          );
          if (picked != null) {
            setState(() => _isLoading = true);
            viewModel.fetchBookings(
              context,
              startTime: picked.start.toIso8601String(),
              endTime: picked.end.toIso8601String(),
            ).then((bookings) {
              setState(() {
                _bookings = bookings;
                _isLoading = false;
              });
            });
          }
        }
        if (value == "roomId") {
          // TODO: show dialog/dropdown of available rooms
          print("Filter by Room");
        }
      },
      itemBuilder: (context) => [
        const PopupMenuItem(value: "date", child: Text("Date Range")),
        const PopupMenuItem(value: "roomId", child: Text("Room")),
      ],
    ),

    // 🔹 Logout
    IconButton(
      icon: const Icon(Icons.logout),
      onPressed: () {
        Provider.of<AuthProvider>(context, listen: false).logout();
      },
      color: Colors.white,
    ),
  ],
),

      body: SafeArea(
        child:
            _isLoading
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
                            builder:
                                (_) => BookingDetailsView(booking: booking),
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
      color: Colors.white,
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
    final DateFormat formatter = DateFormat('dd MMM yyyy, hh:mm a');
    return Scaffold(
      backgroundColor: Colors.white, // ✅ match dashboard
      appBar: AppBar(
        title: const Text(
          "Meeting Details",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFC60210),
        iconTheme: const IconThemeData(
          color: Colors.white,
        ), // ✅ back button white
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: 500,
              ), // ✅ prevent stretching
              child: Card(
                color: Colors.white,
                elevation: 5,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _detailRow(
                        Icons.confirmation_number,
                        "Booking ID",
                        booking.id ?? "-",
                      ),
                      _detailRow(Icons.meeting_room, "Room ID", booking.roomId),
                      _detailRow(
                        Icons.person,
                        "User ID",
                        booking.userId ?? "-",
                      ),
                      _detailRow(Icons.title, "Title", booking.title ?? "-"),
                      _detailRow(
                        Icons.access_time,
                        "Start Time",
                        booking.startTime.toString(),
                      ),
                      _detailRow(
                        Icons.access_time_filled,
                        "End Time",
                        booking.endTime.toString(),
                      ),
                      _detailRow(
                        Icons.check_circle,
                        "Status",
                        booking.status ?? "-",
                      ),
                      _detailRow(
                        Icons.group,
                        "Attendees",
                        booking.attendees?.map((a) => a.name).join(", ") ??
                            "None",
                      ),
                      _detailRow(
                        Icons.calendar_today,
                        "Created At",
                        booking.createdAt != null
                            ? formatter.format(booking.createdAt!)
                            : "-",
                      ),
                      _detailRow(
                        Icons.update,
                        "Updated At",
                        booking.updatedAt != null
                            ? formatter.format(booking.updatedAt!)
                            : "-",
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

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Color(0xFFC60210), size: 22), // ✅ consistent red
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(fontSize: 15, color: Colors.black54),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
