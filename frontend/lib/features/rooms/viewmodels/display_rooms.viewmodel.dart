import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/rooms/rooms.model.dart';
import 'package:rms/features/rooms/services/display_rooms.service.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';

class DisplayRoomsViewModel {
  final DisplayRoomsService _service = DisplayRoomsService();

  Future<List<Room>> fetchRooms(BuildContext context) async {
    print("viewmodel");

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";
    final data = await _service.getRooms(token);

    return data;
  }
}
