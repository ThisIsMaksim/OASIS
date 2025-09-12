import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import { registerNavigator } from "./lib/bridge";
import { AvatarEditor } from "./components/AvatarEditor";
import { DebugPanel } from "./components/DebugPanel";
import "./lib/animationPreloader";

import HomeScreen from "./screens/Home";
import CreateCharacter from "./screens/CreateCharacter";

function RootRedirect() {
  // const onboardingDone = useAppStore((s) => s.onboardingDone);
  const avatarUrl = useAppStore((s) => s.avatarUrl);

  const target = avatarUrl ? "/home" : "/editor"

  return <Navigate to={target} replace />;
}

function HomeOrEditor() {
  const avatarUrl = useAppStore((s) => s.avatarUrl);
  const location = useLocation();
  const justCreated = (location.state as any)?.avatarJustCreated;

  if (avatarUrl) {
    return <HomeScreen />;
  }

  if (justCreated) {
    return (
      <div className="h-dvh w-full flex items-center justify-center text-white">
        Загрузка аватара...
      </div>
    );
  }

  return <Navigate to="/editor" replace />;
}

function App() {
  const dark = useAppStore((s) => s.dark);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    // Регистрируем навигатор для вызовов из Flutter через WebAppBridge
    registerNavigator((path) => navigate(path));
  }, [navigate]);

  const isFullscreen = location.pathname === "/editor";

  return (
    <div className={isFullscreen ? "h-dvh w-full" : "h-dvh w-full"}>
      <Routes>
        {/* Поток входа */}
        <Route path="/" element={<RootRedirect />} />

        {/* Главная с таббаром */}
        <Route path="/home" element={<HomeOrEditor />} />

        {/* Редактор и просмотр 3D */}
        <Route path="/editor" element={<AvatarEditor />} />
        
        {/* Создание/редактирование персонажа */}
        <Route path="/create" element={<CreateCharacter />} />
        
        {/* Фолбэк */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Debug Panel - доступна на всех страницах */}
      <DebugPanel />
    </div>
  );
}

export default App;
