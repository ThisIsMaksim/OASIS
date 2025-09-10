import { create } from "zustand";

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

export const useAppStore = create<State & Actions>((set) => ({
  dark: false,
  avatarUrl: initialAvatar,
  avatarCreatedAt: initialAvatarCreatedAt,
  loggedIn: initialLoggedIn,

  debugPanelOpen: initialDebugOpen,
  debugActiveTab: initialDebugTab,

  animationActiveKey: initialAnimationKey,
  animationAutoSwitchIdle: initialAnimationAutoSwitchIdle,

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
}));
