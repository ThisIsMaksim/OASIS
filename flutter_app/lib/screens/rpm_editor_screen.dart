import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../widgets/webview_container.dart';
import '../webview/web_urls.dart';

class RpmEditorScreen extends StatefulWidget {
  const RpmEditorScreen({super.key});

  @override
  State<RpmEditorScreen> createState() => _RpmEditorScreenState();
}

class _RpmEditorScreenState extends State<RpmEditorScreen> {
  // Сохраняем предыдущий режим системных UI, чтобы вернуть при выходе
  late final SystemUiMode _prevMode;
  late final List<SystemUiOverlay> _prevOverlays;
  bool _restored = false;

  @override
  void initState() {
    super.initState();
    _enterImmersive();
  }

  Future<void> _enterImmersive() async {
    // Запоминаем текущее состояние (для надежности — пытаемся прочитать)
    _prevMode = SystemUiMode.edgeToEdge;
    _prevOverlays = SystemUiOverlay.values;

    // Включаем максимально полноэкранный режим для редактора
    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    // Прозрачные статус/навигация, чтобы контент тянулся на весь экран (на поддерживаемых платформах)
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        systemNavigationBarColor: Colors.transparent,
      ),
    );
  }

  Future<void> _restoreUi() async {
    if (_restored) return;
    _restored = true;
    // Возвращаем стандартный edgeToEdge
    await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  }

  @override
  void dispose() {
    // Возвращаем системные UI при выходе с экрана
    unawaited(_restoreUi());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Без AppBar, WebView занимает всю ширину/высоту
      body: SafeArea(
        top: false,
        bottom: false,
        left: false,
        right: false,
        child: WebviewContainer(
          initialUrl: WebUrls.root,
          title: 'Web Shell',
          showAppBar: false,
        ),
      ),
    );
  }
}