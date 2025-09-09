import 'package:flutter/material.dart';
import '../widgets/webview_container.dart';
import '../webview/web_urls.dart';
import '../app_state.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final avatarUrl = appState.avatarUrl;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Главная'),
        actions: [
          IconButton(
            tooltip: 'Редактировать персонажа',
            onPressed: () => context.go('/create'),
            icon: const Icon(Icons.person_2_outlined),
          ),
          IconButton(
            tooltip: 'Выход',
            onPressed: () async {
              await appState.setLoggedIn(false);
              // не сбрасываем аватар — чтобы после повторного входа он остался
              if (!context.mounted) return;
              context.go('/login');
            },
            icon: const Icon(Icons.logout),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          _Header(avatarUrl: avatarUrl),
          Expanded(
            child: WebviewContainer(
              initialUrl: WebUrls.viewer,
              title: 'Просмотр персонажа',
              showAppBar: false,
            ),
          ),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final String? avatarUrl;
  const _Header({required this.avatarUrl});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(
          bottom: BorderSide(color: theme.colorScheme.outlineVariant),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.vrpano_outlined,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              avatarUrl == null
                  ? 'Аватар не найден. Перейдите в редактор, чтобы создать персонажа.'
                  : 'Аватар загружен. Ниже — 3D-просмотр.',
              style: theme.textTheme.bodyMedium,
            ),
          ),
          if (avatarUrl != null)
            SelectableText(
              avatarUrl!,
              style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.primary),
              maxLines: 1,
            ),
        ],
      ),
    );
  }
}