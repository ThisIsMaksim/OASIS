import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_state.dart';
import 'router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await appState.init();
  runApp(const OasisApp());
}

class OasisApp extends StatelessWidget {
  const OasisApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6750A4)),
      useMaterial3: true,
      textTheme: GoogleFonts.interTextTheme(),
      scaffoldBackgroundColor: Colors.transparent,
    );

    return AnimatedBuilder(
      animation: appState,
      builder: (context, _) {
        return MaterialApp.router(
          title: 'OASIS',
          debugShowCheckedModeBanner: false,
          theme: theme,
          builder: (context, child) {
            return DecoratedBox(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF0B1220), // глубокий темный фон
                    Color(0xFF0A0F1A),
                  ],
                ),
              ),
              child: Stack(
                children: [
                  // Градиентные "ореолы" как у современных стеклянных UI
                  Positioned(
                    top: -120,
                    left: -60,
                    child: IgnorePointer(
                      ignoring: true,
                      child: Container(
                        width: 320,
                        height: 320,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              Color(0x885B8DEF), // фиолетовый soft
                              Colors.transparent
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: -140,
                    right: -80,
                    child: IgnorePointer(
                      ignoring: true,
                      child: Container(
                        width: 420,
                        height: 420,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              Color(0x8828D7BE), // бирюзовый soft
                              Colors.transparent
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  // Контент приложения
                  if (child != null) child,
                ],
              ),
            );
          },
          routerConfig: buildRouter(appState),
        );
      },
    );
  }
}