import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:rms/features/rooms/models/rooms.model.dart';
import 'package:rms/features/rooms/viewmodels/room_details.viewmodel.dart';

const Color primaryRed = Color(0xFFC60210);

class RoomDetailsView extends StatefulWidget {
  final Room room;

  const RoomDetailsView({super.key, required this.room});

  @override
  State<RoomDetailsView> createState() => _RoomDetailsViewState();
}

class _RoomDetailsViewState extends State<RoomDetailsView> {
  late Room room;
  late RoomDetailsViewmodel viewmodel;

  @override
  void initState() {
    super.initState();
    room = widget.room;
    viewmodel = RoomDetailsViewmodel();
  }

  Future<void> _cancelRoom() async {
    try {
      final success = await viewmodel.deleteRoom(context, room.id ?? "");
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Room deleted successfully")),
        );
        Navigator.pop(context, true); // go back and refresh list
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Failed to cancel room: $e")));
      }
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
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: primaryRed,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Card(
                color: Colors.white,
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RoomNameSection(name: room.name),
                      const SizedBox(height: 16),
                      CapacitySection(capacity: room.capacity),
                      const SizedBox(height: 16),
                      EquipmentSection(equipment: room.equipment),
                      const SizedBox(height: 16),
                      CreatedAtSection(date: room.createdAt),
                      const SizedBox(height: 16),
                      UpdatedAtSection(date: room.updatedAt),
                      const SizedBox(height: 30),
                      Center(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryRed,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 50,
                              vertical: 14,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                            elevation: 3,
                          ),
                          onPressed: _cancelRoom,
                          child: const Text(
                            "Remove Room",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
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
}

/// Room Name
class RoomNameSection extends StatelessWidget {
  final String? name;
  const RoomNameSection({super.key, this.name});

  @override
  Widget build(BuildContext context) {
    return Text(
      name ?? "-",
      style: const TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
      ),
    );
  }
}

/// Capacity
class CapacitySection extends StatelessWidget {
  final int? capacity;
  const CapacitySection({super.key, this.capacity});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.reduce_capacity, color: primaryRed),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            capacity != null ? capacity.toString() : "-",
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}

/// Equipment
class EquipmentSection extends StatelessWidget {
  final List<String>? equipment;
  const EquipmentSection({super.key, this.equipment});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.build, color: primaryRed),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            (equipment != null && equipment!.isNotEmpty)
                ? equipment!.join(", ")
                : "None",
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}

/// Created At
class CreatedAtSection extends StatelessWidget {
  final DateTime? date;
  const CreatedAtSection({super.key, this.date});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('dd MMM yyyy, hh:mm a');
    return Row(
      children: [
        const Icon(Icons.calendar_today, color: primaryRed),
        const SizedBox(width: 12),
        Text(
          date != null ? formatter.format(date!) : "-",
          style: const TextStyle(fontSize: 16, color: Colors.black87),
        ),
      ],
    );
  }
}

/// Updated At
class UpdatedAtSection extends StatelessWidget {
  final DateTime? date;
  const UpdatedAtSection({super.key, this.date});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('dd MMM yyyy, hh:mm a');
    return Row(
      children: [
        const Icon(Icons.update, color: primaryRed),
        const SizedBox(width: 12),
        Text(
          date != null ? formatter.format(date!) : "-",
          style: const TextStyle(fontSize: 16, color: Colors.black87),
        ),
      ],
    );
  }
}
