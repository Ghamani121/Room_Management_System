// lib/features/auth/providers/auth_provider.dart
import 'package:flutter/material.dart';
import '../login.model.dart';
import 'package:rms/features/auth/services/login.service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  final LoginService _service = LoginService();

  Welcome? _authData;
  Welcome? get authData => _authData;

  bool get isLoggedIn => _authData != null;

  Auth Provider() {
    _loadTokenOnStart();
  }

  Future<void> _loadTokenOnStart()
  {
    final prefs=await SharedPreferences.getInstance();
    final savedToken= prefs.getString('auth_token');

    if(savedToken!= null && savedToken.isNotEmpty)
    {
      
    }
  }
  Future<bool> login(String email, String password) async {
    try {
      final result = await _service.login(email, password);
      _authData = result;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint("Auth login failed: $e");
      return false;
    }
  }

  void logout() {
    _authData = null;
    notifyListeners();
  }
}
