import 'package:flutter/material.dart';
import 'package:rms/features/auth/providers/auth.provider.dart';
import 'package:rms/features/bookings/models/bookings.model.dart';
import 'package:rms/features/bookings/services/book_room.service.dart';
import 'package:provider/provider.dart';

class BookRoomViewModel extends ChangeNotifier {
  /// Form state
  String? selectedRoom;
  DateTime? startTime;
  DateTime? endTime;
  final List<Map<String, String>> attendees = [];

  final TextEditingController titleController = TextEditingController();
  final TextEditingController attendeeNameController = TextEditingController();
  final TextEditingController attendeeEmailController = TextEditingController();

  /// Validation errors
  String? roomError;
  String? titleError;
  String? timeError;
  String? attendeeError;

  /// Dispose controllers
  void disposeControllers() {
    titleController.dispose();
    attendeeNameController.dispose();
    attendeeEmailController.dispose();
  }

  final BookingService _service = BookingService();

  Future<void> createBooking(BuildContext context) async {
    if (!validateForm()) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final token = auth.authData?.token ?? "";

    final Map<String, String> roomMap = {
      "Board Room": "68c14c4ef7b6835c097f139e", // put actual MongoDB ID here
      "Conference Room":
          "68c14c66f7b6835c097f13a1", // put actual MongoDB ID here
    };

    final booking = Booking(
      roomId: roomMap[selectedRoom]!,
      title: titleController.text.trim(),
      startTime: startTime!,
      endTime: endTime!,
      attendees:
          attendees
              .map((a) => Attendee(name: a['name']!, email: a['email']!))
              .toList(),
    );

    debugPrint(
      "\n\n\nCreated booking: ${booking.roomId},${booking.title},${booking.startTime},${booking.endTime},${booking.attendees},",
    );

    try {
      final createdBooking = await _service.createBooking(booking, token);

      // show success snackbar
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Booking created successfully")),
      );

      debugPrint("Created booking: ${createdBooking.id}");

      Navigator.pop(context, createdBooking); // return to list page
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Error: $e")));
    }
  }

  /// Add attendee
  void addAttendee() {
    final name = attendeeNameController.text.trim();
    final email = attendeeEmailController.text.trim();

    // Validate inputs
    if (name.isEmpty && email.isEmpty) {
      attendeeError = "Name and Email are required";
    } else if (name.isEmpty) {
      attendeeError = "Name is required";
    } else if (email.isEmpty) {
      attendeeError = "Email is required";
    } else if (!_isValidEmail(email)) {
      attendeeError = "Invalid email format";
    } else {
      // valid input, add attendee
      attendees.add({'name': name, 'email': email});
      attendeeNameController.clear();
      attendeeEmailController.clear();
      attendeeError = null; // clear previous errors
    }
    notifyListeners();
  }

  /// Remove attendee
  void removeAttendee(int index) {
    attendees.removeAt(index);
    notifyListeners();
  }

  /// --- VALIDATION ---
  String? validateRoom() {
    if (selectedRoom == null) return "Room is required";

    final validRooms = ["Board Room", "Conference Room"]; // keys of your map
    if (!validRooms.contains(selectedRoom)) {
      return "Invalid room selected";
    }
    return null;
  }

  String? validateTitle() {
    final title = titleController.text.trim();
    if (title.isNotEmpty && title.length < 2) {
      return "Title too short";
    }
    return null;
  }

  String? validateTimes() {
    if (startTime == null || endTime == null)
      return "Start and End time are required";

    final now = DateTime.now();

    if (startTime!.isBefore(now)) return "Start time cannot be in the past";

    if (endTime!.isBefore(startTime!))
      return "End time must be after start time";

    if (startTime!.day != endTime!.day ||
        startTime!.month != endTime!.month ||
        startTime!.year != endTime!.year)
      return "Start and End must be on the same day";

    final startLimit = DateTime(
      startTime!.year,
      startTime!.month,
      startTime!.day,
      8,
      0,
    );
    final endLimit = DateTime(
      endTime!.year,
      endTime!.month,
      endTime!.day,
      20,
      0,
    );

    if (startTime!.isBefore(startLimit)) return "Start time must be after 8:00 AM";
    if (endTime!.isAfter(endLimit)) return "End time must be before 8:00 PM";

    final diffMinutes = endTime!.difference(startTime!).inMinutes;
    if (diffMinutes < 10) return "Minimum duration is 10 minutes";
    if (diffMinutes > 240) return "Maximum duration is 4 hours";

    return null;
  }

  String? validateAttendees() {
    // Check current typed fields
    final currentName = attendeeNameController.text.trim();
    final currentEmail = attendeeEmailController.text.trim();

    if ((currentName.isNotEmpty && currentEmail.isEmpty) ||
        (currentName.isEmpty && currentEmail.isNotEmpty)) {
      return "Both name and email must be filled for new attendee";
    }
    if (currentName.isNotEmpty && !_isValidEmail(currentEmail)) {
      return "Invalid email format for new attendee";
    }

    // Check added attendees
    for (final a in attendees) {
      if (a['name']!.isEmpty || !_isValidEmail(a['email']!)) {
        return "Invalid attendee: name and valid email required";
      }
    }
    return null; // all good
  }

  /// Run all validations
  bool validateForm() {
    roomError = validateRoom();
    titleError = validateTitle();
    timeError = validateTimes();
    attendeeError = validateAttendees();

    notifyListeners(); // important to refresh UI

    if ([
      roomError,
      titleError,
      timeError,
      attendeeError,
    ].any((e) => e != null)) {
      debugPrint("Validation failed:");
      debugPrint("Room: $roomError");
      debugPrint("Title: $titleError");
      debugPrint("Times: $timeError");
      debugPrint("Attendees: $attendeeError");
      return false;
    }
    return true;
  }

  /// On submit
  // void createBooking() {
  //   if (!validateForm()) return;

  //   final bookingData = {
  //     'roomId': selectedRoom,
  //     'title': titleController.text.trim(),
  //     'startTime': startTime!.toIso8601String(),
  //     'endTime': endTime!.toIso8601String(),
  //     'attendees': attendees,
  //   };

  //   debugPrint("Booking Created:");
  //   debugPrint(bookingData.toString());

  //   // resetForm();
  // }

  /// --- Helpers ---
  bool _isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
    return emailRegex.hasMatch(email);
  }
}
