import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "./store/useAppStore";
import { registerNavigator } from "./lib/bridge";
import { AvatarEditor } from "./components/AvatarEditor";

import Onboarding from "./screens/Onboarding";
import Login from "./screens/Login";
import Register from "./screens/Register";
import HomeScreen from "./screens/Home";

function RootRedirect() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const loggedIn = useAppStore((s) => s.loggedIn);

  const target = !onboardingDone ? "/onboarding" : !loggedIn ? "/login" : "/home";
  return <Navigate to={target} replace />;
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
    <div className={isFullscreen ? "h-dvh w-full overflow-hidden" : "min-h-dvh p-4 md:p-6"}>
      <Routes>
        {/* Поток входа */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Главная с таббаром */}
        <Route path="/home" element={<HomeScreen />} />

        {/* Редактор и просмотр 3D */}
        <Route path="/editor" element={<AvatarEditor />} />

        {/* Фолбэк */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
