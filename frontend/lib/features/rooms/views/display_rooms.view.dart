import 'package:flutter/material.dart';
import 'package:rms/features/rooms/viewmodels/display_rooms.viewmodel.dart';
import 'package:rms/features/rooms/rooms.model.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:intl/intl.dart';
import 'package:rms/features/rooms/views/register_room.view.dart';
import 'package:rms/features/users/views/create_user.view.dart';
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:rms/utils/bottom_nav_bar.util.dart';

class DisplayRoomView extends StatefulWidget {
  const DisplayRoomView({super.key});

  @override
  State<DisplayRoomView> createState() => _DisplayRoomViewState();
}

class _DisplayRoomViewState extends State<DisplayRoomView> {
  final viewModel = DisplayRoomsViewModel();
  List<Room> _rooms = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRooms();
  }

  void _loadRooms() async {
    try {
      List<Room> rooms = await viewModel.fetchRooms(context);
      setState(() {
        _rooms = rooms;
        _isLoading = false;
      });
    } catch (e) {
      print("Error fetching rooms: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Room Details",
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFC60210),
        actions: [
          // // 🔹 Sort
          // Theme(
          //   data: Theme.of(context).copyWith(
          //     cardColor: Colors.white, // dropdown background
          //     textTheme: const TextTheme(
          //       bodyMedium: TextStyle(color: Colors.black87),
          //     ),
          //     iconTheme: const IconThemeData(color: Colors.white),
          //   ),
          //   child: PopupMenuButton<String>(
          //     icon: const Icon(Icons.swap_vert, color: Colors.white),
          //     onSelected: (value) {
          //       setState(() => _isLoading = true);
          //       viewModel
          //           .fetchRooms(context, sortBy: value, sortOrder: "asc")
          //           .then((rooms) {
          //             setState(() {
          //               _rooms = rooms;
          //               _isLoading = false;
          //             });
          //           });
          //     },
          //     itemBuilder:
          //         (context) => const [
          //           PopupMenuItem(value: "title", child: Text("Title")),
          //           PopupMenuItem(
          //             value: "startTime",
          //             child: Text("Start Time"),
          //           ),
          //         ],
          //   ),
          // ),

          // // 🔹 Filter
          // Theme(
          //   data: Theme.of(context).copyWith(
          //     cardColor: Colors.white,
          //     textTheme: const TextTheme(
          //       bodyMedium: TextStyle(color: Colors.black87),
          //     ),
          //     iconTheme: const IconThemeData(color: Colors.white),
          //   ),
          //   child: PopupMenuButton<String>(
          //     icon: const Icon(Icons.tune, color: Colors.white, size: 28),
          //     onSelected: (value) async {
          //       if (value == "date") {
          //         final picked = await showDateRangePicker(
          //           context: context,
          //           firstDate: DateTime(2020),
          //           lastDate: DateTime(2030),
          //         );
          //         if (picked != null) {
          //           setState(() => _isLoading = true);
          //           viewModel
          //               .fetchRooms(
          //                 context,
          //                 startTime: picked.start.toIso8601String(),
          //                 endTime: picked.end.toIso8601String(),
          //               )
          //               .then((rooms) {
          //                 setState(() {
          //                   _rooms = rooms;
          //                   _isLoading = false;
          //                 });
          //               });
          //         }
          //       }
          //     },
          //     itemBuilder:
          //         (context) => const [
          //           PopupMenuItem(value: "date", child: Text("Date Range")),
          //         ],
          //   ),
          // ),

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
                : _rooms.isEmpty
                ? const Center(child: Text("No rooms available"))
                : ListView.builder(
                  padding: const EdgeInsets.all(20.0),
                  itemCount: _rooms.length,
                  itemBuilder: (context, index) {
                    final room = _rooms[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => RoomDetailsView(room: room),
                          ),
                        );
                      },
                      child: RoomCard(room: room),
                    );
                  },
                ),
      ),
      floatingActionButton: _buildAddItems(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomNavBar(currentIndex: 0, context: context),
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
            if (result != null) _loadRooms();
          },
        ),
        // ✅ Create User
        SpeedDialChild(
          child: const Icon(Icons.event, color: Colors.white),
          backgroundColor: Colors.green,
          label: 'Create User',
          onTap: () async {
            final result = await Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const CreateUserView()),
            );
            if (result != null) _loadRooms();
          },
        ),
      ],
    );
  }
}

class RoomCard extends StatelessWidget {
  final Room room;
  const RoomCard({super.key, required this.room});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.symmetric(vertical: 10),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        title: Text(room.name ?? "Untitled Room"),
        subtitle: Text("Capacity: ${room.capacity}"),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      ),
    );
  }
}

class RoomDetailsView extends StatelessWidget {
  final Room room;
  const RoomDetailsView({super.key, required this.room});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('dd MMM yyyy, hh:mm a');
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Room Details",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFC60210),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
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
                      _detailRow(Icons.meeting_room, "Room ID", room.id ?? "-"),
                      _detailRow(Icons.title, "Title", room.name ?? "-"),
                      _detailRow(
                        Icons.reduce_capacity,
                        "Capacity",
                        room.capacity.toString() ?? "-",
                      ),
                      _detailRow(
                        Icons.group,
                        "Equipment",
                        room.equipment?.join(", ") ?? "None",
                      ),
                      _detailRow(
                        Icons.calendar_today,
                        "Created At",
                        room.createdAt != null
                            ? formatter.format(room.createdAt!)
                            : "-",
                      ),
                      _detailRow(
                        Icons.update,
                        "Updated At",
                        room.updatedAt != null
                            ? formatter.format(room.updatedAt!)
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
          Icon(icon, color: const Color(0xFFC60210), size: 22),
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
