import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:liquid_swipe/liquid_swipe.dart';
import '../app_state.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = LiquidController();
  int _index = 0;

  List<Widget> get _pages => const [
        _GradientPage(
          title: 'Добро пожаловать в OASIS',
          subtitle: 'Создайте уникального 3D-персонажа с Ready Player Me',
          icon: Icons.travel_explore,
          colors: [Color(0xFF7F5AF0), Color(0xFF2CB67D)],
        ),
        _GradientPage(
          title: 'Редактор в приложении',
          subtitle: 'Современный RPM-редактор прямо внутри (WebView)',
          icon: Icons.draw,
          colors: [Color(0xFF00C6FF), Color(0xFF0072FF)],
        ),
        _GradientPage(
          title: 'Используйте персонажа',
          subtitle: 'Отображение и взаимодействие в реальном времени',
          icon: Icons.vrpano,
          colors: [Color(0xFFFFA585), Color(0xFFFFEDA0)],
        ),
      ];

  bool get _isLast => _index == _pages.length - 1;

  Future<void> _finish() async {
    await appState.setOnboardingDone(true);
    if (!mounted) return;
    context.go('/login');
  }

  void _next() {
    if (_isLast) {
      _finish();
    } else {
      _controller.animateToPage(
        page: _index + 1,
        duration: 400,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final dotsColor = Colors.white.withOpacity(0.9);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          LiquidSwipe(
            pages: _pages,
            fullTransitionValue: 500,
            enableLoop: false,
            enableSideReveal: true,
            waveType: WaveType.liquidReveal,
            positionSlideIcon: 0.7,
            slideIconWidget: const Icon(Icons.arrow_back_ios, color: Colors.white70),
            onPageChangeCallback: (i) => setState(() => _index = i),
            liquidController: _controller,
          ),

          // Кнопка "Пропустить"
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            right: 16,
            child: _GlassButton(
              onPressed: _finish,
              child: const Text(
                'Пропустить',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),

          // Индикаторы + Next/Done
          Positioned(
            left: 0,
            right: 0,
            bottom: MediaQuery.of(context).padding.bottom + 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Dots
                Row(
                  children: List.generate(
                    _pages.length,
                    (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: _index == i ? 14 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _index == i ? dotsColor : Colors.white38,
                        borderRadius: BorderRadius.circular(4),
                        boxShadow: _index == i
                            ? [
                                BoxShadow(
                                  color: Colors.white.withOpacity(0.45),
                                  blurRadius: 8,
                                  spreadRadius: 1,
                                )
                              ]
                            : null,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Next/Done
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    foregroundColor: Colors.black,
                    backgroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _next,
                  icon: Icon(_isLast ? Icons.check : Icons.arrow_forward),
                  label: Text(_isLast ? 'Готово' : 'Далее'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GradientPage extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> colors;

  const _GradientPage({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      height: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 520),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // "Стеклянная" карточка
                ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: BackdropFilter(
                    filter: ui.ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.white.withOpacity(0.25)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.28),
                            blurRadius: 24,
                            offset: const Offset(0, 12),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Icon(icon, size: 96, color: Colors.white),
                          const SizedBox(height: 20),
                          Text(
                            title,
                            textAlign: TextAlign.center,
                            style: theme.textTheme.headlineSmall?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            subtitle,
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodyLarge?.copyWith(
                              color: Colors.white.withOpacity(0.9),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GlassButton extends StatelessWidget {
  final VoidCallback onPressed;
  final Widget child;

  const _GlassButton({required this.onPressed, required this.child});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(999),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Material(
          color: Colors.white.withOpacity(0.12),
          child: InkWell(
            onTap: onPressed,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              child: child,
            ),
          ),
        ),
      ),
    );
  }
}