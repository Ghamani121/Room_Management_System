import 'package:flutter/material.dart';
import '../rooms.model.dart';
import '../viewmodels/register_room.viewmodel.dart';

class RegisterRoomView extends StatefulWidget {
  const RegisterRoomView({super.key});

  @override
  State<RegisterRoomView> createState() => _RegisterRoomViewState();
}

class _RegisterRoomViewState extends State<RegisterRoomView> {
  final RegisterRoomViewModel vm = RegisterRoomViewModel();
  final TextEditingController _equipmentController = TextEditingController();

  @override
  void dispose() {
    vm.capacityController.dispose();
    _equipmentController.dispose();
    super.dispose();
  }

  void _resetForm() {
    setState(() {
      vm.resetForm();
      _equipmentController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Register Room",
            style: TextStyle(
                fontSize: 30, fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFFC60210),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Form(
                key: vm.formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 15),
                    _buildRoomDropdown(),
                    const SizedBox(height: 20),
                    _buildCapacityField(),
                    const SizedBox(height: 20),
                    _buildEquipmentSection(),
                    const SizedBox(height: 35),
                    _buildCreateRoomButton(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// --- Room Dropdown ---
  Widget _buildRoomDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Room Name",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        DropdownButtonFormField<String>(
          value: vm.selectedRoom,
          isExpanded: true,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
          ),
          hint: const Text("Select Room"),
          dropdownColor: Colors.white,
          items: const [
            DropdownMenuItem(value: "Board Room", child: Text("Bhishma")),
            DropdownMenuItem(value: "Conference Room", child: Text("Ajeya")),
          ],
          validator: vm.validateRoom,
          onChanged: (value) => setState(() => vm.setRoom(value)),
        ),
      ],
    );
  }

  /// --- Capacity Field ---
  Widget _buildCapacityField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Capacity",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: vm.capacityController,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            hintText: "Enter capacity",
            prefixIcon: IconButton(
              icon: const Icon(Icons.remove),
              onPressed: () => setState(() => vm.decreaseCapacity()),
            ),
            suffixIcon: IconButton(
              icon: const Icon(Icons.add),
              onPressed: () => setState(() => vm.increaseCapacity()),
            ),
          ),
          validator: vm.validateCapacity,
          onChanged: vm.onCapacityChanged,
        ),
      ],
    );
  }

  Widget _buildEquipmentSection() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      const Text("Equipment", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      const SizedBox(height: 8),

      // List of added equipment
      if (vm.equipment.isNotEmpty)
        Column(
          children: List.generate(vm.equipment.length, (index) {
            final item = vm.equipment[index];
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      readOnly: true,
                      initialValue: item,
                      decoration: InputDecoration(
                        border: const OutlineInputBorder(),
                        filled: true,
                        fillColor: Colors.grey[50],
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () {
                      setState(() {
                        vm.removeEquipment(item);
                      });
                    },
                  ),
                ],
              ),
            );
          }),
        ),

      const SizedBox(height: 10),

      // Inline add equipment
      Row(
        children: [
          Expanded(
            child: TextFormField(
              controller: _equipmentController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: "Add equipment",
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Colors.green),
            onPressed: () {
              final text = _equipmentController.text.trim();
              if (text.isNotEmpty) {
                setState(() {
                  vm.addEquipment(text);
                  _equipmentController.clear();
                });
              }
            },
          ),
        ],
      ),
    ],
  );
}


  /// --- Create Room Button ---
  Widget _buildCreateRoomButton() {
    return Center(
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFC60210),
          padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
        onPressed: () async {
                if (!vm.validateForm()) return;

                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (_) => const Center(child: CircularProgressIndicator()),
                );

                try {
                  final createdRoom = await vm.createRoom(context);

                  if (createdRoom != null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Room created successfully!")),
                    );
                    _resetForm();
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Failed to create room: $e")),
                  );
                } finally {
                  Navigator.of(context).pop(); // hide loading
                }
              },
        child: const Text("Create Room",
            style: TextStyle(
                fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
      ),
    );
  }
}
