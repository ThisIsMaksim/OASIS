import 'dart:io' show Platform;

//// Базовый URL до React WebView-приложения.
/// В деве используйте локальный Vite dev server (порт 5173 согласно Vite config):
/// - Android эмулятор: http://10.0.2.2:5173
/// - iOS симулятор:   http://localhost:5173
///
/// В проде замените на адрес вашего хостинга (например, CloudFront/Static hosting).
class WebUrls {
  /// Задайте true для локальной разработки, false — для прода
  static const bool useLocalDev = true;

  /// Продовый адрес (замените на ваш)
  static const String prodBase = 'https://your-production-host.example.com';

  /// Локальный адрес для эмуляторов/симуляторов
  static String get devBase {
    if (Platform.isAndroid) return 'http://10.0.2.2:5173';
    return 'http://localhost:5173';
  }

  static String get base => useLocalDev ? devBase : prodBase;

  /// Корневой маршрут веб-приложения (HashRouter)
  static String get root => '$base/#/';

  /// Маршрут на редактор (React HashRouter)
  static String get editor => '$base/#/editor';

  /// Маршрут на просмотр (React HashRouter)
  static String get viewer => '$base/#/viewer';
}