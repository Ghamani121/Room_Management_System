import 'package:flutter/material.dart';
import 'package:rms/features/rooms/viewmodels/display_rooms.viewmodel.dart';
import 'package:rms/features/rooms/rooms.model.dart';

class DisplayRoomView extends StatefulWidget {
  const DisplayRoomView({super.key});

  @override
  State<DisplayRoomView> createState() => _DisplayRoomViewState();
}

class _DisplayRoomViewState extends State<DisplayRoomView> {
  final viewModel = DisplayRoomsViewModel();

  @override
  void initState() {
    super.initState();
    _loadRooms();
    
  }

  void _loadRooms() async {
    try {
      // print("hello");
      List<Room> rooms = await viewModel.fetchRooms(context);
      for (var room in rooms) {
        print(
          "Room: ${room.name}, Capacity: ${room.capacity}, Equipment: ${room.equipment}",
        );
      }
    } catch (e) {
      print("Error fetching rooms: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    // print("hello");
    return const Scaffold(
      body: Center(child: Text("Check console for room details")),
    );
  }
}
