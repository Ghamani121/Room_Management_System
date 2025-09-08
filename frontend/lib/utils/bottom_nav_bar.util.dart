import 'package:flutter/material.dart';
import 'package:rms/features/rooms/views/display_rooms.view.dart';
import 'package:rms/features/users/views/display_users.view.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final BuildContext context;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.context,
  });

  void _onTap(int index) {
    if (index == currentIndex) return; // already on this tab

    switch (index) {
      case 0:
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const DisplayRoomView()),
        );
        break;
      case 1:
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const DisplayUsersView()),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: _onTap,
      backgroundColor: Colors.white,
      selectedItemColor: const Color(0xFFC60210),
      unselectedItemColor: Colors.grey,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.meeting_room),
          label: "Rooms",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: "Users",
        ),
      ],
    );
  }
}
