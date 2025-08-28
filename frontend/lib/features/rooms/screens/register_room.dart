import 'package:flutter/material.dart';

class RegisterRoomScreen extends StatefulWidget{
  const RegisterRoomScreen({super.key});

  @override
  State<RegisterRoomScreen> createState()=> _RegisterRoomScreenState();
}

class _RegisterRoomScreenState extends State<RegisterRoomScreen>
{
  final List<String> roomName=['Board Room','Conference Room'];
  String? selectedRoomName;

  @override
  Widget build(BuildContext contect)
  {
    return Scaffold(
      appBar: AppBar((title: const Text("Create Room")),
        body: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Room Name"),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                      value: selectedRoomName,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                      ),
                    items: roomName.map((type)
                    {
                      return DropdownMenuItem(
                      value: type,
                      child: Text(type),
                      );
                    }).toList(),
                    onChanged: (value)
                    {
                      setState(() {
                        selectedRoomName=value;
                      });
                    },
                  ),
                  const SizedBox(height: 16),

                  //capacity
                  const Text("capacity")
                ],
              )
            )
        )
      ),
    );
  }
}
