import 'package:flutter/material.dart';
import 'package:rms/features/bookings/viewmodels/display_bookings.viewmodel.dart';
import 'package:rms/features/bookings/views/book_room.view.dart';
import 'package:rms/features/bookings/models/bookings.model.dart';
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'booking_details.view.dart';
import 'package:intl/intl.dart';


class DisplayBookingsView extends StatefulWidget {
  const DisplayBookingsView({super.key});

  @override
  State<DisplayBookingsView> createState() => _DisplayBookingsViewState();
}

class _DisplayBookingsViewState extends State<DisplayBookingsView> {
  DisplayBookingsViewModel viewModel = DisplayBookingsViewModel();

  List<Booking> _bookings = [];
  bool _isLoading = true;

  // Persist filters
  String? _sortBy;
  String _sortOrder = "asc";
  String? _startTime;
  String? _endTime;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  void _loadBookings() async {
    try {
      List<Booking> bookings = await viewModel.fetchBookings(
        context,
        sortBy: _sortBy,
        sortOrder: _sortOrder,
        startTime: _startTime,
        endTime: _endTime,
      );
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
          Theme(
            data: Theme.of(context).copyWith(
              cardColor: Colors.white, // dropdown background
              textTheme: const TextTheme(
                bodyMedium: TextStyle(color: Colors.black87),
              ),
              iconTheme: const IconThemeData(color: Colors.white),
            ),
            child: PopupMenuButton<String>(
              color: Colors.white,
              icon: const Icon(Icons.swap_vert, color: Colors.white),
              onSelected: (value) {
                setState(() {
                  _isLoading = true;
                  _sortBy = value; // 🔹 persist sortBy
                  _sortOrder = "asc"; // keep as default for now
                });
                _loadBookings();
              },
              itemBuilder:
                  (context) => const [
                    PopupMenuItem(value: "title", child: Text("Title")),
                    PopupMenuItem(
                      value: "startTime",
                      child: Text("Start Time"),
                    ),
                  ],
            ),
          ),

          // 🔹 Filter
          Theme(
            data: Theme.of(context).copyWith(
              cardColor: Colors.white,
              textTheme: const TextTheme(
                bodyMedium: TextStyle(color: Colors.black87),
              ),
              iconTheme: const IconThemeData(color: Colors.white),
            ),
            child: PopupMenuButton<String>(
              color: Colors.white,
              icon: const Icon(Icons.tune, color: Colors.white, size: 28),
              onSelected: (value) async {
                if (value == "date") {
                  final picked = await showDateRangePicker(
                    context: context,
                    firstDate: DateTime(2020),
                    lastDate: DateTime(2030),
                  );
                  if (picked != null) {
                    setState(() => _isLoading = true);
                    viewModel
                        .fetchBookings(
                          context,
                          startTime: picked.start.toIso8601String(),
                          endTime: picked.end.toIso8601String(),
                        )
                        .then((bookings) {
                          setState(() {
                            _bookings = bookings;
                            _isLoading = false;
                          });
                        });
                  }
                } else if (value == "clear") {
                  setState(() {
                    _isLoading = true;
                    _sortBy = null;
                    _startTime = null;
                    _endTime = null;
                  });
                  _loadBookings();
                }
              },
              itemBuilder:
                  (context) => const [
                    PopupMenuItem(value: "date", child: Text("Date Range")),
                    PopupMenuItem(value: "clear", child: Text("Clear Filters")),
                  ],
            ),
          ),

          // 🔹 Logout
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () {
              Provider.of<AuthProvider>(context, listen: false).logout();
            },
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
                      onTap: () async{
                        final result = await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => BookingDetailsView(booking: booking),
                        ),
                      );

                      if (result == true) {
                        // Booking was deleted, reload the list
                        _loadBookings();
                      }
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
        //   // ✅ Create Room
        //   SpeedDialChild(
        //     child: const Icon(Icons.meeting_room, color: Colors.white),
        //     backgroundColor: Colors.blue,
        //     label: 'Create Room',
        //     onTap: () async {
        //       final result = await Navigator.push(
        //         context,
        //         MaterialPageRoute(builder: (context) => const RegisterRoomView()),
        //       );
        //       if (result != null) _loadBookings();
        //     },
        //   ),
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
            if (result != null) _loadBookings();
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
        subtitle: Text(
  "Date: ${booking.startTime != null ? DateFormat('dd MMM yyyy').format(booking.startTime!) : '-'}",
),

        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      ),
    );
  }
}
