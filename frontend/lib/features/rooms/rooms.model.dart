
class Room {
  final String? id; // MongoDB _id, null when creating a new room
  final String name;
  final int capacity;
  final List<String> equipment;
  final DateTime? createdAt; // set by backend
  final DateTime? updatedAt; // set by backend

  Room({
    this.id,
    required this.name,
    required this.capacity,
    required this.equipment,
    this.createdAt,
    this.updatedAt,
  });

  /// Create Room from backend JSON (GET response)
  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['_id'],
      name: json['name'] ?? '',
      capacity: json['capacity'] ?? 0,
      equipment: List<String>.from(json['equipment'] ?? []),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  /// Convert to JSON for creating a new room (POST)
  Map<String, dynamic> toCreateJson() {
    return {
      'name': name,
      'capacity': capacity,
      'equipment': equipment,
    };
  }

  /// Convert to JSON for updating a room (PUT)
  Map<String, dynamic> toUpdateJson() {
    return {
      'name': name,
      'capacity': capacity,
      'equipment': equipment,
    };
  }
}
