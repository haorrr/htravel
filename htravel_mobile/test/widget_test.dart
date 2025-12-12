import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:htravel_mobile/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: HTravel(),
      ),
    );

    // Wait for initial frame
    await tester.pump();

    // Verify that splash page is shown
    expect(find.text('HTravel'), findsOneWidget);
    expect(find.text('Khám phá Việt Nam'), findsOneWidget);

    // Complete all pending timers
    await tester.pumpAndSettle(const Duration(seconds: 3));
  });
}
