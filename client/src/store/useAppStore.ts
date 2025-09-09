import { create } from "zustand";

type State = {
  dark: boolean;
  avatarUrl: string | null;
  avatarCreatedAt: string | null;
  onboardingDone: boolean;
  loggedIn: boolean;
};

type Actions = {
  toggleDark: () => void;
  setDark: (v: boolean) => void;

  setAvatarUrl: (url: string | null) => void;
  setOnboardingDone: (v: boolean) => void;
  setLoggedIn: (v: boolean) => void;
};

const initialAvatar =
  (typeof window !== "undefined" && localStorage.getItem("avatarUrl")) || null;
const initialAvatarCreatedAt =
  (typeof window !== "undefined" && localStorage.getItem("avatarCreatedAt")) || null;
const initialOnboarding =
  typeof window !== "undefined" ? localStorage.getItem("onboardingDone") === "true" : false;
const initialLoggedIn =
  typeof window !== "undefined" ? localStorage.getItem("loggedIn") === "true" : false;

export const useAppStore = create<State & Actions>((set) => ({
  dark: false,
  avatarUrl: initialAvatar,
  avatarCreatedAt: initialAvatarCreatedAt,
  onboardingDone: initialOnboarding,
  loggedIn: initialLoggedIn,

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

  setOnboardingDone: (v) => {
    set({ onboardingDone: v });
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingDone", String(v));
    }
  },

  setLoggedIn: (v) => {
    set({ loggedIn: v });
    if (typeof window !== "undefined") {
      localStorage.setItem("loggedIn", String(v));
    }
  },
}));
