import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../app_state.dart';

class WebviewContainer extends StatefulWidget {
  final String initialUrl;
  final String title;
  final bool showAppBar;
  final List<Widget>? actions;

  const WebviewContainer({
    super.key,
    required this.initialUrl,
    required this.title,
    this.showAppBar = true,
    this.actions,
  });

  @override
  State<WebviewContainer> createState() => _WebviewContainerState();
}

class _WebviewContainerState extends State<WebviewContainer> {
  late final WebViewController _controller;
  bool _loading = true;

  @override
  void initState() {
    super.initState();

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) => setState(() => _loading = true),
          onPageFinished: (_) {
            setState(() => _loading = false);
            // Передаем актуальный avatarUrl в веб-приложение после загрузки
            _injectAvatarUrl();
          },
          onWebResourceError: (error) {
            debugPrint('WebView error: ${error.description}');
          },
        ),
      )
      ..addJavaScriptChannel(
        'FlutterBridge',
        onMessageReceived: (JavaScriptMessage msg) async {
          // Ждем JSON-строку из JS: window.FlutterBridge.postMessage(JSON.stringify({...}))
          try {
            await appState.handleWebMessage(msg.message);
          } catch (e) {
            debugPrint('Failed to handle message: $e');
          }
        },
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  Future<void> _injectAvatarUrl() async {
    // Передаем текущий avatarUrl в WebView при необходимости
    final url = appState.avatarUrl;
    final message = jsonEncode({
      'source': 'flutter',
      'event': 'avatar.push',
      'payload': {'url': url},
    });
    await _controller.runJavaScript(
      'window.postMessage($message, "*");',
    );
  }

  @override
  Widget build(BuildContext context) {
    final body = Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_loading)
          const Positioned.fill(
            child: ColoredBox(
              color: Colors.black12,
              child: Center(child: CircularProgressIndicator()),
            ),
          ),
      ],
    );

    if (!widget.showAppBar) return body;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          IconButton(
            tooltip: 'Обновить',
            onPressed: () => _controller.reload(),
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            tooltip: 'Передать avatarUrl',
            onPressed: _injectAvatarUrl,
            icon: const Icon(Icons.outbond),
          ),
          ...?widget.actions,
          const SizedBox(width: 8),
        ],
      ),
      body: body,
    );
  }
}