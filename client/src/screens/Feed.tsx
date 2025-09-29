import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { useProfileStore } from "../store/useProfileStore";
import localEpisodes from "../data/episodes";
import type { Episode } from "../lib/scenarioEngine";
import { Button } from "../components";

function EpisodeCard({
  ep,
  completed,
  choiceLabel,
}: {
  ep: Episode;
  completed: boolean;
  choiceLabel?: string | null;
}) {
  return (
    <Link
      to={`/feed/${encodeURIComponent(ep.id)}`}
      className={[
        "block rounded-2xl border glass p-4 text-white transition hover:bg-white/5",
        completed ? "opacity-90 ring-1 ring-emerald-400/30" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm uppercase tracking-wider text-white/70">Эпизод</div>
          <div className="mt-1 line-clamp-2 text-base font-semibold">{ep.scene}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(ep.tags || []).slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          {completed ? (
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">
              Пройдено
            </span>
          ) : (
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
              Открыть
            </span>
          )}
        </div>
      </div>

      {completed && choiceLabel ? (
        <div className="mt-2 text-xs text-white/70">
          Ваш выбор: <span className="text-white">{choiceLabel}</span>
        </div>
      ) : null}
    </Link>
  );
}

const FeedScreen: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s);
  const {
    ensureDailyFeed,
    dailyFeed,
    dailyCompleted,
    dailyChoices,
    currentDay,
  } = useAppStore((s) => ({
    ensureDailyFeed: s.ensureDailyFeed,
    dailyFeed: s.dailyFeed,
    dailyCompleted: s.dailyCompleted,
    dailyChoices: s.dailyChoices,
    currentDay: s.currentDay,
  }));

  useEffect(() => {
    ensureDailyFeed(profile, localEpisodes);
  }, [ensureDailyFeed, profile]);

  const progress = useMemo(() => {
    const done = dailyCompleted.length;
    const total = Math.min(3, dailyFeed.length || 3);
    return { done, total };
  }, [dailyCompleted.length, dailyFeed.length]);

  return (
    <div className="h-full w-full p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/70">
            Лента дня {currentDay ? `· ${currentDay}` : ""}
          </div>
          <div className="text-xl font-semibold">Эпизоды</div>
        </div>
        <div className="text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
            {progress.done}/{progress.total} пройдено
          </span>
        </div>
      </div>

      {dailyFeed.length === 0 ? (
        <div className="glass rounded-2xl border p-6 text-white/70">
          Генерируем эпизоды на сегодня...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {dailyFeed.map((ep) => {
            const isDone = dailyCompleted.includes(ep.id);
            const choice = dailyChoices[ep.id];
            const choiceLabel =
              choice?.optionId ? ep.options.find((o) => o.id === choice.optionId)?.label ?? null : null;
            return (
              <EpisodeCard
                key={ep.id}
                ep={ep}
                completed={isDone}
                choiceLabel={choiceLabel}
              />
            );
          })}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="secondary" onClick={() => navigate("/home")}>
          На главную
        </Button>
      </div>
    </div>
  );
};

export default FeedScreen;