import { create } from "zustand";
import type { Episode, Deltas, Stats } from "../lib/scenarioEngine";
import { applyChoice, pickDailyEpisodes } from "../lib/scenarioEngine";
import type { Profile } from "./useProfileStore";

type State = {
  dark: boolean;
  avatarUrl: string | null;
  avatarCreatedAt: string | null;
  loggedIn: boolean;

  // Debug panel UI state
  debugPanelOpen: boolean;
  debugActiveTab: 'navigation' | 'avatar';

  // Animation state (used by AvatarViewer and DebugPanel)
  animationActiveKey: string; // e.g. 'idle1'
  animationAutoSwitchIdle: boolean;

  // Game/feed state
  stats: Stats;
  currentDay: string | null; // YYYY-MM-DD
  dailyFeed: Episode[];
  dailyCompleted: string[]; // episode ids completed today
  dailyChoices: Record<string, { optionId: string; outcome: string; deltas: Deltas }>;
  dailyLog: Array<{ ts: string; episodeId: string; optionId: string; outcome: string; deltas: Deltas }>;
};

type Actions = {
  toggleDark: () => void;
  setDark: (v: boolean) => void;

  setAvatarUrl: (url: string | null) => void;
  setLoggedIn: (v: boolean) => void;

  setDebugPanelOpen: (open: boolean) => void;
  toggleDebugPanelOpen: () => void;
  setDebugActiveTab: (tab: 'navigation' | 'avatar') => void;

  setAnimationActiveKey: (key: string) => void;
  setAnimationAutoSwitchIdle: (v: boolean) => void;

  // Feed/game actions
  ensureDailyFeed: (profile: Profile, episodes: Episode[]) => void;
  selectOption: (episodeId: string, optionId: string, deltas: Deltas, outcome: string) => void;
  resetDay: () => void;
};

const initialAvatar =
  (typeof window !== "undefined" && localStorage.getItem("avatarUrl")) || null;
const initialAvatarCreatedAt =
  (typeof window !== "undefined" && localStorage.getItem("avatarCreatedAt")) || null;
const initialLoggedIn =
  typeof window !== "undefined" ? localStorage.getItem("loggedIn") === "true" : false;

const initialDebugOpen =
  (typeof window !== "undefined" && localStorage.getItem("debugPanelOpen") === "true") || false;
const initialDebugTab =
  ((typeof window !== "undefined" && (localStorage.getItem("debugActiveTab") as 'navigation' | 'avatar')) || 'navigation');
const initialAnimationKey =
  (typeof window !== "undefined" && localStorage.getItem("animationActiveKey")) || 'idle1';
const initialAnimationAutoSwitchIdle =
  typeof window !== "undefined" ? localStorage.getItem("animationAutoSwitchIdle") !== "false" : true;

// Feed/game persistent keys
const STATS_KEY = "app.stats";
const DAY_KEY = "app.currentDay";
const FEED_KEY = "app.dailyFeed";
const COMPLETED_KEY = "app.dailyCompleted";
const CHOICES_KEY = "app.dailyChoices";
const LOG_KEY = "app.dailyLog";

const parseJSON = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

const initialStats: Stats =
  typeof window !== "undefined"
    ? parseJSON<Stats>(localStorage.getItem(STATS_KEY), { eng: 5, soc: 5, crtv: 5, wealth: 5 })
    : { eng: 5, soc: 5, crtv: 5, wealth: 5 };

const storedDay = (typeof window !== "undefined" && localStorage.getItem(DAY_KEY)) || null;
const todayStr = () => new Date().toISOString().slice(0, 10);
const sameDay = storedDay === todayStr();

const initialDailyFeed: Episode[] =
  typeof window !== "undefined" && sameDay
    ? parseJSON<Episode[]>(localStorage.getItem(FEED_KEY), [])
    : [];

const initialDailyCompleted: string[] =
  typeof window !== "undefined" && sameDay
    ? parseJSON<string[]>(localStorage.getItem(COMPLETED_KEY), [])
    : [];

const initialDailyChoices: Record<string, { optionId: string; outcome: string; deltas: Deltas }> =
  typeof window !== "undefined" && sameDay
    ? parseJSON<Record<string, { optionId: string; outcome: string; deltas: Deltas }>>(
        localStorage.getItem(CHOICES_KEY),
        {}
      )
    : {};

const initialDailyLog:
  Array<{ ts: string; episodeId: string; optionId: string; outcome: string; deltas: Deltas }> =
  typeof window !== "undefined" && sameDay
    ? parseJSON(localStorage.getItem(LOG_KEY), [])
    : [];

