import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button, Input } from "../components";

const Login: React.FC = () => {
  const setLoggedIn = useAppStore((s) => s.setLoggedIn);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Мок-аутентификация
    setLoggedIn(true);
    navigate("/home", { replace: true });
  };

  // Если пользователь не прошел онбординг — отправляем на онбординг
  if (!onboardingDone) {
    navigate("/onboarding", { replace: true });
  }

  return (
    <div className="min-h-dvh p-6 flex items-center justify-center">
      <div className="glass w-full max-w-md rounded-2xl border p-6 text-white">
        <div className="mb-6 text-center">
          <div className="text-3xl font-semibold">Вход</div>
          <div className="text-sm text-white/70">Продолжите, чтобы попасть в приложение</div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <div className="mb-1 text-xs text-white/70">Email</div>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-white/70">Пароль</div>
            <Input
              type="password"
              placeholder="••••••••"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">Войти</Button>
        </form>

        <div className="mt-4 text-center text-sm text-white/70">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-white hover:underline">
            Зарегистрируйтесь
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;