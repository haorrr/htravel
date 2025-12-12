import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';
import '../constants/api_constants.dart';
import '../constants/storage_constants.dart';

/// Dio Client
/// Handles HTTP requests with interceptors for authentication and logging
class DioClient {
  late final Dio _dio;
  final FlutterSecureStorage _secureStorage;
  final Logger _logger = Logger();

  DioClient(this._secureStorage) {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout:
            const Duration(milliseconds: ApiConstants.connectTimeout),
        receiveTimeout:
            const Duration(milliseconds: ApiConstants.receiveTimeout),
        sendTimeout: const Duration(milliseconds: ApiConstants.sendTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      _authInterceptor(),
      _loggerInterceptor(),
      _errorInterceptor(),
    ]);
  }

  Dio get dio => _dio;

  /// Auth Interceptor - Add JWT token to requests
  InterceptorsWrapper _authInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Skip token for public endpoints
        if (_isPublicEndpoint(options.path)) {
          return handler.next(options);
        }

        final token =
            await _secureStorage.read(key: StorageConstants.accessToken);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    );
  }

  /// Logger Interceptor - Log requests & responses
  InterceptorsWrapper _loggerInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        _logger.d('REQUEST[${options.method}] => PATH: ${options.path}');
        _logger.d('Headers: ${options.headers}');
        if (options.data != null) {
          _logger.d('Data: ${options.data}');
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        _logger.i(
          'RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}',
        );
        _logger.i('Data: ${response.data}');
        return handler.next(response);
      },
      onError: (error, handler) {
        _logger.e(
          'ERROR[${error.response?.statusCode}] => PATH: ${error.requestOptions.path}',
        );
        _logger.e('Error: ${error.message}');
        return handler.next(error);
      },
    );
  }

  /// Error Interceptor - Handle token refresh
  InterceptorsWrapper _errorInterceptor() {
    return InterceptorsWrapper(
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          // Token expired - try to refresh
          _logger.w('Token expired, attempting refresh...');

          try {
            final refreshToken =
                await _secureStorage.read(key: StorageConstants.refreshToken);
            if (refreshToken == null) {
              _logger.e('No refresh token available');
              return handler.reject(error);
            }

            // Call refresh endpoint
            final response = await _dio.post(
              ApiConstants.refresh,
              data: {'refreshToken': refreshToken},
            );

            // Store new token
            final newAccessToken = response.data['accessToken'];
            await _secureStorage.write(
              key: StorageConstants.accessToken,
              value: newAccessToken,
            );

            // Retry original request with new token
            error.requestOptions.headers['Authorization'] =
                'Bearer $newAccessToken';
            final clonedRequest = await _dio.fetch(error.requestOptions);
            return handler.resolve(clonedRequest);
          } catch (e) {
            _logger.e('Token refresh failed: $e');
            // Clear tokens and redirect to login
            await _secureStorage.deleteAll();
            return handler.reject(error);
          }
        }
        return handler.next(error);
      },
    );
  }

  bool _isPublicEndpoint(String path) {
    return path.contains('/auth/login') ||
        path.contains('/auth/register') ||
        path.contains('/articles');
  }
}
