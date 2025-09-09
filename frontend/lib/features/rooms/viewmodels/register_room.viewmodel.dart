import 'package:flutter/material.dart';
import 'package:rms/features/rooms/services/register_room.service.dart';
import '../models/rooms.model.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:provider/provider.dart';

class RegisterRoomViewModel extends ChangeNotifier {
  // State
  String? selectedRoom;
  int capacity = 0;
  final List<String> equipment = [];

  final TextEditingController capacityController = TextEditingController();

  final RegisterRoomService _service = RegisterRoomService();

  // Form key
  final GlobalKey<FormState> formKey = GlobalKey<FormState>();

  RegisterRoomViewModel() {
    capacityController.text = capacity.toString();
  }

Future<Room?> createRoom(BuildContext context) async {


  if (!validateForm()) return null; 

  final auth = Provider.of<AuthProvider>(context, listen: false);
  final token = auth.authData?.token ?? "";

  final room = buildRoom();

  

  try {
    final createdRoom = await _service.createRoom(room,token);

    // Print created room data
    print("\n\nCreated Room Data:");
    print("Name: ${createdRoom.name}");
    print("Capacity: ${createdRoom.capacity}");
    print("Equipment: ${createdRoom.equipment.join(", ")}");

    return createdRoom;
  } catch (e) {
    print("Error creating room: $e");
    rethrow;
  }
}


  // --- Room ---
  void setRoom(String? value) {
    selectedRoom = value;
    notifyListeners();
  }

  String? validateRoom(String? value) {
    if (value == null || value.isEmpty) {
      return "Please select a room";
    }
    if (value != "Board Room" && value != "Conference Room") {
      return "Invalid room selected";
    }
    return null;
  }

  // --- Capacity ---
  void increaseCapacity() {
    if (capacity < 20) {
      capacity++;
      capacityController.text = capacity.toString();
      notifyListeners();
    }
  }

  void decreaseCapacity() {
    if (capacity > 1) {
      capacity--;
      capacityController.text = capacity.toString();
      notifyListeners();
    }
  }

  void onCapacityChanged(String value) {
    final parsed = int.tryParse(value);
    if (parsed != null && parsed >= 1 && parsed <= 20) {
      capacity = parsed;
    } else {
      capacity = 0;
    }
    notifyListeners();
  }

  String? validateCapacity(String? value) {
    if (value == null || value.isEmpty) {
      return "Capacity is required";
    }
    final numValue = int.tryParse(value);
    if (numValue == null || numValue < 1 || numValue > 20) {
      return "Capacity must be between 1 and 20";
    }
    return null;
  }

  // --- Equipment ---
  void addEquipment(String item) {
    if (item.trim().isNotEmpty) {
      equipment.add(item.trim());
      notifyListeners();
    }
  }

  void removeEquipment(String item) {
    equipment.remove(item);
    notifyListeners();
  }

  // --- Build Room Object ---
  Room buildRoom() {
    return Room(
      name: selectedRoom ?? "",
      capacity: capacity,
      equipment: equipment,
    );
  }

  // --- Validation ---
  bool validateForm() {
    return formKey.currentState?.validate() ?? false;
  }

  // --- Reset ---
  void resetForm() {
    selectedRoom = null;
    capacity = 0;
    capacityController.clear();
    equipment.clear();
    notifyListeners();
  }
}
