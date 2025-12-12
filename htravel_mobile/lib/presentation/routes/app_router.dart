import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../pages/splash_page.dart';
import '../pages/auth/login_page.dart';
import '../pages/auth/register_page.dart';
import '../pages/home/home_page.dart';
import '../providers/auth_provider.dart';
import '../providers/auth_state.dart';

/// Route Names
class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String profile = '/profile';
  static const String articleDetail = '/article/:id';
  static const String map = '/map';
  static const String aiFeatures = '/ai-features';
}

/// Router Provider
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: _GoRouterRefreshStream(ref),
    redirect: (context, state) {
      final isAuthenticated = authState is Authenticated;
      final isSplash = state.matchedLocation == AppRoutes.splash;
      final isLogin = state.matchedLocation == AppRoutes.login;
      final isRegister = state.matchedLocation == AppRoutes.register;

      // Allow splash page
      if (isSplash) return null;

      // If not authenticated, redirect to login
      if (!isAuthenticated && !isLogin && !isRegister) {
        return AppRoutes.login;
      }

      // If authenticated and on auth pages, redirect to home
      if (isAuthenticated && (isLogin || isRegister)) {
        return AppRoutes.home;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: AppRoutes.home,
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: AppRoutes.profile,
        name: 'profile',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Profile Page - To be implemented')),
        ),
      ),
      GoRoute(
        path: AppRoutes.map,
        name: 'map',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Map Page - To be implemented')),
        ),
      ),
      GoRoute(
        path: AppRoutes.aiFeatures,
        name: 'ai-features',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('AI Features Page - To be implemented')),
        ),
      ),
      GoRoute(
        path: AppRoutes.articleDetail,
        name: 'article-detail',
        builder: (context, state) {
          final id = state.pathParameters['id'];
          return Scaffold(
            body: Center(
              child: Text('Article Detail Page - ID: $id - To be implemented'),
            ),
          );
        },
      ),
    ],
  );
});

/// Router Refresh Notifier
/// This class listens to auth state changes and refreshes the router
class _GoRouterRefreshStream extends ChangeNotifier {
  _GoRouterRefreshStream(this._ref) {
    _ref.listen(
      authProvider,
      (_, __) => notifyListeners(),
    );
  }

  final Ref _ref;
}
