import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/rooms/services/room_details.service.dart';

class RoomDetailsViewmodel {
  final RoomDetailsService _service = RoomDetailsService();

  Future<bool> deleteRoom(BuildContext context, String roomId) async {
    print("entered viewmodel");

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";

    return await _service.deleteRoom(token, roomId);
  }
}
