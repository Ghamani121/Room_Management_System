import 'package:flutter/material.dart';
import 'package:rms/features/bookings/viewmodels/book_room.viewmodel.dart';


class BookRoomView extends StatefulWidget {
  const BookRoomView({super.key});

  @override
  State<BookRoomView> createState() => _BookRoomViewState();
}

class _BookRoomViewState extends State<BookRoomView> {
  BookRoomViewModel viewModel = BookRoomViewModel(); // initialized immediately

  @override
  void dispose() {
    viewModel.disposeControllers();
    super.dispose();
  }

  Future<void> _pickStartTime() async {
    final DateTime? date = await showDatePicker(
      context: context,
      initialDate: viewModel.startTime ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (date == null) return;

    final TimeOfDay? time = await showTimePicker(
      context: context,
      initialTime: viewModel.startTime != null
          ? TimeOfDay.fromDateTime(viewModel.startTime!)
          : TimeOfDay.now(),
    );
    if (time == null) return;

    setState(() {
      viewModel.startTime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
    });
  }

  Future<void> _pickEndTime() async {
    final DateTime? date = await showDatePicker(
      context: context,
      initialDate: viewModel.endTime ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (date == null) return;

    final TimeOfDay? time = await showTimePicker(
      context: context,
      initialTime: viewModel.endTime != null
          ? TimeOfDay.fromDateTime(viewModel.endTime!)
          : TimeOfDay.now(),
    );
    if (time == null) return;

    setState(() {
      viewModel.endTime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
    });
  }

  // void _addAttendee() => setState(() => viewModel.addAttendee());
  // void _removeAttendee(int index) => setState(() => viewModel.removeAttendee(index));

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
        iconTheme: const IconThemeData(color: Colors.white),
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
                  const SizedBox(height: 20),
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
          value: viewModel.selectedRoom,
          isExpanded: true,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            errorText: viewModel.roomError, // <-- show error
          ),
          hint: const Text("Select Room"),
          dropdownColor: Colors.white,
          items: const [
            DropdownMenuItem(value: "room1_id", child: Text("Bhishma")),
            DropdownMenuItem(value: "room2_id", child: Text("Ajeya")),
          ],
          onChanged: (value) => setState(() => viewModel.selectedRoom = value),
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
          controller: viewModel.titleController,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            hintText: "Enter title",
            errorText: viewModel.titleError, // <-- show error
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
                  hintText: viewModel.startTime != null
                      ? viewModel.startTime.toString()
                      : "Select start time",
                  errorText: viewModel.timeError, // <-- show error
                  errorMaxLines: 2,
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
                  hintText: viewModel.endTime != null
                      ? viewModel.endTime.toString()
                      : "Select end time",
                  errorText: viewModel.timeError, // <-- show error
                  errorMaxLines: 2,
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
        const Text("Attendees (Optional)", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (viewModel.attendees.isNotEmpty)
          Column(
            children: List.generate(viewModel.attendees.length, (index) {
              final attendee = viewModel.attendees[index];
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        key: ValueKey(attendee.email),
                        readOnly: true,          
                        initialValue: attendee.name,
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
                        key: ValueKey("${attendee.email ?? 'unknown'}_email"),
                        readOnly: true,
                        initialValue: attendee.email,
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
                      onPressed: () => setState(() => viewModel.removeAttendee(index)),
                    ),
                  ],
                ),
              );
            }),
          ),
          if (viewModel.attendeeError != null)
            Padding(
              padding: const EdgeInsets.only(top: 5),
              child: Text(
                viewModel.attendeeError!,
                style: const TextStyle(color: Colors.red, fontSize: 14),
              ),
            ),

        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: viewModel.attendeeNameController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: "Name",
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextFormField(
                controller: viewModel.attendeeEmailController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: "Email",
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.add_circle_outline, color: Colors.green),
              onPressed: () => setState(() => viewModel.addAttendee()),
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
          final booking = viewModel.createBooking();
          if (booking != null) {
            Navigator.pop(context, booking); // send back to Dashboard
          } else {
            setState(() {}); // refresh UI to show validation errors
          }
        },
        child: const Text(
          "Create Booking",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }
}
