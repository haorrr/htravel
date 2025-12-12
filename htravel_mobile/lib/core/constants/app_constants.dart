/// App Constants
/// Contains application-wide configuration values
class AppConstants {
  // App Info
  static const String appName = 'HTravel';
  static const String appDescription = 'Khám phá Việt Nam';
  static const String appVersion = '1.0.0';

  // Pagination
  static const int defaultPageSize = 10;
  static const int maxPageSize = 100;

  // Image Upload
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB
  static const int imageQuality = 85; // 0-100
  static const int maxImageWidth = 1024;
  static const int maxImageHeight = 1024;

  // Supported Image Formats
  static const List<String> supportedImageFormats = [
    'jpg',
    'jpeg',
    'png',
  ];

  // Cache Duration
  static const Duration cacheValidDuration = Duration(hours: 24);

  // Vietnamese Locale
  static const String defaultLocale = 'vi';
  static const String defaultCountryCode = 'VN';

  // Vietnam Center Coordinates (for maps)
  static const double vietnamCenterLat = 16.0544;
  static const double vietnamCenterLng = 108.2022;
  static const double defaultMapZoom = 6.0;

  // Animation Duration
  static const Duration defaultAnimationDuration = Duration(milliseconds: 300);
  static const Duration splashDuration = Duration(seconds: 2);
}
