# 🐦 Flutter Cross-Platform Development

> **By [Tushar Aggarwal](https://www.linkedin.com/in/tusharaggarwalinseec/)** - *Build Beautiful Apps for iOS, Android, Web, and Desktop*
> 
> 🔗 **Connect**: [LinkedIn](https://www.linkedin.com/in/tusharaggarwalinseec/) | Follow for Flutter insights and best practices

---

## Overview

Flutter enables building natively compiled applications from a single codebase. This guide covers **Flutter development**, **Dart language mastery**, **widget architecture**, **state management**, and **Context Engineering** methodology for cross-platform excellence.

## 🚀 Flutter Project Setup

### Modern Flutter Setup

```bash
# Install Flutter SDK
flutter doctor

# Create new project
flutter create my_app --platforms ios,android,web,macos,windows,linux

# Run on different platforms
flutter run -d chrome        # Web
flutter run -d macos         # macOS
flutter run -d ios           # iOS Simulator
flutter run -d android       # Android Emulator
```

### Essential Dependencies

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_riverpod: ^2.4.0
  
  # Navigation
  go_router: ^10.0.0
  
  # Networking
  dio: ^5.3.0
  
  # Storage
  hive_flutter: ^1.1.0
  
  # UI Components
  flutter_hooks: ^0.20.0
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: ^2.4.6
  freezed: ^2.4.5
  json_serializable: ^6.7.1
```

## 🎨 Widget Architecture

### Custom Button Component

```dart
enum ButtonVariant { primary, secondary, outline }
enum ButtonSize { small, medium, large }

class CustomButton extends StatelessWidget {
  const CustomButton({
    super.key,
    required this.onPressed,
    required this.child,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.loading = false,
    this.disabled = false,
  });

  final VoidCallback? onPressed;
  final Widget child;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool loading;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    final sizeConfig = switch (size) {
      ButtonSize.small => (height: 32.0, padding: 12.0, fontSize: 14.0),
      ButtonSize.medium => (height: 44.0, padding: 16.0, fontSize: 16.0),
      ButtonSize.large => (height: 56.0, padding: 20.0, fontSize: 18.0),
    };

    final colors = switch (variant) {
      ButtonVariant.primary => (
        background: colorScheme.primary,
        foreground: colorScheme.onPrimary,
      ),
      ButtonVariant.secondary => (
        background: colorScheme.secondary,
        foreground: colorScheme.onSecondary,
      ),
      ButtonVariant.outline => (
        background: Colors.transparent,
        foreground: colorScheme.primary,
      ),
    };

    return SizedBox(
      height: sizeConfig.height,
      child: ElevatedButton(
        onPressed: (disabled || loading) ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: colors.background,
          foregroundColor: colors.foreground,
          padding: EdgeInsets.symmetric(horizontal: sizeConfig.padding),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: loading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : child,
      ),
    );
  }
}
```

### Responsive Layout System

```dart
class Responsive extends StatelessWidget {
  const Responsive({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 768;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 768 &&
      MediaQuery.of(context).size.width < 1200;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 1200;

  @override
  Widget build(BuildContext context) {
    if (isDesktop(context) && desktop != null) return desktop!;
    if (isTablet(context) && tablet != null) return tablet!;
    return mobile;
  }
}
```

## 🗂️ Navigation with GoRouter

### Route Configuration

```dart
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    redirect: (context, state) {
      final isAuthenticated = ref.read(authProvider).isAuthenticated;
      final isLoginRoute = state.location == '/login';

      if (!isAuthenticated && !isLoginRoute) return '/login';
      if (isAuthenticated && isLoginRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/post/:id',
            builder: (context, state) {
              final postId = state.pathParameters['id']!;
              return PostDetailScreen(postId: postId);
            },
          ),
        ],
      ),
    ],
  );
});
```

## 🔄 State Management with Riverpod

### Provider Setup

```dart
@freezed
class AuthState with _$AuthState {
  const factory AuthState({
    User? user,
    @Default(false) bool isAuthenticated,
    @Default(false) bool isLoading,
    String? error,
  }) = _AuthState;
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._authService) : super(const AuthState());

  final AuthService _authService;

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final user = await _authService.login(email, password);
      state = state.copyWith(
        user: user,
        isAuthenticated: true,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

// Infinite scroll provider
final infinitePostsProvider = StateNotifierProvider<InfinitePostsNotifier, AsyncValue<List<Post>>>(
  (ref) => InfinitePostsNotifier(ref.read(postsServiceProvider)),
);
```

### Widget Integration

```dart
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final postsAsync = ref.watch(infinitePostsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, ${authState.user?.name ?? 'User'}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(infinitePostsProvider.notifier).refresh(),
          ),
        ],
      ),
      body: postsAsync.when(
        data: (posts) => ListView.builder(
          itemCount: posts.length,
          itemBuilder: (context, index) => PostCard(post: posts[index]),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Error: $error'),
              ElevatedButton(
                onPressed: () => ref.refresh(infinitePostsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

## 📱 Platform Integration

### Platform Channels

```dart
class PlatformService {
  static const MethodChannel _channel = MethodChannel('com.example.app/platform');

  static Future<String?> getDeviceInfo() async {
    try {
      final result = await _channel.invokeMethod('getDeviceInfo');
      return result as String?;
    } on PlatformException catch (e) {
      print('Failed to get device info: ${e.message}');
      return null;
    }
  }

  static Future<bool> requestPermission(String permission) async {
    try {
      final result = await _channel.invokeMethod('requestPermission', {
        'permission': permission,
      });
      return result as bool;
    } on PlatformException catch (e) {
      print('Failed to request permission: ${e.message}');
      return false;
    }
  }
}
```

### Adaptive UI Components

```dart
class AdaptiveScaffold extends StatelessWidget {
  const AdaptiveScaffold({
    super.key,
    required this.body,
    this.title,
    this.navigationRail,
    this.bottomNavigationBar,
  });

  final Widget body;
  final String? title;
  final NavigationRail? navigationRail;
  final Widget? bottomNavigationBar;

  @override
  Widget build(BuildContext context) {
    final isDesktop = Responsive.isDesktop(context);

    if (isDesktop && navigationRail != null) {
      return Scaffold(
        appBar: AppBar(
          title: title != null ? Text(title!) : null,
          automaticallyImplyLeading: false,
        ),
        body: Row(
          children: [
            navigationRail!,
            const VerticalDivider(thickness: 1, width: 1),
            Expanded(child: body),
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: title != null ? Text(title!) : null),
      body: body,
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}
```

## 🧪 Testing in Flutter

### Widget Testing

```dart
void main() {
  group('CustomButton', () {
    testWidgets('renders correctly with required properties', (tester) async {
      var pressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CustomButton(
              onPressed: () => pressed = true,
              child: const Text('Test Button'),
            ),
          ),
        ),
      );

      expect(find.text('Test Button'), findsOneWidget);
      await tester.tap(find.byType(CustomButton));
      expect(pressed, isTrue);
    });

    testWidgets('shows loading indicator when loading', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CustomButton(
              onPressed: () {},
              loading: true,
              child: const Text('Test Button'),
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Test Button'), findsNothing);
    });
  });
}
```

## 📚 Key Takeaways

1. **Single Codebase**: Flutter enables true cross-platform development
2. **Widget-First**: Everything is a widget, composable and customizable
3. **State Management**: Riverpod for scalable, testable state management
4. **Type Safety**: Dart's strong typing with code generation tools
5. **Platform Integration**: Seamless native platform integration
6. **Performance**: Near-native performance across all platforms

---

**Next**: [Native iOS Development →](native-ios.md)