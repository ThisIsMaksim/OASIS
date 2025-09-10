import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import { registerNavigator } from "./lib/bridge";
import { AvatarEditor } from "./components/AvatarEditor";
import { DebugPanel } from "./components/DebugPanel";
import "./lib/animationPreloader";

import Onboarding from "./screens/Onboarding";
import HomeScreen from "./screens/Home";

function RootRedirect() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const avatarUrl = useAppStore((s) => s.avatarUrl);

  const target =
    !onboardingDone ? "/onboarding" :
    (avatarUrl ? "/home" : "/editor");

  return <Navigate to={target} replace />;
}

function HomeOrEditor() {
  const avatarUrl = useAppStore((s) => s.avatarUrl);
  return avatarUrl ? <HomeScreen /> : <Navigate to="/editor" replace />;
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
    <div className={isFullscreen ? "h-dvh w-full" : "min-h-dvh p-4 md:p-6"}>
      <Routes>
        {/* Поток входа */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Главная с таббаром */}
        <Route path="/home" element={<HomeOrEditor />} />

        {/* Редактор и просмотр 3D */}
        <Route path="/editor" element={<AvatarEditor />} />

        {/* Фолбэк */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Debug Panel - доступна на всех страницах */}
      <DebugPanel />
    </div>
  );
}

export default App;
