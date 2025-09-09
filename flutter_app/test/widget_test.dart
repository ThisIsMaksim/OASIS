import 'package:flutter_test/flutter_test.dart';
import 'package:oasis_flutter/main.dart';

void main() {
 testWidgets('App builds smoke test', (WidgetTester tester) async {
   await tester.pumpWidget(const OasisApp());
   await tester.pump();
   // Убеждаемся, что корневой виджет присутствует
   expect(find.byType(OasisApp), findsOneWidget);
 });
}
