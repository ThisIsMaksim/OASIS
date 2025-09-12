import { create } from "zustand";

type SocialLinks = {
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  telegram?: string;
};

export type IncomeLevel = "low" | "med" | "high";
export type Schedule = "day" | "night";
export type FamilyStatus = "single" | "relationship";

export type MonthlyGoals = {
  health: 0 | 1 | 2 | 3;
  social: 0 | 1 | 2 | 3;
  creative: 0 | 1 | 2 | 3;
  wealth: 0 | 1 | 2 | 3;
};

export type Traits = {
  risk: number; // 0..1
  extrovert: number; // 0..1
  discipline: number; // 0..1
};

export type Profile = {
  firstName: string;
  lastName: string;
  interests: string[]; // comma-separated in UI, stored as array
  profession: string;
  city: string;
  birthDate: string | null; // ISO date (YYYY-MM-DD)
  bio: string;
  socials: SocialLinks;

  // New fields
  incomeLevel: IncomeLevel;
  schedule: Schedule;
  familyStatus: FamilyStatus;
  hobbies: string[];
  monthlyGoals: MonthlyGoals;
  traits: Traits;
  taboos: string[];

  updatedAt: string | null;
};

type Actions = {
  setProfile: (p: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetProfile: () => void;
};

const defaultProfile: Profile = {
  firstName: "",
  lastName: "",
  interests: [],
  profession: "",
  city: "",
  birthDate: null,
  bio: "",
  socials: {},

  incomeLevel: "med",
  schedule: "day",
  familyStatus: "single",
  hobbies: [],
  monthlyGoals: { health: 0, social: 0, creative: 0, wealth: 0 },
  traits: { risk: 0.5, extrovert: 0.5, discipline: 0.5 },
  taboos: [],

  updatedAt: null,
};

const STORAGE_KEY = "profile";

export const useProfileStore = create<Profile & Actions>((set, get) => {
  let initial: Profile = defaultProfile;
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        initial = { ...defaultProfile, ...parsed };
      } catch {
        // ignore parse errors
      }
    }
  }

  const persist = (state: Profile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  return {
    ...initial,
    setProfile: (p) => {
      const next: Profile = {
        ...defaultProfile,
        ...p,
        updatedAt: new Date().toISOString(),
      };
      set(next);
      persist(next);
    },
    updateProfile: (patch) => {
      const current = get();
      const next: Profile = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      set(next);
      persist(next);
    },
    resetProfile: () => {
      const next: Profile = {
        ...defaultProfile,
        updatedAt: new Date().toISOString(),
      };
      set(next);
      persist(next);
    },
  };
});