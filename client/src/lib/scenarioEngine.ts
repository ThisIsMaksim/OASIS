import type { Profile } from "../store/useProfileStore";

export type StatKey = 'eng' | 'soc' | 'crtv' | 'wealth';
export type Stats = Record<StatKey, number>;

export type Deltas = Partial<Record<StatKey, number>>;

export type Gate = {
  minStats?: Partial<Stats>;
  tabooNotContains?: string[];
};

export type EpisodeOption = {
  id: string;
  label: string;
  deltas: Deltas;
};

export type Episode = {
  id: string;
  tags: string[];
  gate?: Gate;
  scene: string;
  options: EpisodeOption[];
  outcomes: Record<string, string>;
  share_caption?: string;
};

function clamp01to10(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(10, v));
}

export function applyChoice(stats: Stats, deltas: Deltas): Stats {
  const next: Stats = {
    eng: clamp01to10((stats.eng ?? 0) + (deltas.eng ?? 0)),
    soc: clamp01to10((stats.soc ?? 0) + (deltas.soc ?? 0)),
    crtv: clamp01to10((stats.crtv ?? 0) + (deltas.crtv ?? 0)),
    wealth: clamp01to10((stats.wealth ?? 0) + (deltas.wealth ?? 0)),
  };
  return next;
}

function passesGate(ep: Episode, stats: Stats, profile: Profile): boolean {
  const tabooSet = new Set((profile.taboos || []).map((t) => t.toLowerCase()));
  if (ep.tags.some((t) => tabooSet.has(String(t).toLowerCase()))) return false;

  if (ep.gate?.tabooNotContains?.length) {
    const prohibited = new Set(ep.gate.tabooNotContains.map((t) => t.toLowerCase()));
    for (const t of tabooSet) {
      if (prohibited.has(t)) return false;
    }
  }
  if (ep.gate?.minStats) {
    const g = ep.gate.minStats;
    if (g.eng !== undefined && stats.eng < g.eng) return false;
    if (g.soc !== undefined && stats.soc < g.soc) return false;
    if (g.crtv !== undefined && stats.crtv < g.crtv) return false;
    if (g.wealth !== undefined && stats.wealth < g.wealth) return false;
  }
  return true;
}

function topGoalTag(profile: Profile): string | null {
  const goals = profile.monthlyGoals || { health: 0, social: 0, creative: 0, wealth: 0 };
  const entries: [string, number][] = [
    ["health", goals.health ?? 0],
    ["social", goals.social ?? 0],
    ["creative", goals.creative ?? 0],
    ["wealth", goals.wealth ?? 0],
  ];
  entries.sort(
    (a, b) =>
      b[1] - a[1] ||
      ["health", "social", "creative", "wealth"].indexOf(a[0]) -
        ["health", "social", "creative", "wealth"].indexOf(b[0])
  );
  return entries[0][1] > 0 ? (entries[0][0] as string) : null;
}

function professionAndHobbyTags(profile: Profile): Set<string> {
  const tags = new Set<string>();
  const push = (s?: string | null) => {
    if (!s) return;
    s
      .toLowerCase()
      .split(/[^a-zа-я0-9_]+/i)
      .filter(Boolean)
      .forEach((w) => tags.add(w));
  };

  push(profile.profession);
  (profile.hobbies || []).forEach(push);
  (profile.interests || []).forEach(push);

  const prof = (profile.profession || "").toLowerCase();
  if (/\b(dev|программист|инженер|it)\b/.test(prof)) {
    tags.add("tech");
    tags.add("coding");
    tags.add("career");
  }
  if (/\b(design|дизайн|artist|art|музыкант|music)\b/.test(prof)) {
    tags.add("creative");
    tags.add("social");
  }
  if (/\b(маркет|sales|продаж|pm|менеджер)\b/.test(prof)) {
    tags.add("career");
    tags.add("social");
  }
  return tags;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickDailyEpisodes(
  profile: Profile,
  stats: Stats,
  allEpisodes: Episode[]
): Episode[] {
  const pool = allEpisodes.filter((e) => passesGate(e, stats, profile));
  if (pool.length === 0) return [];

  const picked: Episode[] = [];
  const used = new Set<string>();

  const takeOne = (predicate: (e: Episode) => boolean) => {
    const candidates = pool.filter((e) => !used.has(e.id) && predicate(e));
    if (candidates.length) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      picked.push(chosen);
      used.add(chosen.id);
    }
  };

  const tg = topGoalTag(profile);
  if (tg) {
    takeOne((e) => e.tags.map((t) => String(t).toLowerCase()).includes(tg));
  }

  const interestTags = Array.from(professionAndHobbyTags(profile));
  if (interestTags.length) {
    takeOne((e) =>
      e.tags.some((t) => interestTags.includes(String(t).toLowerCase()))
    );
  }

  takeOne(() => true);

  const need = Math.min(3, pool.length);
  if (picked.length < need) {
    const rest = shuffle(pool.filter((e) => !used.has(e.id))).slice(
      0,
      need - picked.length
    );
    for (const r of rest) {
      picked.push(r);
      used.add(r.id);
    }
  }

  if (picked.length > 3) return picked.slice(0, 3);
  return picked;
}