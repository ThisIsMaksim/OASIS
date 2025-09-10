import { useState, useEffect } from 'react';
import { AvatarCreator, AvatarExportedEvent, UserSetEvent } from '@readyplayerme/react-avatar-creator';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import { RPM_CONFIG, RPM_SUBDOMAIN } from '../lib/rpm';

interface AvatarEditorProps {
  onAvatarCreated?: (avatarUrl: string) => void;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ onAvatarCreated }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { setAvatarUrl } = useAppStore();
  const navigate = useNavigate();

  // Убираем индикатор загрузки через некоторое время
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAvatarExported = (event: AvatarExportedEvent) => {
    const avatarUrl = event.data.url;
    
    if (avatarUrl && typeof avatarUrl === 'string') {
      try {
        // Проверяем, что URL валидный
        new URL(avatarUrl);
        
        // Сохраняем URL аватара в локальное хранилище
        localStorage.setItem('avatarUrl', avatarUrl);
        
        // Обновляем состояние в store
        setAvatarUrl(avatarUrl);
        
        // Вызываем callback если передан
        onAvatarCreated?.(avatarUrl);
        
        // Редиректим на главную страницу
        navigate('/');
      } catch (urlError) {
        console.error('Invalid avatar URL received:', avatarUrl, urlError);
      }
    } else {
      console.error('Avatar export completed but no valid URL received:', event.data);
    }
  };

  const handleUserSet = (event: UserSetEvent) => {
    console.log('User data received:', event.data);
    // Когда пользователь установлен, можно убрать индикатор загрузки
    setIsLoading(false);
  };

  return (
    <div className="w-full h-dvh relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-sm px-4">Загрузка редактора аватара...</p>
          </div>
        </div>
      )}
      
      <AvatarCreator
        subdomain={RPM_SUBDOMAIN}
        config={{
          ...RPM_CONFIG,
          // Оптимизация для мобильных устройств
          quickStart: false,
          language: 'en', // Используем английский, так как русский может не поддерживаться
        }}
        style={{
          width: '100%',
          height: '100dvh',
          minHeight: '100dvh',
          display: 'block',
          border: 'none',
          outline: 'none'
        }}
        onAvatarExported={handleAvatarExported}
        onUserSet={handleUserSet}
      />
    </div>
  );
};