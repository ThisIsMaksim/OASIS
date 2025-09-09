export { AvatarEditor } from './AvatarEditor';
export {
  AvatarViewer,
  MaleAvatarViewer,
  FemaleAvatarViewer,
  EmissiveAvatarViewer,
  InteractiveAvatarViewer
} from './AvatarViewer';
export { ErrorBoundary } from './ErrorBoundary';
export { DebugPanel } from './DebugPanel';

// Экспортируем константы анимаций
export {
  ANIMATIONS,
  ALL_ANIMATIONS,
  getAnimationSource,
  getIdleAnimations,
  getRandomIdleAnimation,
  isIdleAnimation
} from '../lib/animations';

export type { AnimationConfig } from '../lib/animations';

// UI Components
export { Button, Input } from './ui';
export type { ButtonProps, InputProps } from './ui';