/**
 * Константы анимаций для 3D аватаров
 */

export interface AnimationConfig {
  key: string;
  source: string;
  repeat?: number;
  fadeTime?: number;
  name?: string; // Для отображения в UI
}

// Основные анимации
export const ANIMATIONS: Record<string, AnimationConfig> = {
  idle1: {
    key: 'idle1',
    source: "https://storage.yandexcloud.net/oasis/idle/male-idle-1.fbx",
    repeat: 1,
    fadeTime: 0.3,
    name: "Покой"
  },
  idle2: {
    key: 'idle2',
    source: "https://storage.yandexcloud.net/oasis/idle/male-idle-3.fbx",
    repeat: 1,
    fadeTime: 0.3,
    name: "Покой 2"
  },
  idle3: {
    key: 'idle3',
    source: "https://storage.yandexcloud.net/oasis/idle/Warrior%20Idle.fbx",
    repeat: 1,
    fadeTime: 0.3,
    name: "Покой 3"
  },
  idle4: {
    key: 'idle4',
    source: 'https://storage.yandexcloud.net/oasis/idle/Standing%20W_Briefcase%20Idle.fbx',
    repeat: 1,
    fadeTime: 0.3,
    name: "Покой 4"
  },
  angry: {
    key: 'angry',
    source: "https://storage.yandexcloud.net/oasis/Angry.fbx",
    repeat: 0,
    fadeTime: 0.5,
    name: "Злость"
  },
  rumbaDancing: {
    key: 'rumbaDancing',
    source: "https://storage.yandexcloud.net/oasis/Rumba%20Dancing.fbx",
    repeat: 1,
    fadeTime: 0.6,
    name: "Румба"
  },
  punchingBag: {
    key: 'punchingBag',
    source: "https://storage.yandexcloud.net/oasis/Punching%20Bag.fbx",
    repeat: 1,
    fadeTime: 0.4,
    name: "Бокс"
  },
  sillyDancing: {
    key: 'sillyDancing',
    source: "https://storage.yandexcloud.net/oasis/Silly%20Dancing.fbx",
    repeat: 1,
    fadeTime: 0.5,
    name: "Радостный танец"
  },
};

// Экспорт всех анимаций для совместимости
export const ALL_ANIMATIONS = ANIMATIONS;

// Функция для получения источника анимации по ключу
export function getAnimationSource(key: string): string | undefined {
  return ANIMATIONS[key]?.source;
}

// Получить все idle анимации
export function getIdleAnimations(): AnimationConfig[] {
  return Object.values(ANIMATIONS).filter(animation =>
    animation.key.startsWith('idle')
  );
}

// Получить случайную idle анимацию
export function getRandomIdleAnimation(excludeKey?: string): AnimationConfig | null {
  const idleAnimations = getIdleAnimations().filter(animation =>
    animation.key !== excludeKey
  );
  
  if (idleAnimations.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * idleAnimations.length);
  return idleAnimations[randomIndex];
}

// Проверить, является ли анимация idle
export function isIdleAnimation(key: string): boolean {
  return key.startsWith('idle');
}