import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:rms/features/users/models/users.model.dart';

class UserDetailsView extends StatelessWidget {
  final User user;
  static const Color primaryRed = Color(0xFFC60210);

  const UserDetailsView({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "User Details",
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
                      NameSection(name: user.name),
                      const SizedBox(height: 16),
                      EmailSection(email: user.email),
                      const SizedBox(height: 16),
                      RoleSection(role: user.role),
                      const SizedBox(height: 16),
                      CreatedAtSection(date: user.createdAt),
                      const SizedBox(height: 16),
                      UpdatedAtSection(date: user.updatedAt),
                      const SizedBox(height: 30),
                      const RemoveUserButton(),
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

/// Name Widget
class NameSection extends StatelessWidget {
  final String? name;
  const NameSection({super.key, this.name});

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

/// Email Widget
class EmailSection extends StatelessWidget {
  final String? email;
  const EmailSection({super.key, this.email});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.email, color: UserDetailsView.primaryRed),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            email ?? "-",
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}

/// Role Widget
class RoleSection extends StatelessWidget {
  final String role;
  const RoleSection({super.key, required this.role});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.security, color: UserDetailsView.primaryRed),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            role,
            style: const TextStyle(fontSize: 16, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}

/// Created At Widget
class CreatedAtSection extends StatelessWidget {
  final DateTime? date;
  const CreatedAtSection({super.key, this.date});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('dd MMM yyyy, hh:mm a');
    return Row(
      children: [
        const Icon(Icons.calendar_today, color: UserDetailsView.primaryRed),
        const SizedBox(width: 12),
        Text(
          date != null ? formatter.format(date!) : "-",
          style: const TextStyle(fontSize: 16, color: Colors.black87),
        ),
      ],
    );
  }
}

/// Updated At Widget
class UpdatedAtSection extends StatelessWidget {
  final DateTime? date;
  const UpdatedAtSection({super.key, this.date});

  @override
  Widget build(BuildContext context) {
    final DateFormat formatter = DateFormat('dd MMM yyyy, hh:mm a');
    return Row(
      children: [
        const Icon(Icons.update, color: UserDetailsView.primaryRed),
        const SizedBox(width: 12),
        Text(
          date != null ? formatter.format(date!) : "-",
          style: const TextStyle(fontSize: 16, color: Colors.black87),
        ),
      ],
    );
  }
}

/// Remove User Button
class RemoveUserButton extends StatelessWidget {
  const RemoveUserButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: UserDetailsView.primaryRed,
          padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(30),
          ),
          elevation: 3,
        ),
        onPressed: () {
          // TODO: add remove user logic here
        },
        child: const Text(
          "Remove User",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
