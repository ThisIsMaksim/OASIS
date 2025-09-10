import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button, Input } from "../components";

const Register: React.FC = () => {
  const setLoggedIn = useAppStore((s) => s.setLoggedIn);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Мок-регистрация
    setLoggedIn(true);
    navigate("/home", { replace: true });
  };


  return (
    <div className="min-h-dvh p-6 flex items-center justify-center">
      <div className="glass w-full max-w-md rounded-2xl border p-6 text-white">
        <div className="mb-6 text-center">
          <div className="text-3xl font-semibold">Регистрация</div>
          <div className="text-sm text-white/70">Создайте аккаунт, чтобы продолжить</div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <div className="mb-1 text-xs text-white/70">Имя</div>
            <Input
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <Button type="submit" className="w-full">Зарегистрироваться</Button>
        </form>

        <div className="mt-4 text-center text-sm text-white/70">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-white hover:underline">
            Войдите
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;