import 'package:flutter/material.dart';
import 'package:rms/features/auth/viewmodels/login.viewmodel.dart';

//we are creating a custom widget for login ui which extends stateful widget
//we can use mehtods from parent widget, we can ensure the given method exists usng overrride
//it validates that tht method exists in the parent class
//super.key= we pass the key of the widget to the parents class to optmise widget reuse
class LoginView extends StatefulWidget {
  //constuctor of logic view, it says that the widget can be constant to build durng compile time
  const LoginView({super.key});

  @override
  //create method to hold state(mutable data)
  //_ = means that the state is private, exists only in this file
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  LoginViewModel viewModel = LoginViewModel();

  @override
  void dispose() {
    viewModel.disposeControllers();
    super.dispose();
  }

  @override
  //Buildcontext gives context of where in the widget tree, the widget exists
  //we can now find neareset items, eg, nearest theme acc to our context
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text(
          "Login",
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, //align to the left
              children: [
                const SizedBox(height: 20),
                _buildEmailSection(),
                const SizedBox(height: 20),
                _buildPasswordSection()],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmailSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Email",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        TextFormField(
          controller: viewModel.emailController,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            hintText: "Enter email"),
          validator:viewModel.validateEmail
          ),
      ],
    );
  }


  Widget _buildPasswordSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Password",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 10),
        TextFormField(
          controller: viewModel.passwordController,
          decoration: InputDecoration(
            border: const OutlineInputBorder(),
            hintText: "Enter temporary password",
          ),
          obscureText: true,
          validator: viewModel.validatePassword),
      ],
    );
  }

Widget _buildLoginButton() {
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
          setState(() => viewModel.login());
        },
        child: const Text(
          "Login",
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }


}
