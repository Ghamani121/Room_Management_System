import 'package:flutter/material.dart';

class BookRoomView extends StatefulWidget {
  const BookRoomView({super.key});

  @override
  State<BookRoomView> createState() => _BookRoomViewState();
}

class _BookRoomViewState extends State<BookRoomView> {
  String? selectedRoom;
  final TextEditingController _titleController = TextEditingController();
  DateTime? startTime;
  DateTime? endTime;

  final List<Map<String, String>> attendees = [];
  final TextEditingController _attendeeNameController = TextEditingController();
  final TextEditingController _attendeeEmailController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _attendeeNameController.dispose();
    _attendeeEmailController.dispose();
    super.dispose();
  }

  void _resetForm() {
    setState(() {
      selectedRoom = null;
      _titleController.clear();
      startTime = null;
      endTime = null;
      attendees.clear();
      _attendeeNameController.clear();
      _attendeeEmailController.clear();
    });
  }

  Future<void> _pickStartTime() async {
    final DateTime? date = await showDatePicker(
      context: context,
      initialDate: startTime ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (date == null) return;

    final TimeOfDay? time = await showTimePicker(
      context: context,
      initialTime: startTime != null
          ? TimeOfDay.fromDateTime(startTime!)
          : TimeOfDay.now(),
    );
    if (time == null) return;

    setState(() {
      startTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _pickEndTime() async {
    final DateTime? date = await showDatePicker(
      context: context,
      initialDate: endTime ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (date == null) return;

    final TimeOfDay? time = await showTimePicker(
      context: context,
      initialTime: endTime != null
          ? TimeOfDay.fromDateTime(endTime!)
          : TimeOfDay.now(),
    );
    if (time == null) return;

    setState(() {
      endTime = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  void _addAttendee() {
    final name = _attendeeNameController.text.trim();
    final email = _attendeeEmailController.text.trim();
    if (name.isNotEmpty && email.isNotEmpty) {
      setState(() {
        attendees.add({'name': name, 'email': email});
        _attendeeNameController.clear();
        _attendeeEmailController.clear();
      });
    }
  }

  void _removeAttendee(int index) {
    setState(() {
      attendees.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Create Booking",
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: const Color(0xFFC60210),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 15),
                  _buildRoomDropdown(),
                  const SizedBox(height: 20),
                  _buildTitleField(),
                  const SizedBox(height: 20),
                  _buildStartEndTimeRow(),
                  const SizedBox(height: 20),
                  _buildAttendeesSection(),
                  const SizedBox(height: 35),
                  _buildCreateBookingButton(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoomDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Room Name", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        DropdownButtonFormField<String>(
          value: selectedRoom,
          isExpanded: true,
          decoration: const InputDecoration(border: OutlineInputBorder()),
          hint: const Text("Select Room"),
          items: const [
            DropdownMenuItem(value: "room1_id", child: Text("Bhishma")),
            DropdownMenuItem(value: "room2_id", child: Text("Ajeya")),
          ],
          onChanged: (value) => setState(() => selectedRoom = value),
        ),
      ],
    );
  }

  Widget _buildTitleField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Title (Optional)", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: _titleController,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: "Enter title",
          ),
        ),
      ],
    );
  }

  Widget _buildStartEndTimeRow() {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Start Time", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                readOnly: true,
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  hintText: startTime != null
                      ? startTime.toString()
                      : "Select start time",
                ),
                onTap: _pickStartTime,
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("End Time", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              TextFormField(
                readOnly: true,
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  hintText: endTime != null ? endTime.toString() : "Select end time",
                ),
                onTap: _pickEndTime,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAttendeesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Attendees", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),

        if (attendees.isNotEmpty)
          Column(
            children: List.generate(attendees.length, (index) {
              final attendee = attendees[index];
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        readOnly: true,
                        initialValue: attendee['name'],
                        decoration: InputDecoration(
                          border: const OutlineInputBorder(),
                          filled: true,
                          fillColor: Colors.grey[50],
                          hintText: "Name",
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextFormField(
                        readOnly: true,
                        initialValue: attendee['email'],
                        decoration: InputDecoration(
                          border: const OutlineInputBorder(),
                          filled: true,
                          fillColor: Colors.grey[50],
                          hintText: "Email",
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.grey),
                      onPressed: () => _removeAttendee(index),
                    ),
                  ],
                ),
              );
            }),
          ),

        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _attendeeNameController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: "Name",
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                controller: _attendeeEmailController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: "Email",
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.add_circle_outline, color: Colors.green),
              onPressed: _addAttendee,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCreateBookingButton() {
    return Center(
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFC60210),
          padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
        ),
        onPressed: () {
          print("Booking Data:");
          print({
            'roomId': selectedRoom,
            'title': _titleController.text,
            'startTime': startTime,
            'endTime': endTime,
            'attendees': attendees,
          });
          _resetForm();
        },
        child: const Text("Create Booking",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
      ),
    );
  }
}
