import 'package:flutter/material.dart';
import 'package:rms/features/bookings/viewmodels/dashboard.viewmodel.dart';
import 'package:rms/features/bookings/views/book_room.view.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  DashboardViewModel viewModel = DashboardViewModel();

  @override
  // void dispose() {
  //   viewModel.disposeControllers();
  //   super.dispose();
  // }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Dashboard",
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
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
                children: [const SizedBox(height: 20)],
              ),
            ),
          ),
        ),
      ),
      floatingActionButton: _buildAddBooking(),
    );
  }

  Widget _buildAddBooking() {
    return FloatingActionButton(
      backgroundColor: const Color(0xFFC60210),
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const BookRoomView()),
        );
      },
      child: const Icon(Icons.add,color: Colors.white),
    );
  }
}
