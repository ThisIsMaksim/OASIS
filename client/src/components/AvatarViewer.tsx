import React, { useState, useEffect, useRef } from 'react';
import * as RPMVisage from '@readyplayerme/visage';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { ANIMATIONS, getRandomIdleAnimation } from '../lib/animations';

const { Avatar } = RPMVisage;

interface AvatarViewerProps {
  modelSrc: string;
  animationSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoaded?: () => void;
  onLoading?: () => void;
  showControls?: boolean;
}

export const AvatarViewer: React.FC<AvatarViewerProps> = ({
  modelSrc,
  className = "",
  style = {},
  onLoaded,
  onLoading,
  showControls = false
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle1');
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoSwitchIdle, setAutoSwitchIdle] = useState(true);
  const animationTimeoutRef = useRef<number | null>(null);

  // Функция для переключения на случайную idle анимацию
  const switchToRandomIdle = () => {
    if (!autoSwitchIdle) return;
    
    const randomIdle = getRandomIdleAnimation(currentAnimation);

    if (randomIdle) {
      console.log(`🎬 Переключение на случайную idle анимацию: ${randomIdle.key}`);
      setCurrentAnimation(randomIdle.key);
    }
  };

  // Обработчик завершения анимации
  const handleAnimationFinished = () => {
    console.log(`✅ Анимация ${currentAnimation} завершена`);

    switchToRandomIdle();
  };

  const handleLoaded = () => {
    console.log('🎬 Аватар загружен');
    if (onLoaded) {
      onLoaded();
    }
  };

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Очистка таймера при смене анимации
  useEffect(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, [currentAnimation]);

  return (
    <div className={`avatar-viewer relative ${className}`} style={style}>
      <Avatar
        animations={ANIMATIONS}
        activeAnimation={currentAnimation}
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
        onLoading={onLoading}
      />
      
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          {/* Переключатель автоматической смены idle анимаций */}
          <div className="mb-3 flex justify-center">
            <label className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-full text-white text-xs">
              <input
                type="checkbox"
                checked={autoSwitchIdle}
                onChange={(e) => setAutoSwitchIdle(e.target.checked)}
                className="w-3 h-3"
              />
              Автосмена idle анимаций
            </label>
          </div>
          
          {/* Кнопки анимаций */}
          <div className="mb-3 flex flex-wrap gap-2 justify-center">
            {Object.entries(ANIMATIONS).map(([key, animation]) => (
              <button
                key={key}
                onClick={() => setCurrentAnimation(key)}
                className={`px-3 py-1.5 text-xs rounded-full transition ${
                  currentAnimation === key
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                {animation.name}
              </button>
            ))}
          </div>
          
          {/* Контролы воспроизведения */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
              title={isPlaying ? "Пауза" : "Воспроизвести"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => {
                // Перезапуск анимации - меняем на ту же анимацию
                const current = currentAnimation;
                setCurrentAnimation('idle1');
                setTimeout(() => setCurrentAnimation(current), 100);
              }}
              className="flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
              title="Перезапустить"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={switchToRandomIdle}
              className="flex items-center justify-center px-3 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full transition text-xs"
              title="Случайная idle анимация"
            >
              🎲
            </button>
          </div>
        </div>
      )}
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