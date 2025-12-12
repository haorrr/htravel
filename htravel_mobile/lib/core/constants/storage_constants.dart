/// Storage Constants
/// Contains keys for secure storage and shared preferences
class StorageConstants {
  // Secure Storage Keys (for sensitive data like tokens)
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';

  // Shared Preferences Keys
  static const String isFirstLaunch = 'is_first_launch';
  static const String language = 'language';
  static const String themeMode = 'theme_mode';
  static const String userId = 'user_id';
  static const String userEmail = 'user_email';

  // Hive Box Names (for local caching)
  static const String articlesBox = 'articles';
  static const String checkInsBox = 'check_ins';
  static const String tripsBox = 'trips';
  static const String userBox = 'user';
  static const String settingsBox = 'settings';
}
