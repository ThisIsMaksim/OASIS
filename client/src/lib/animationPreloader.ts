/**
 * Простая утилита для предзагрузки анимаций
 */

import { ALL_ANIMATIONS, getAnimationSource } from './animations';

// Функция для предзагрузки одного файла (кэширование в браузере)
async function preload(url: string, key: string): Promise<void> {
  try {
    await fetch(url);
    console.log(`✅ Анимация ${key} предзагружена`);
  } catch (error) {
    console.warn(`⚠️ Не удалось предзагрузить анимацию ${key}:`, error);
  }
}

// Флаг инициализации
let isInitialized = false;

/**
 * Автоматическая предзагрузка всех анимаций
 */
async function initPreload(): Promise<void> {
  if (isInitialized) return;
  isInitialized = true;

  console.log('🎬 Начинаем предзагрузку анимаций...');
  
  // Загружаем все анимации параллельно в фоне для кэширования браузером
  Object.entries(ALL_ANIMATIONS).forEach(([key, config]) => {
    preload(config.source, key);
  });
}

/**
 * Получить URL анимации по ключу
 */
export function getAnimationUrl(key: string): string | undefined {
  return getAnimationSource(key);
}

// Автоматический запуск предзагрузки при импорте модуля
if (typeof window !== 'undefined') {
  // Запускаем предзагрузку после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreload);
  } else {
    initPreload();
  }
}