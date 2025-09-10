import React from 'react';
import { Bug, X, Navigation, User, Home, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ANIMATIONS } from '../lib/animations';

interface DebugPanelProps {
  className?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ className = '' }) => {
  const isOpen = useAppStore(s => s.debugPanelOpen);
  const setOpen = useAppStore(s => s.setDebugPanelOpen);
  const activeTab = useAppStore(s => s.debugActiveTab);
  const setActiveTab = useAppStore(s => s.setDebugActiveTab);
  const navigate = useNavigate();
  const location = useLocation();
  const { avatarUrl, animationActiveKey, animationAutoSwitchIdle, setAnimationActiveKey, setAnimationAutoSwitchIdle } = useAppStore(s => ({
    avatarUrl: s.avatarUrl,
    animationActiveKey: s.animationActiveKey,
    animationAutoSwitchIdle: s.animationAutoSwitchIdle,
    setAnimationActiveKey: s.setAnimationActiveKey,
    setAnimationAutoSwitchIdle: s.setAnimationAutoSwitchIdle,
  }));

  const navigationItems = [
    { label: 'Главная', path: '/home', icon: Home },
    { label: 'Редактор аватара', path: '/editor', icon: User },
    { label: 'Онбординг', path: '/onboarding', icon: Settings },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const openAvatarEditor = () => {
    navigate('/editor');
    setOpen(false);
  };

  // Скрываем дебаг панель на странице редактирования аватара
  if (location.pathname === '/editor') {
    return null
  }

  return (
    <>
      {/* Кнопка жука */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed left-0 top-1/2 -translate-y-1/2 translate-x-0 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-r-lg shadow-lg transition-all duration-200 ${className}`}
        title="Открыть дебаг панель"
      >
        <Bug className="w-5 h-5" />
      </button>

      {/* Шторка */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Панель */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Дебаг панель
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Вкладки */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('navigation')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'navigation'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Navigation className="w-4 h-4 mx-auto mb-1" />
                Навигация
              </button>
              <button
                onClick={() => setActiveTab('avatar')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'avatar'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <User className="w-4 h-4 mx-auto mb-1" />
                Управление аватаром
              </button>
            </div>

            {/* Содержимое вкладок */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {activeTab === 'navigation' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Быстрая навигация
                  </h3>
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <IconComponent className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === 'avatar' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Управление аватаром
                  </h3>
                  
                  {/* Кнопка открытия редактора */}
                  <button
                    onClick={openAvatarEditor}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Открыть редактор аватара
                  </button>

                  {/* Настройки анимации — управляют основным просмотрщиком */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Автопереключение idle</span>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={animationAutoSwitchIdle}
                          onChange={(e) => setAnimationAutoSwitchIdle(e.target.checked)}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Вкл</span>
                      </label>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Выбор анимации</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.values(ANIMATIONS).map((anim) => (
                          <button
                            key={anim.key}
                            onClick={() => setAnimationActiveKey(anim.key)}
                            className={[
                              "p-2 rounded-lg border text-sm transition-colors",
                              animationActiveKey === anim.key
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200"
                                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            ].join(" ")}
                          >
                            {anim.name || anim.key}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!avatarUrl && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Аватар не создан. Создайте аватар в редакторе, чтобы увидеть изменения в просмотрщике на главной.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};