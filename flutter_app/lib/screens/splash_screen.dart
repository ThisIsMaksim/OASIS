import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Красивый сплэш с Lottie из сети (можно заменить на локальный asset позже)
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Center(
            child: Lottie.network(
              'https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json',
              width: 240,
              height: 240,
              repeat: true,
              frameRate: FrameRate.max,
            ),
          ),
          const Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Text(
              'Загрузка...',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70),
            ),
          ),
        ],
      ),
    );
  }
}