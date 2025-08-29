import 'package:flutter/material.dart';

class RegisterRoomPage extends StatefulWidget {
  const RegisterRoomPage({super.key});

  @override
  State<RegisterRoomPage> createState() => _RegisterRoomPageState();
}

class _RegisterRoomPageState extends State<RegisterRoomPage> {
  String? selectedRoom; // for dropdown
  int capacity = 0; // for capacity field
  final TextEditingController capacityController = TextEditingController();

  @override
  void initState() {
    super.initState();
    capacityController.text = capacity.toString();
  }

  @override
  void dispose() {
    capacityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Register Room",
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: const Color(0xFFC60210),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 15),

              // Room Name Dropdown
              const Text("Room Name",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey[50],
                ),
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: selectedRoom,
                  underline: const SizedBox(),
                  hint: const Text(
                    "Select Room",
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  dropdownColor: Colors.white,
                  items: const [
                    DropdownMenuItem(value: "Room A", child: Text("Bhishma")),
                    DropdownMenuItem(value: "Room B", child: Text("Ajeya")),
                  ],
                  onChanged: (value) {
                    setState(() {
                      selectedRoom = value;
                    });
                  },
                ),
              ),
              const SizedBox(height: 20),

              // Capacity (typeable + up/down)
              const Text("Capacity",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey[50],
                ),
                child: Row(
                  children: [
                    // Down button
                    IconButton(
                      iconSize: 20,
                      icon: const Icon(Icons.remove),
                      onPressed: () {
                        if (capacity > 0) {
                          setState(() {
                            capacity--;
                            capacityController.text = capacity.toString();
                          });
                        }
                      },
                    ),
                    // Editable text field
                    Expanded(
                      child: TextField(
                        controller: capacityController,
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: "0",
                        ),
                        onChanged: (value) {
                          setState(() {
                            capacity = int.tryParse(value) ?? 0;
                          });
                        },
                      ),
                    ),
                    // Up button
                    IconButton(
                      iconSize: 20,
                      icon: const Icon(Icons.add),
                      onPressed: () {
                        setState(() {
                          capacity++;
                          capacityController.text = capacity.toString();
                        });
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Equipment
              const Text("Equipment",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey[50],
                ),
                child: Row(
                  children: const [
                    Icon(
                      Icons.add_circle_outline,
                      size: 25,
                    ),
                    SizedBox(width: 8),
                    Text(
                      "Add item",
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 35),

              // Create Room Button
              Center(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC60210),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 50, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  onPressed: () {
                    // Print values for now
                    print("Room: $selectedRoom");
                    print("Capacity: $capacity");
                  },
                  child: const Text(
                    "Create Room",
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
