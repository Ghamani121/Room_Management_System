import 'package:flutter/material.dart';
import 'package:rms/features/users/viewmodels/display_users.viewmodel.dart';
import 'package:rms/features/users/models/users.model.dart';
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/rooms/views/register_room.view.dart';
import 'package:rms/features/users/views/create_user.view.dart';
import 'package:rms/main.dart';
import 'package:rms/utils/bottom_nav_bar.util.dart';

class DisplayUsersView extends StatefulWidget {
  const DisplayUsersView({super.key});

  @override
  State<DisplayUsersView> createState() => _DisplayUsersViewState();
}

class _DisplayUsersViewState extends State<DisplayUsersView> {
  DisplayUsersViewModel viewModel = DisplayUsersViewModel();
  List<User> _users = [];
  bool _isLoading = true;

  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  void _loadUsers() async {
    try {
      List<User> users = await viewModel.fetchUsers(context);
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      print("Error fetching users: $e");
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "User Details",
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFC60210),
        actions: [
          // 🔹 Sort
          // Theme(
          //   data: Theme.of(context).copyWith(
          //     cardColor: Colors.white, // dropdown background
          //     textTheme: const TextTheme(
          //       bodyMedium: TextStyle(color: Colors.black87),
          //     ),
          //     iconTheme: const IconThemeData(color: Colors.white),
          //   ),
          //   child: PopupMenuButton<String>(
          //     color: Colors.white,
          //     icon: const Icon(Icons.swap_vert, color: Colors.white),
          //     onSelected: (value) {
          //       setState(() => _isLoading = true);
          //       viewModel
          //           .fetchUsers(context, sortBy: value, sortOrder: "asc")
          //           .then((users) {
          //             setState(() {
          //               _users = users;
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
          //     color: Colors.white,
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
          //               .fetchUsers(
          //                 context,
          //                 startTime: picked.start.toIso8601String(),
          //                 endTime: picked.end.toIso8601String(),
          //               )
          //               .then((users) {
          //                 setState(() {
          //                   _users = users;
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
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const MyApp()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child:
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _users.isEmpty
                ? const Center(child: Text("No users available"))
                : ListView.builder(
                  padding: const EdgeInsets.all(20.0),
                  itemCount: _users.length,
                  itemBuilder: (context, index) {
                    final user = _users[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => UserDetailsView(user: user),
                          ),
                        );
                      },
                      child: UserCard(user: user),
                    );
                  },
                ),
      ),
      floatingActionButton: _buildAddItems(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomNavBar(currentIndex: 1, context: context),
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
            if (result != null) _loadUsers();
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
            if (result != null) _loadUsers();
          },
        ),
      ],
    );
  }
}

class UserCard extends StatelessWidget {
  final User user;
  const UserCard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.symmetric(vertical: 10),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        title: Text(user.name),
        subtitle: Text("Email: ${user.email}"),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      ),
    );
  }
}

class UserDetailsView extends StatelessWidget {
  final User user;
  const UserDetailsView({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('dd MMM yyyy, hh:mm a');
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "User Details",
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
                      _detailRow(
                        Icons.confirmation_number,
                        "User ID",
                        user.id ?? "-",
                      ),
                      _detailRow(Icons.title, "Email", user.email ?? "-"),
                      _detailRow(
                        Icons.signal_wifi_statusbar_null_outlined,
                        "Role",
                        user.role,
                      ),
                      _detailRow(
                        Icons.calendar_today,
                        "Created At",
                        user.createdAt != null
                            ? formatter.format(user.createdAt!)
                            : "-",
                      ),
                      _detailRow(
                        Icons.update,
                        "Updated At",
                        user.updatedAt != null
                            ? formatter.format(user.updatedAt!)
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
