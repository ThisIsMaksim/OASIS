import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'app_state.dart';
import 'screens/rpm_editor_screen.dart';

/// Упрощенный роутер: все приложение живет в WebView.
/// Flutter выступает тонкой оболочкой, показывая один экран с WebView.
GoRouter buildRouter(AppState state) {
  return GoRouter(
    initialLocation: '/',
    // refreshListenable оставлен для совместимости, но редиректов больше нет.
    refreshListenable: state,
    routes: [
      GoRoute(
        path: '/',
        name: 'web',
        builder: (context, _) => const RpmEditorScreen(),
      ),
    ],
    // Вся навигация и бизнес-логика перенесены в Web-приложение.
    redirect: (context, goState) => null,
  );
}