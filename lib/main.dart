import 'package:flutter/material.dart';

void main() {
  runApp(const GrindSheetApp());
}

class GrindSheetApp extends StatelessWidget {
  const GrindSheetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GrindSheet',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
      ),
      home: const GrindSheetHome(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class GrindSheetHome extends StatelessWidget {
  const GrindSheetHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Text(
          'GrindSheet\nUnlock the fun behind cracking the coding interviews',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.indigo,
          ),
        ),
      ),
    );
  }
}
