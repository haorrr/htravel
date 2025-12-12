import 'package:equatable/equatable.dart';

/// Failure Base Class
abstract class Failure extends Equatable {
  final String message;

  const Failure(this.message);

  @override
  List<Object> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Lỗi máy chủ']);
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'Lỗi kết nối mạng']);
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([super.message = 'Phiên đăng nhập hết hạn']);
}

class NotFoundFailure extends Failure {
  const NotFoundFailure([super.message = 'Không tìm thấy']);
}

class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Lỗi bộ nhớ cache']);
}

class UnknownFailure extends Failure {
  const UnknownFailure([super.message = 'Lỗi không xác định']);
}
