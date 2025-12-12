/// Custom Exceptions
class ServerException implements Exception {
  final String message;
  ServerException([this.message = 'Lỗi máy chủ']);
}

class NetworkException implements Exception {
  final String message;
  NetworkException([this.message = 'Lỗi kết nối mạng']);
}

class UnauthorizedException implements Exception {
  final String message;
  UnauthorizedException([this.message = 'Phiên đăng nhập hết hạn']);
}

class NotFoundException implements Exception {
  final String message;
  NotFoundException([this.message = 'Không tìm thấy']);
}

class CacheException implements Exception {
  final String message;
  CacheException([this.message = 'Lỗi bộ nhớ cache']);
}
