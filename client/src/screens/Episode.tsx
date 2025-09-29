import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useProfileStore } from "../store/useProfileStore";
import localEpisodes from "../data/episodes";
import type { Episode } from "../lib/scenarioEngine";
import { Button } from "../components";

const EpisodeScreen: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s);

  const {
    ensureDailyFeed,
    dailyFeed,
    dailyCompleted,
    dailyChoices,
    selectOption,
  } = useAppStore((s) => ({
    ensureDailyFeed: s.ensureDailyFeed,
    dailyFeed: s.dailyFeed,
    dailyCompleted: s.dailyCompleted,
    dailyChoices: s.dailyChoices,
    selectOption: s.selectOption,
  }));

  const [outcomeOpen, setOutcomeOpen] = useState<boolean>(true);

  useEffect(() => {
    // Инициализация ленты дня (если еще не инициализирована)
    ensureDailyFeed(profile, localEpisodes);
  }, [ensureDailyFeed, profile]);

  const episode: Episode | undefined = useMemo(
    () => dailyFeed.find((e) => e.id === id),
    [dailyFeed, id]
  );

  useEffect(() => {
    // Если лента уже есть, но эпизод не найден — редиректим в /feed
    if (dailyFeed.length > 0 && !episode) {
      navigate("/feed", { replace: true });
    }
  }, [dailyFeed, episode, navigate]);

  if (!episode) {
    return (
      <div className="h-dvh w-full p-4 text-white">
        <div className="glass rounded-2xl border p-6 text-white/80">
          Загрузка эпизода...
        </div>
      </div>
    );
  }

  const isCompleted = dailyCompleted.includes(episode.id);
  const chosen = dailyChoices[episode.id];
  const progress = {
    done: dailyCompleted.length,
    total: Math.min(3, dailyFeed.length || 3),
  };

  const handlePick = (optId: string) => {
    if (isCompleted) return;
    const opt = episode.options.find((o) => o.id === optId);
    if (!opt) return;

    const outcome = episode.outcomes?.[opt.id] ?? "";
    selectOption(episode.id, opt.id, opt.deltas, outcome);
    setOutcomeOpen(true);
  };

  const currentOutcome =
    chosen?.optionId ? episode.outcomes?.[chosen.optionId] ?? "" : "";

  const share = async () => {
    try {
      const title = "Мой эпизод дня";
      const text =
        episode.share_caption ||
        (currentOutcome
          ? `Итог: ${currentOutcome}`
          : `Сцена: ${episode.scene.slice(0, 80)}...`);
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(`${title}\n${text}\n${url}`);
        alert("Ссылка скопирована в буфер обмена");
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="h-dvh w-full p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/70">
            Эпизод дня
          </div>
          <div className="text-xl font-semibold line-clamp-1">Сцена</div>
        </div>
        <div className="text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
            {progress.done}/{progress.total} пройдено
          </span>
        </div>
      </div>

      <div className="glass rounded-2xl border p-4">
        <div className="text-base leading-relaxed">{episode.scene}</div>

        {(episode.tags?.length ?? 0) > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {episode.tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {episode.options.map((opt) => {
          const picked = chosen?.optionId === opt.id;
          const disabled = isCompleted && !picked;
          return (
            <button
              key={opt.id}
              disabled={disabled}
              onClick={() => handlePick(opt.id)}
              className={[
                "w-full rounded-xl border px-4 py-3 text-left transition",
                "glass hover:bg-white/5",
                disabled ? "opacity-60 cursor-not-allowed" : "",
                picked ? "ring-1 ring-emerald-400/40 bg-emerald-500/10" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">{opt.label}</div>
                {picked ? (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">
                    Ваш выбор
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Outcome (collapsible) */}
      {(isCompleted || currentOutcome) && (
        <div className="mt-4">
          <details
            open={outcomeOpen}
            onToggle={(e) => setOutcomeOpen((e.target as HTMLDetailsElement).open)}
            className="glass rounded-2xl border p-4"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-white">
              Результат
              <span className="ml-2 text-xs text-white/70">
                {outcomeOpen ? "Скрыть" : "Показать"}
              </span>
            </summary>
            <div className="mt-2 text-white/90">{currentOutcome}</div>
          </details>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={() => navigate("/home")}>
          На главную
        </Button>
        <Button variant="outline" onClick={share}>
          Поделиться
        </Button>
      </div>
    </div>
  );
};

export default EpisodeScreen;