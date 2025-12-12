import 'package:equatable/equatable.dart';

/// User Entity
/// Business logic representation of a user
class User extends Equatable {
  final int id;
  final String email;
  final String name;
  final String? avatarUrl;
  final String? bio;
  final bool isAdmin;
  final DateTime createdAt;

  const User({
    required this.id,
    required this.email,
    required this.name,
    this.avatarUrl,
    this.bio,
    required this.isAdmin,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        email,
        name,
        avatarUrl,
        bio,
        isAdmin,
        createdAt,
      ];
}
