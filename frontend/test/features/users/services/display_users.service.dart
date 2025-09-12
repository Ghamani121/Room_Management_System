import 'package:flutter_test/flutter_test.dart';
import 'package:http_mock_adapter/http_mock_adapter.dart';
import 'package:dio/dio.dart';


void main() {
  final dio = Dio(); // Initialize Dio HTTP client
  final dioAdapter = DioAdapter(dio: dio);

group('API Tests', () {
    test('fetches data successfully', () async {
      // Simulate a successful response
      dioAdapter.onGet(
        '/api/data',
        (server) => server.reply(200, {'data': 'Test data'}),
      );
      final response = await dio.get('/api/data');
      expect(response.statusCode, 200);
      expect(response.data['data'], 'Test data');
    });
    test('handles error response', () async {
      dioAdapter.onGet(
        '/api/data',
        (server) => server.reply(404, {'error': 'Data not found'}),
      );
      try {
        await dio.get('/api/data');
      }on DioException catch (e) {
        expect(e.response?.statusCode, 404);
      }
    });
  });
}

