import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppState extends ChangeNotifier {
  bool _ready = false;
  bool _loggedIn = false;
  String? _avatarUrl;

  bool get isReady => _ready;
  bool get loggedIn => _loggedIn;
  String? get avatarUrl => _avatarUrl;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _loggedIn = prefs.getBool('loggedIn') ?? false;

    // Храним последнюю известную ссылку на аватар
    _avatarUrl = prefs.getString('avatarUrl');

    _ready = true;
    notifyListeners();
  }


  Future<void> setLoggedIn(bool v) async {
    _loggedIn = v;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('loggedIn', v);
    notifyListeners();
  }

  Future<void> setAvatarUrl(String? url) async {
    _avatarUrl = url;
    final prefs = await SharedPreferences.getInstance();
    if (url == null) {
      await prefs.remove('avatarUrl');
    } else {
      await prefs.setString('avatarUrl', url);
    }
    notifyListeners();
  }

  // Обработка сообщений из WebView (из JS канала "FlutterBridge")
  // Ожидаем JSON формата:
  // { "source":"webapp","event":"avatar.exported","payload":{"url":"..."} }
  Future<void> handleWebMessage(String message) async {
    try {
      final map = jsonDecode(message) as Map<String, dynamic>;
      final event = map['event'] as String?;
      if (event == 'avatar.exported' || event == 'avatar.updated') {
        final payload = (map['payload'] as Map?) ?? {};
        final url = payload['url'] as String?;
        await setAvatarUrl(url);
      }
    } catch (_) {
      // ignore malformed
    }
  }
}

// Глобальный стейт, чтобы использовать в GoRouter refreshListenable
final AppState appState = AppState();