import 'package:flutter/material.dart';
import '../widgets/webview_container.dart';
import '../webview/web_urls.dart';
import '../app_state.dart';
import 'package:go_router/go_router.dart';

class CreateCharacterScreen extends StatelessWidget {
  const CreateCharacterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final hasAvatar = appState.avatarUrl != null;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Создание персонажа'),
        actions: [
          IconButton(
            tooltip: 'Онбординг',
            onPressed: () => context.go('/onboarding'),
            icon: const Icon(Icons.menu_book_outlined),
          ),
          IconButton(
            tooltip: 'Полноэкранный редактор',
            onPressed: () => context.go('/rpm'),
            icon: const Icon(Icons.fullscreen),
          ),
          if (hasAvatar)
            IconButton(
              tooltip: 'На главную',
              onPressed: () => context.go('/home'),
              icon: const Icon(Icons.home_outlined),
            ),
        ],
      ),
      body: Column(
        children: [
          const _InfoBanner(),
          const SizedBox(height: 8),
          Expanded(
            child: WebviewContainer(
              initialUrl: WebUrls.editor,
              title: 'Ready Player Me — Editor',
              showAppBar: false,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoBanner extends StatelessWidget {
  const _InfoBanner();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasAvatar = appState.avatarUrl != null;

    // Прячем баннер, когда аватар ещё не создан — тем самым убираем блок с текстом «Откройте редактор...»
    if (!hasAvatar) {
      return const SizedBox.shrink();
    }

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(12, 12, 12, 0),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline, color: theme.colorScheme.onPrimaryContainer),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Аватар уже сохранён. Вы можете обновить его в редакторе.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onPrimaryContainer,
              ),
            ),
          ),
        ],
      ),
    );
  }
}