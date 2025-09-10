import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components";

const Onboarding: React.FC = () => {
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);
  const navigate = useNavigate();

  const complete = () => {
    setOnboardingDone(true);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-dvh p-6 flex items-center justify-center">
      <div className="glass w-full max-w-md rounded-2xl border p-6 text-center">
        <div className="text-3xl font-semibold mb-2">Добро пожаловать</div>
        <div className="text-sm text-muted-foreground mb-6">
          Создайте уникального 3D-персонажа и общайтесь в стильном пространстве.
        </div>

        <ul className="text-left text-sm text-muted-foreground space-y-2 mb-6">
          <li>— Редактор Ready Player Me</li>
          <li>— Просмотр 3D-аватара</li>
          <li>— Лента и сообщения</li>
        </ul>

        <Button className="w-full mb-3" onClick={complete}>
          Продолжить
        </Button>
        <button className="text-xs text-muted-foreground hover:underline" onClick={complete}>
          Пропустить
        </button>
      </div>
    </div>
  );
};

export default Onboarding;