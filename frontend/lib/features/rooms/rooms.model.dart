class Room {
  final String name;
  final int capacity;
  final List<String> equipment;

  Room({
    required this.name,
    required this.capacity,
    required this.equipment,
  });

//from json for fetching from api
  factory Room.fromJson(Map<String, dynamic> json)
  {
    return Room(
      name: json['name'] as String,
      capacity: json['capacity'] as int,
      equipment: List<String>.from(json['equipment'] ?? []),
    );
  }

//to json for sending api
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'capacity': capacity,
      'equipment': equipment,
    };
  }
}