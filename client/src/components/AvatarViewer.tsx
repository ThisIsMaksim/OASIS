import { useEffect, useRef, CSSProperties, FC, ReactNode } from 'react';
import * as RPMVisage from '@readyplayerme/visage';
import { ANIMATIONS, getRandomIdleAnimation, isIdleAnimation } from '../lib/animations';
import { Loader } from './ui/Loader';
import { useAppStore } from '../store/useAppStore';

const { Avatar } = RPMVisage;

// Единственный «ведущий» инстанс AvatarViewer управляет сменой анимаций через стор.
// Это устраняет гонки, когда несколько вьюеров одновременно дергают setAnimationActiveKey.
let animationControllerId: number | null = null;
let nextAnimationControllerId = 1;

interface AvatarViewerProps {
  modelSrc: string;
  animationSrc?: string;
  className?: string;
  style?: CSSProperties;
  onLoaded?: () => void;
  onLoading?: () => void;
  showControls?: boolean;
  loader?: ReactNode;
}

export const AvatarViewer: FC<AvatarViewerProps> = ({
  modelSrc,
  className = "",
  style = {},
  onLoaded,
  onLoading
}) => {
  const animationActiveKey = useAppStore(s => s.animationActiveKey);
  const animationAutoSwitchIdle = useAppStore(s => s.animationAutoSwitchIdle);
  const setAnimationActiveKey = useAppStore(s => s.setAnimationActiveKey);
  const modelReadyRef = useRef(false);

  // Локальные маркеры, чтобы не дергать стор повторно при одном и том же завершении
  const lastAppliedKeyRef = useRef<string | null>(null);
  const lastEndKeyRef = useRef<string | null>(null);

  // Фиксируем последний примененный ключ и сбрасываем маркер завершения на смене клипа
  useEffect(() => {
    lastAppliedKeyRef.current = animationActiveKey;
    lastEndKeyRef.current = null;
  }, [animationActiveKey]);

  // Идентификатор инстанса и назначение контроллера
  const instanceIdRef = useRef<number>(nextAnimationControllerId++);

  useEffect(() => {
    // Назначаем контроллером первый смонтированный вьюер
    if (animationControllerId === null) {
      animationControllerId = instanceIdRef.current;
    }
    return () => {
      // Снимаем контроль при размонтировании
      if (animationControllerId === instanceIdRef.current) {
        animationControllerId = null;
      }
    };
  }, []);

  // Выбрать idle, отличную от текущей
  const pickIdleDifferentFrom = (exclude?: string) => {
    const next = getRandomIdleAnimation(exclude);
    if (next && next.key !== exclude) return next.key;
    // fallback: если вдруг вернулся тот же — пробуем первую доступную из списка
    const alt = getRandomIdleAnimation(); // без exclude
    return alt ? alt.key : 'idle1';
  };

  // Обработчик завершения анимации
  const handleAnimationFinished = () => {
    // Защита от гонок:
    // 1) завершается не тот клип, который сейчас активен в сторе
    if (lastAppliedKeyRef.current !== animationActiveKey) return;
    // 2) это завершение уже обработано
    if (lastEndKeyRef.current === animationActiveKey) return;
    lastEndKeyRef.current = animationActiveKey;

    if (isIdleAnimation(animationActiveKey)) {
      if (animationAutoSwitchIdle) {
        const nextKey = pickIdleDifferentFrom(animationActiveKey);
        if (nextKey !== animationActiveKey) {
          setAnimationActiveKey(nextKey);
        }
      }
    } else {
      // Любая не-idle по завершении возвращается к idle, отличной от текущей
      const nextKey = pickIdleDifferentFrom();
      if (nextKey !== animationActiveKey) {
        setAnimationActiveKey(nextKey);
      }
    }
  };

  const handleLoaded = () => {
    // Фикс дребезга: считаем, что модель готова после первого onLoaded
    if (!modelReadyRef.current) {
      modelReadyRef.current = true;
      if (onLoaded) onLoaded();
    }
  };

  const handleLoading = () => {
    // Игнорируем повторные onLoading, которые приходят при смене клипов анимации
    if (modelReadyRef.current) return;
    if (onLoading) onLoading();
  };

  return (
    <div className={`avatar-viewer relative ${className}`} style={style}>
      <Avatar
        animations={ANIMATIONS}
        activeAnimation={animationActiveKey}
        backLightColor="#FFB878"
        backLightIntensity={6}
        modelSrc={modelSrc}
        scale={1.2}
        shadows
        style={style}
        cameraInitialDistance={2.8}
        cameraTarget={1.7}
        onAnimationEnd={handleAnimationFinished}
        onLoaded={handleLoaded}
        onLoading={handleLoading}
        loader={<Loader />}
      />
    </div>
  );
};

// Компонент с предустановленными настройками для мужского аватара
export const MaleAvatarViewer: React.FC<AvatarViewerProps> = (props) => {
  return (
    <AvatarViewer
      {...props}
    />
  );
};

// Компонент с предустановленными настройками для женского аватара
export const FemaleAvatarViewer: React.FC<AvatarViewerProps> = (props) => {
  return (
    <AvatarViewer
      {...props}
    />
  );
};

// Компонент с эмиссивным материалом (светящийся)
export const EmissiveAvatarViewer: React.FC<AvatarViewerProps> = (props) => {
  return (
    <AvatarViewer
      {...props}
      modelSrc={props.modelSrc || "https://readyplayerme-assets.s3.amazonaws.com/animations/visage/male-emissive.glb"}
    />
  );
};

// Компонент с контролами анимации
export const InteractiveAvatarViewer: React.FC<Omit<AvatarViewerProps, 'showControls'>> = (props) => {
  return (
    <AvatarViewer
      {...props}
      showControls={true}
    />
  );
};