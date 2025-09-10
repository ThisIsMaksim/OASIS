import React from 'react';

// Простая крутилка в стиле приложения
export const Loader: React.FC = () => {
  return (
    <div className="absolute z-100 inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-lg">
      <div className="animate-spin rounded-full border-2 border-white/20 border-t-white/80 w-8 h-8" />
    </div>
  );
};