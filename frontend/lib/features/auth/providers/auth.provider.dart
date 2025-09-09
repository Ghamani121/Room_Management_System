// lib/features/auth/providers/auth_provider.dart
import 'package:flutter/material.dart';
import '../login.model.dart';
import 'package:rms/features/auth/services/login.service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AuthProvider extends ChangeNotifier {
  final LoginService _service = LoginService();

  Welcome? _authData;

  Welcome? get authData => _authData;
  String? get role => _authData?.user?.role;
  String? get id => _authData?.user?.id;
  bool get isLoggedIn => _authData != null;

  AuthProvider() {
    _loadTokenOnStart();
  }

  Future<void> _loadTokenOnStart() async {
    final prefs = await SharedPreferences.getInstance();
    final savedToken = prefs.getString('auth_token');
    final savedUserJson = prefs.getString('auth_user');

    if (savedToken != null && savedToken.isNotEmpty && savedUserJson != null) {
      _authData = Welcome(
        token: savedToken,
        user: User.fromJson(json.decode(savedUserJson)),
      );
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      final result = await _service.login(email, password);
      _authData = result;

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', result.token ?? "");
      await prefs.setString('auth_user', json.encode(result.user?.toJson()));

      notifyListeners();

      return true;
    } catch (e) {
      debugPrint("Auth login failed: $e");
      return false;
    }
  }

  Future<void> logout() async {
    _authData = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_role');
    await prefs.remove('auth_id');

    notifyListeners();
  }
}
