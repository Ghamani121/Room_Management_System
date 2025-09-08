import 'package:flutter/material.dart';
import 'package:rms/features/users/viewmodels/create_user.viewmodel.dart';


class CreateUserView extends StatefulWidget {
  const CreateUserView({super.key});

  @override
  State<CreateUserView> createState() => _CreateUserViewState();
}

class _CreateUserViewState extends State<CreateUserView> {
  CreateUserViewModel viewModel = CreateUserViewModel(); // initialized immediately

  @override
  void dispose() {
    viewModel.disposeControllers();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Create User",
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
                  _buildNameField(),
                  const SizedBox(height: 20),
                  _buildEmailField(),
                  const SizedBox(height: 20),
                  _buildRoleDropdown(),
                  const SizedBox(height: 35),
                  _buildCreateUserButton(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleDropdown() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Role", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        DropdownButtonFormField<String>(
          value: viewModel.role,
          isExpanded: true,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            errorText: viewModel.roleError,
          ),
          hint: const Text("Select Role"),
          dropdownColor: Colors.white,
          items: const [
            DropdownMenuItem(value: "admin", child: Text("Admin")),
            DropdownMenuItem(value: "employee", child: Text("Employee")),
          ],
          onChanged: (value) => setState(() => viewModel.role = value),
        ),
      ],
    );
  }

  Widget _buildNameField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Name", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: viewModel.nameController,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            hintText: "Enter name",
            errorText: viewModel.nameError, // <-- show error
          ),
        ),
      ],
    );
  }

    Widget _buildEmailField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Email", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: viewModel.emailController,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            hintText: "Enter email",
            errorText: viewModel.emailError, // <-- show error
          ),
        ),
      ],
    );
  }


  Widget _buildCreateUserButton() {
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
          await viewModel.createUser(context);
          setState(() {}); // if you need UI refresh afterwards
        },

        child: const Text(
          "Create User",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }
}