import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/storage_constants.dart';
import '../../core/network/dio_client.dart';
import '../../data/models/auth_response_model.dart';
import 'auth_state.dart';

/// Secure Storage Provider
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
});

/// Dio Client Provider
final dioClientProvider = Provider<DioClient>((ref) {
  final secureStorage = ref.watch(secureStorageProvider);
  return DioClient(secureStorage);
});

/// Auth State Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final DioClient _dioClient;
  final FlutterSecureStorage _secureStorage;

  AuthNotifier(this._dioClient, this._secureStorage)
      : super(const AuthState.initial());

  /// Check if user is authenticated
  Future<void> checkAuthStatus() async {
    try {
      final accessToken =
          await _secureStorage.read(key: StorageConstants.accessToken);

      if (accessToken != null && accessToken.isNotEmpty) {
        // TODO: Validate token and get user info
        // For now, set as unauthenticated
        state = const AuthState.unauthenticated();
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (e) {
      state = const AuthState.unauthenticated();
    }
  }

  /// Login with email and password
  Future<void> login(String email, String password) async {
    state = const AuthState.loading();

    try {
      final response = await _dioClient.dio.post(
        '/api/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponseModel.fromJson(response.data['data']);

        // Store tokens
        await _secureStorage.write(
          key: StorageConstants.accessToken,
          value: authResponse.accessToken,
        );
        await _secureStorage.write(
          key: StorageConstants.refreshToken,
          value: authResponse.refreshToken,
        );

        // Update state
        state = AuthState.authenticated(authResponse.user.toEntity());
      } else {
        state = const AuthState.error('Đăng nhập thất bại');
      }
    } catch (e) {
      state = AuthState.error('Lỗi: ${e.toString()}');
    }
  }

  /// Register new user
  Future<void> register({
    required String email,
    required String password,
    required String name,
  }) async {
    state = const AuthState.loading();

    try {
      final response = await _dioClient.dio.post(
        '/api/auth/register',
        data: {
          'email': email,
          'password': password,
          'name': name,
        },
      );

      if (response.statusCode == 201) {
        final authResponse = AuthResponseModel.fromJson(response.data['data']);

        // Store tokens
        await _secureStorage.write(
          key: StorageConstants.accessToken,
          value: authResponse.accessToken,
        );
        await _secureStorage.write(
          key: StorageConstants.refreshToken,
          value: authResponse.refreshToken,
        );

        // Update state
        state = AuthState.authenticated(authResponse.user.toEntity());
      } else {
        state = const AuthState.error('Đăng ký thất bại');
      }
    } catch (e) {
      state = AuthState.error('Lỗi: ${e.toString()}');
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      // Clear tokens
      await _secureStorage.delete(key: StorageConstants.accessToken);
      await _secureStorage.delete(key: StorageConstants.refreshToken);

      // Update state
      state = const AuthState.unauthenticated();
    } catch (e) {
      state = AuthState.error('Lỗi đăng xuất: ${e.toString()}');
    }
  }
}

/// Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  final secureStorage = ref.watch(secureStorageProvider);
  return AuthNotifier(dioClient, secureStorage);
});
