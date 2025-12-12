/// API Constants
/// Contains all API endpoints and network configuration
class ApiConstants {
  // Base URL Configuration
  // Android Emulator: use 10.0.2.2 instead of localhost
  // iOS Simulator: use localhost
  // Physical Device: use your computer's IP address
  static const String baseUrl = 'http://10.0.2.2:3000'; // Android emulator
  // static const String baseUrl = 'http://localhost:3000'; // iOS simulator
  // static const String baseUrl = 'http://192.168.1.100:3000'; // Physical device
  // static const String baseUrl = 'https://api.htravel.com'; // Production

  // Auth Endpoints
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String refresh = '/api/auth/refresh';

  // User Endpoints
  static const String profile = '/api/user/profile';

  // AI Endpoints
  static const String identifyLandmark = '/api/ai/identify-landmark';
  static const String virtualTravel = '/api/ai/virtual-travel';
  static const String virtualTravelHistory = '/api/ai/virtual-travel/history';
  static const String aiStatus = '/api/ai/status';

  // Check-in Endpoints
  static const String checkIn = '/api/user/check-in';
  static const String checkIns = '/api/user/check-ins';
  static const String mapHistory = '/api/user/map-history';
  static const String checkInStats = '/api/user/check-in-stats';

  // Article Endpoints
  static const String articles = '/api/articles';

  // Planner Endpoints
  static const String plannerGenerate = '/api/planner/generate';
  static const String plannerSave = '/api/planner/save';
  static const String myTrips = '/api/planner/my-trips';
  static const String trips = '/api/planner/trips';

  // Places Endpoints
  static const String placesSearch = '/api/places/search';
  static const String placesNearby = '/api/places/nearby';
  static const String placesDetails = '/api/places/details';
  static const String placesTypes = '/api/places/types';

  // Network Configuration
  static const int connectTimeout = 30000; // 30 seconds
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;
}
