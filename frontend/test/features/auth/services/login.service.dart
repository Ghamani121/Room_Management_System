import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:rms/features/auth/services/login.service.dart';
import 'package:rms/features/auth/login.model.dart';

void main() {
  group('LoginService', () {
    test('returns Welcome on 200 and sends correct body', () async {
      final mockClient = MockClient((http.Request request) async {
        expect(request.method, 'POST');
        expect(request.url.path.endsWith('/auth/v1/login'), true);////

        final body = jsonDecode(request.body) as Map<String, dynamic>;
        expect(body['email'], 'test@example.com');
        expect(body['password'], 'password123');

        final responseJson = {
          "message": "Login Successful",
          "token": "<jwt>",
          "user": {
            "id": "68b963f5de52982b994a7253",
            "name": "ghamani",
            "email": "ghamani121@gmail.com",
            "role": "admin"
          }
        };

        return http.Response(
          jsonEncode(responseJson),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final service = LoginService(client: mockClient);

      final result = await service.login('test@example.com', 'password123');

      expect(result, isA<Welcome>());
      expect(result.message, 'Login Successful'); // ✅ fixed case
      expect(result.token, isNotEmpty);
      expect(result.user?.id, "68b963f5de52982b994a7253");
      expect(result.user?.name, 'ghamani');
      expect(result.user?.email, 'ghamani121@gmail.com');
      expect(result.user?.role, 'admin');
    });

    test('sends Authorization header when token provided', () async {
      final mockClient = MockClient((http.Request request) async {
        final authHeader =
            request.headers['authorization'] ??
            request.headers['Authorization'];
        expect(authHeader, 'Bearer my-token');

        final responseJson = {
          "message": "Login Successful",
          "token": "<jwt>",
          "user": {
            "id": "68b963f5de52982b994a7253",
            "name": "ghamani",
            "email": "ghamani121@gmail.com",
            "role": "admin",
          },
        };

        return http.Response(
          jsonEncode(responseJson),
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final service = LoginService(client: mockClient, token: 'my-token');

      final result = await service.login('token@example.com', 'pw');
      expect(result, isA<Welcome>());
      expect(result.user?.name, 'ghamani'); // ✅ fixed
      expect(result.user?.email, 'ghamani121@gmail.com');
    });

    test('throws Exception on non-200 status', () async {
      final mockClient = MockClient((http.Request request) async {
        return http.Response('Unauthorized', 401);
      });

      final service = LoginService(client: mockClient);

      expect(() async => await service.login('x', 'y'), throwsException);
    });

    test('rethrows JSON parse error as FormatException', () async {
      final mockClient = MockClient((http.Request request) async {
        return http.Response(
          'not a json',
          200,
          headers: {'content-type': 'application/json'},
        );
      });

      final service = LoginService(client: mockClient);

      expect(
        () async => await service.login('a', 'b'),
        throwsA(isA<FormatException>()),
      );
    });

    test('rethrows client/network exceptions', () async {
      final mockClient = MockClient((http.Request request) async {
        throw http.ClientException('failed to connect');
      });

      final service = LoginService(client: mockClient);

      expect(
        () async => await service.login('a', 'b'),
        throwsA(isA<http.ClientException>()),
      );
    });
  });
}
///