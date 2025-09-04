import 'dart:convert';
import 'package:http/http.dart' as http;

class ConfigService {
  static String baseUrl = "http://localhost:5000/api"; // fallback

  /// Fetch the baseUrl from backend
  static Future<void> loadConfig() async {
    try {
      final response = await http.get(Uri.parse('https://9971226c3d1f.ngrok-free.app/config'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        baseUrl = data['baseUrl'];
        print("Loaded baseUrl: $baseUrl");
      } else {
        print("Failed to fetch config: ${response.statusCode}");
      }
    } catch (e) {
      print("Error loading config: $e");
    }
  }
}
