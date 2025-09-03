import 'package:rms/features/rooms/rooms.model.dart';
import 'package:rms/features/rooms/services/display_rooms.service.dart';

class DisplayRoomsViewModel {
  final DisplayRoomsService _service = DisplayRoomsService();

  Future<List<Room>> fetchRooms() async {
    print("viewmodel");
    final data = await _service.getRooms();
    return data.map<Room>((json) => Room.fromJson(json)).toList();
  }
}
