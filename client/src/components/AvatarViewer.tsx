import React, { useState } from 'react';
import * as RPMVisage from '@readyplayerme/visage';
import { Play, Pause, RotateCcw } from 'lucide-react';

const { Avatar } = RPMVisage;

// Список доступных анимаций
export const ANIMATIONS = {
  idle: {
    url: "https://readyplayerme-assets.s3.amazonaws.com/animations/visage/male-idle.glb",
    name: "Покой"
  },
  angry: {
    url: "https://storage.yandexcloud.net/oasis/Angry.fbx",
    name: "Злость"
  },
  'Happy Walk': {
    url: "https://readyplayerme-assets.s3.amazonaws.com/animations/visage/male-wave.glb",
    name: "Приветствие"
  },
  'Rumba Dancing': {
    url: "https://storage.yandexcloud.net/oasis/Rumba%20Dancing.fbx",
    name: "Румба"
  },
  'Punching Bag': {
    url: "https://storage.yandexcloud.net/oasis/Punching%20Bag.fbx",
    name: "Бокс"
  },
  'Silly Dancing': {
    url: "https://storage.yandexcloud.net/oasis/Silly%20Dancing.fbx",
    name: "Silly dance"
  }
};

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
  animationSrc,
  className = "",
  style = {},
  onLoaded,
  onLoading,
  showControls = false
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<keyof typeof ANIMATIONS>('idle');
  const [isPlaying, setIsPlaying] = useState(true);

  const getAnimationSrc = () => {
    if (animationSrc) return animationSrc;
    return ANIMATIONS[currentAnimation].url;
  };

  return (
    <div className={`avatar-viewer relative ${className}`} style={style}>
      <Avatar
        animationSrc={getAnimationSrc()}
        backLightColor="#FFB878"
        backLightIntensity={6}
        modelSrc={modelSrc}
        scale={0.95}
        shadows
        style={style}
        cameraInitialDistance={2.8}
        cameraTarget={1.05}
      />
      
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          {/* Кнопки анимаций */}
          <div className="mb-3 flex flex-wrap gap-2 justify-center">
            {Object.entries(ANIMATIONS).map(([key, animation]) => (
              <button
                key={key}
                onClick={() => setCurrentAnimation(key as keyof typeof ANIMATIONS)}
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
                setCurrentAnimation('idle');
                setTimeout(() => setCurrentAnimation(current), 100);
              }}
              className="flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
              title="Перезапустить"
            >
              <RotateCcw className="w-4 h-4" />
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