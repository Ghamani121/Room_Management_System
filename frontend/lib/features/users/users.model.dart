// To parse this JSON data, do
//
//     final user = userFromJson(jsonString);

import 'dart:convert';

User userFromJson(String str) => User.fromJson(json.decode(str));

// String userToJson(User data) => json.encode(data.toJson());

class User {
    String name;
    String email;
    String role;
    String id;
    DateTime createdAt;
    DateTime updatedAt;
    int v;

    User({
        required this.name,
        required this.email,
        required this.role,
        required this.id,
        required this.createdAt,
        required this.updatedAt,
        required this.v,
    });

    factory User.fromJson(Map<String, dynamic> json) => User(
        name: json["name"],
        email: json["email"],
        role: json["role"],
        id: json["_id"],
        createdAt: DateTime.parse(json["createdAt"]),
        updatedAt: DateTime.parse(json["updatedAt"]),
        v: json["__v"],
    );

    // Map<String, dynamic> toJson() => {
    //     "name": name,
    //     "email": email,
    //     "role": role,
    //     "_id": id,
    //     "createdAt": createdAt.toIso8601String(),
    //     "updatedAt": updatedAt.toIso8601String(),
    //     "__v": v,
    // };
}