export const useAppStore = create<State & Actions>((set, get) => ({
  dark: false,
  avatarUrl: initialAvatar,
  avatarCreatedAt: initialAvatarCreatedAt,
  loggedIn: initialLoggedIn,

  debugPanelOpen: initialDebugOpen,
  debugActiveTab: initialDebugTab,

  animationActiveKey: initialAnimationKey,
  animationAutoSwitchIdle: initialAnimationAutoSwitchIdle,

  // Feed/game state
  stats: initialStats,
  currentDay: sameDay ? storedDay : null,
  dailyFeed: initialDailyFeed,
  dailyCompleted: initialDailyCompleted,
  dailyChoices: initialDailyChoices,
  dailyLog: initialDailyLog,

  toggleDark: () => set((s) => ({ dark: !s.dark })),
  setDark: (v) => set({ dark: v }),

  setAvatarUrl: (url) => {
    const createdAt = url ? new Date().toISOString() : null;
    set({ avatarUrl: url, avatarCreatedAt: createdAt });
    if (typeof window !== "undefined") {
      if (url) {
        localStorage.setItem("avatarUrl", url);
        localStorage.setItem("avatarCreatedAt", createdAt!);
      } else {
        localStorage.removeItem("avatarUrl");
        localStorage.removeItem("avatarCreatedAt");
      }
    }
  },

  setLoggedIn: (v) => {
    set({ loggedIn: v });
    if (typeof window !== "undefined") {
      localStorage.setItem("loggedIn", String(v));
    }
  },

  setDebugPanelOpen: (open) => {
    set({ debugPanelOpen: open });
    if (typeof window !== "undefined") {
      localStorage.setItem("debugPanelOpen", String(open));
    }
  },

  toggleDebugPanelOpen: () =>
    set((s) => {
      const next = !s.debugPanelOpen;
      if (typeof window !== "undefined") {
        localStorage.setItem("debugPanelOpen", String(next));
      }
      return { debugPanelOpen: next };
    }),

  setDebugActiveTab: (tab) => {
    set({ debugActiveTab: tab });
    if (typeof window !== "undefined") {
      localStorage.setItem("debugActiveTab", tab);
    }
  },

  setAnimationActiveKey: (key) => {
    set({ animationActiveKey: key });
    if (typeof window !== "undefined") {
      localStorage.setItem("animationActiveKey", key);
    }
  },

  setAnimationAutoSwitchIdle: (v) => {
    set({ animationAutoSwitchIdle: v });
    if (typeof window !== "undefined") {
      localStorage.setItem("animationAutoSwitchIdle", String(v));
    }
  },

  ensureDailyFeed: (profile, episodes) => {
    const s = get();
    const today = todayStr();
    if (s.currentDay === today && s.dailyFeed.length > 0) return;
    const picked = pickDailyEpisodes(profile, s.stats, episodes);
    set({
      currentDay: today,
      dailyFeed: picked,
      dailyCompleted: [],
      dailyChoices: {},
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(DAY_KEY, today);
      localStorage.setItem(FEED_KEY, JSON.stringify(picked));
      localStorage.setItem(COMPLETED_KEY, JSON.stringify([]));
      localStorage.setItem(CHOICES_KEY, JSON.stringify({}));
    }
  },

  selectOption: (episodeId, optionId, deltas, outcome) => {
    const s = get();
    if (s.dailyCompleted.includes(episodeId)) return;
    const nextStats = applyChoice(s.stats, deltas);
    const entry = {
      ts: new Date().toISOString(),
      episodeId,
      optionId,
      outcome,
      deltas,
    };
    const nextCompleted = [...s.dailyCompleted, episodeId];
    const nextChoices = {
      ...s.dailyChoices,
      [episodeId]: { optionId, outcome, deltas },
    };
    const nextLog = [...s.dailyLog, entry];
    set({
      stats: nextStats,
      dailyCompleted: nextCompleted,
      dailyChoices: nextChoices,
      dailyLog: nextLog,
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(STATS_KEY, JSON.stringify(nextStats));
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(nextCompleted));
      localStorage.setItem(CHOICES_KEY, JSON.stringify(nextChoices));
      localStorage.setItem(LOG_KEY, JSON.stringify(nextLog));
    }
  },

  resetDay: () => {
    set({
      currentDay: null,
      dailyFeed: [],
      dailyCompleted: [],
      dailyChoices: {},
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem(DAY_KEY);
      localStorage.removeItem(FEED_KEY);
      localStorage.removeItem(COMPLETED_KEY);
      localStorage.removeItem(CHOICES_KEY);
    }
  },
}));
