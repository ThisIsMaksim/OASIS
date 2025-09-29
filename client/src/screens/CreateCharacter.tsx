import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input } from "../components";
import {
  useProfileStore,
  type Profile,
  type IncomeLevel,
  type Schedule,
  type FamilyStatus,
} from "../store/useProfileStore";
import { z } from "zod";
import { useAppStore } from "../store/useAppStore";

// Подсказки по профессиям для datalist
const PROFESSIONS = [
  "Инженер",
  "Дизайнер",
  "Программист",
  "Предприниматель",
  "Маркетолог",
  "Продукт-менеджер",
  "Аналитик",
  "Фотограф",
  "Музыкант",
  "Автор",
  "Студент",
  "Другое",
];

// Каталог интересов для выбора «баблами»
const INTERESTS_CATALOG = [
  "Running",
  "Dance",
  "Gaming",
  "Music",
  "Art",
  "Photography",
  "Cooking",
  "Movies",
  "Reading",
  "Travel",
  "Fitness",
  "Yoga",
  "Meditation",
  "Programming",
  "AI",
  "VR/AR",
  "Design",
  "Product",
  "Startups",
  "Finance",
  "Investing",
  "Languages",
  "Board games",
  "Nature",
  "Cycling",
];

// Табу
const TABOOS = [
  { key: "alcohol", label: "Алкоголь" },
  { key: "politics", label: "Политика" },
  { key: "nsfw", label: "NSFW" },
  { key: "religion", label: "Религия" },
  { key: "drugs", label: "Наркотики" },
  { key: "gambling", label: "Азартные игры" },
] as const;

type FormState = {
  firstName: string;
  lastName: string;
  profession: string;
  city: string;
  birthDate: string;
  bio: string;

  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  telegram?: string;

  incomeLevel: IncomeLevel;
  schedule: Schedule;
  familyStatus: FamilyStatus;
  hobbies: string[];

  // interests теперь как массив (для «баблов»)
  interests: string[];

  monthlyGoals: { health: 0 | 1 | 2 | 3; social: 0 | 1 | 2 | 3; creative: 0 | 1 | 2 | 3; wealth: 0 | 1 | 2 | 3 };
  traits: { risk: number; extrovert: number; discipline: number };
  taboos: string[];
};

// Базовая схема полного профиля (валидация Zod)
const ProfileFormSchema = z.object({
  firstName: z.string().trim().min(1, "Укажите имя"),
  lastName: z.string().trim().min(1, "Укажите фамилию"),
  profession: z.string().trim().min(1, "Укажите профессию"),
  city: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  bio: z.string().optional().default(""),

  website: z.string().url("Неверный URL").optional().or(z.literal("")),
  twitter: z.string().url("Неверный URL").optional().or(z.literal("")),
  instagram: z.string().url("Неверный URL").optional().or(z.literal("")),
  facebook: z.string().url("Неверный URL").optional().or(z.literal("")),
  linkedin: z.string().url("Неверный URL").optional().or(z.literal("")),
  telegram: z.string().url("Неверный URL").optional().or(z.literal("")),

  incomeLevel: z.enum(["low", "med", "high"]),
  schedule: z.enum(["day", "night"]),
  familyStatus: z.enum(["single", "relationship"]),
  hobbies: z.array(z.string().min(1)).max(100).default([]),

  // interests — массив строк (без минимального количества)
  interests: z.array(z.string().min(1)).max(200).default([]),

  monthlyGoals: z.object({
    health: z.number().int().min(0).max(3),
    social: z.number().int().min(0).max(3),
    creative: z.number().int().min(0).max(3),
    wealth: z.number().int().min(0).max(3),
  }),
  traits: z.object({
    risk: z.number().min(0).max(1),
    extrovert: z.number().min(0).max(1),
    discipline: z.number().min(0).max(1),
  }),
  taboos: z
    .array(
      z.enum(
        TABOOS.map((t) => t.key) as unknown as ["alcohol", "politics", "nsfw", "religion", "drugs", "gambling"]
      )
    )
    .default([]),
});

// Подсхема первого шага (валидируем обязательные поля и social URLs)
const BaseStepSchema = z.object({
  firstName: z.string().trim().min(1, "Укажите имя"),
  lastName: z.string().trim().min(1, "Укажите фамилию"),
  profession: z.string().trim().min(1, "Укажите профессию"),

  website: z.string().url("Неверный URL").optional().or(z.literal("")),
  twitter: z.string().url("Неверный URL").optional().or(z.literal("")),
  instagram: z.string().url("Неверный URL").optional().or(z.literal("")),
  facebook: z.string().url("Неверный URL").optional().or(z.literal("")),
  linkedin: z.string().url("Неверный URL").optional().or(z.literal("")),
  telegram: z.string().url("Неверный URL").optional().or(z.literal("")),
});

function toFormState(p: Profile): FormState {
  return {
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    profession: p.profession ?? "",
    city: p.city ?? "",
    birthDate: p.birthDate ?? "",
    bio: p.bio ?? "",

    website: p.socials?.website ?? "",
    twitter: p.socials?.twitter ?? "",
    instagram: p.socials?.instagram ?? "",
    facebook: p.socials?.facebook ?? "",
    linkedin: p.socials?.linkedin ?? "",
    telegram: p.socials?.telegram ?? "",

    incomeLevel: p.incomeLevel ?? "med",
    schedule: p.schedule ?? "day",
    familyStatus: p.familyStatus ?? "single",
    hobbies: p.hobbies ?? [],

    interests: p.interests ?? [],

    monthlyGoals: {
      health: p.monthlyGoals?.health ?? 0,
      social: p.monthlyGoals?.social ?? 0,
      creative: p.monthlyGoals?.creative ?? 0,
      wealth: p.monthlyGoals?.wealth ?? 0,
    },
    traits: {
      risk: p.traits?.risk ?? 0.5,
      extrovert: p.traits?.extrovert ?? 0.5,
      discipline: p.traits?.discipline ?? 0.5,
    },
    taboos: p.taboos ?? [],
  };
}

const FieldLabel: React.FC<{ title: string; hint?: string; required?: boolean }> = ({ title, hint, required }) => (
  <div className="mb-1 flex items-center justify-between">
    <label className="text-xs font-medium text-white/80">
      {title} {required ? <span className="text-rose-300">*</span> : null}
    </label>
    {hint ? <span className="text-[10px] text-white/50">{hint}</span> : null}
  </div>
);

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={["glass rounded-2xl border p-4 text-white", className ?? ""].join(" ")}>{children}</div>
);

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => {
  const base = [
    "flex min-h-[96px] w-full rounded-xl px-4 py-3 text-sm transition-all duration-200",
    "border backdrop-blur-sm",
    "bg-black/30 hover:bg-black/40 focus:bg-black/40",
    "border-white/20 hover:border-white/30 focus:border-white/40",
    "text-white placeholder:text-white/40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" ");
  return <textarea className={[base, className ?? ""].join(" ")} {...props} />;
};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  const base = [
    "flex h-11 w-full rounded-xl px-4 py-2 text-sm transition-all duration-200",
    "border backdrop-blur-sm",
    "bg-black/30 hover:bg-black/40 focus:bg-black/40",
    "border-white/20 hover:border-white/30 focus:border-white/40",
    "text-white",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" ");
  return (
    <select className={[base, className ?? ""].join(" ")} {...props}>
      {children}
    </select>
  );
};

const Bubble: React.FC<{
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "rounded-full border px-4 py-2 text-sm transition-all",
      active
        ? "border-white/40 bg-white/20 text-white shadow-[0_0_0_2px_rgba(255,255,255,0.15)_inset]"
        : "border-white/20 bg-white/5 text-white/90 hover:bg-white/10",
    ].join(" ")}
  >
    {children}
  </button>
);

const CreateCharacter: React.FC = () => {
  const navigate = useNavigate();
  const setLoggedIn = useAppStore((s) => s.setLoggedIn);

  const profile = useProfileStore((s) => ({
    firstName: s.firstName,
    lastName: s.lastName,
    profession: s.profession,
    city: s.city,
    birthDate: s.birthDate,
    bio: s.bio,
    socials: s.socials,

    incomeLevel: s.incomeLevel,
    schedule: s.schedule,
    familyStatus: s.familyStatus,
    hobbies: s.hobbies,

    interests: s.interests,

    monthlyGoals: s.monthlyGoals,
    traits: s.traits,
    taboos: s.taboos,

    updatedAt: s.updatedAt,
  })) as Profile;

  const updateProfile = useProfileStore((s) => s.updateProfile);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [form, setForm] = useState<FormState>(toFormState(profile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hobbyDraft, setHobbyDraft] = useState("");
  const [interestDraft, setInterestDraft] = useState("");
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const isEdit = useMemo(() => Boolean(profile.updatedAt), [profile.updatedAt]);

  const [searchParams, setSearchParams] = useSearchParams();

  // Чтение шага из URL и нормализация отсутствующего/некорректного значения
  useEffect(() => {
    const raw = searchParams.get("step");
    const n = raw ? parseInt(raw, 10) : NaN;

    if (Number.isNaN(n)) {
      // Если параметр отсутствует — нормализуем URL до step=1 один раз
      setSearchParams({ step: "1" }, { replace: true });
      return;
    }

    if (n < 1) {
      setSearchParams({ step: "1" }, { replace: true });
      return;
    }

    if (n > 6) {
      setSearchParams({ step: "6" }, { replace: true });
      return;
    }

    const casted = n as 1 | 2 | 3 | 4 | 5 | 6;
    if (step !== casted) {
      setStep(casted);
    }
  }, [searchParams, setSearchParams, step]);

  // Запись шага в URL выполняется только в обработчиках Next/Prev и при внешней навигации (DebugPanel).


  // Валидация всего профиля
  const fullParse = useMemo(() => ProfileFormSchema.safeParse(form), [form]);
  const isFormValid = fullParse.success;

  // Валидация шага 1
  const baseStepParse = useMemo(
    () =>
      BaseStepSchema.safeParse({
        firstName: form.firstName,
        lastName: form.lastName,
        profession: form.profession,
        website: form.website ?? "",
        twitter: form.twitter ?? "",
        instagram: form.instagram ?? "",
        facebook: form.facebook ?? "",
        linkedin: form.linkedin ?? "",
        telegram: form.telegram ?? "",
      }),
    [
      form.firstName,
      form.lastName,
      form.profession,
      form.website,
      form.twitter,
      form.instagram,
      form.facebook,
      form.linkedin,
      form.telegram,
    ]
  );
  const isBaseStepValid = baseStepParse.success;

  useEffect(() => {
    // Если стор обновился вне формы, синхронизируем
    setForm(toFormState(profile));
  }, [
    profile.firstName,
    profile.lastName,
    profile.profession,
    profile.city,
    profile.birthDate,
    profile.bio,
    profile.socials,

    profile.incomeLevel,
    profile.schedule,
    profile.familyStatus,
    profile.hobbies,

    profile.interests,

    profile.monthlyGoals,
    profile.traits,
    profile.taboos,
    profile.updatedAt,
  ]);

  const onChange = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const setErrorsFromIssues = (issues: z.ZodIssue[], keys: string[]) => {
    const zodErrs: Record<string, string> = {};
    for (const issue of issues) {
      const path = issue.path.join(".");
      if (keys.includes(path) && !zodErrs[path]) {
        zodErrs[path] = issue.message;
      }
    }
    setErrors((prev) => ({
      ...Object.fromEntries(Object.entries(prev).filter(([k]) => !keys.includes(k))),
      ...zodErrs,
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!isBaseStepValid) {
        if (!baseStepParse.success) {
          setErrorsFromIssues(baseStepParse.error.issues, [
            "firstName",
            "lastName",
            "profession",
            "website",
            "twitter",
            "instagram",
            "facebook",
            "linkedin",
            "telegram",
          ]);
        }
        return;
      }
    }
    setStep((s) => {
      const next = s < 6 ? ((s + 1) as 1 | 2 | 3 | 4 | 5 | 6) : s;
      if (next !== s) {
        setSearchParams({ step: String(next) }, { replace: true });
      }
      return next;
    });
  };

  const handlePrev = () => {
    setStep((s) => {
      const prev = s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5 | 6) : s;
      if (prev !== s) {
        setSearchParams({ step: String(prev) }, { replace: true });
      }
      return prev;
    });
  };

  const addHobby = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (form.hobbies.includes(v)) return;
    onChange({ hobbies: [...form.hobbies, v] });
    setHobbyDraft("");
  };

  const removeHobby = (value: string) => {
    onChange({ hobbies: form.hobbies.filter((h) => h !== value) });
  };

  const toggleTaboo = (key: string) => {
    if (form.taboos.includes(key)) {
      onChange({ taboos: form.taboos.filter((t) => t !== key) });
    } else {
      onChange({ taboos: [...form.taboos, key] });
    }
  };

  const toggleInterest = (name: string) => {
    if (form.interests.includes(name)) {
      onChange({ interests: form.interests.filter((x) => x !== name) });
    } else {
      onChange({ interests: [...form.interests, name] });
    }
  };

  const addInterest = (value: string) => {
    const v = value.trim();
    if (!v) return;
    if (form.interests.includes(v)) return;
    onChange({ interests: [...form.interests, v] });
    setInterestDraft("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // На финальном шаге валидируем всю форму
    if (!isFormValid) {
      if (!fullParse.success) {
        // Выведем видимые ошибки для базовых полей + ссылок
        setErrorsFromIssues(fullParse.error.issues, [
          "firstName",
          "lastName",
          "profession",
          "website",
          "twitter",
          "instagram",
          "facebook",
          "linkedin",
          "telegram",
        ]);
      }
      return;
    }

    const next: Profile = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      profession: form.profession.trim(),
      city: form.city.trim(),
      birthDate: form.birthDate || null,
      bio: form.bio.trim(),
      socials: {
        website: form.website?.trim() || undefined,
        twitter: form.twitter?.trim() || undefined,
        instagram: form.instagram?.trim() || undefined,
        facebook: form.facebook?.trim() || undefined,
        linkedin: form.linkedin?.trim() || undefined,
        telegram: form.telegram?.trim() || undefined,
      },

      incomeLevel: form.incomeLevel,
      schedule: form.schedule,
      familyStatus: form.familyStatus,
      hobbies: form.hobbies,

      interests: form.interests,

      monthlyGoals: {
        health: form.monthlyGoals.health,
        social: form.monthlyGoals.social,
        creative: form.monthlyGoals.creative,
        wealth: form.monthlyGoals.wealth,
      },
      traits: {
        risk: form.traits.risk,
        extrovert: form.traits.extrovert,
        discipline: form.traits.discipline,
      },
      taboos: form.taboos,

      updatedAt: null,
    };

    if (isEdit) {
      updateProfile(next);
    } else {
      setProfile(next);
    }

    // После успешного сохранения профиля считаем пользователя онборженным
    setLoggedIn(true);

    navigate("/home", { replace: true });
  };

  // Контент шагов
  const Step1 = (
    <>
      <GlassCard>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <FieldLabel title="Имя" required />
            <Input
              placeholder="Иван"
              value={form.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              aria-invalid={Boolean(errors.firstName)}
            />
            {errors.firstName ? <div className="mt-1 text-xs text-rose-300">{errors.firstName}</div> : null}
          </div>
          <div>
            <FieldLabel title="Фамилия" required />
            <Input
              placeholder="Иванов"
              value={form.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              aria-invalid={Boolean(errors.lastName)}
            />
            {errors.lastName ? <div className="mt-1 text-xs text-rose-300">{errors.lastName}</div> : null}
          </div>
        </div>

        <div className="mt-3">
          <FieldLabel title="Профессия" required />
          <Input
            list="profession-list"
            placeholder="Product designer"
            value={form.profession}
            onChange={(e) => onChange({ profession: e.target.value })}
            aria-invalid={Boolean(errors.profession)}
          />
          <datalist id="profession-list">
            {PROFESSIONS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          {errors.profession ? <div className="mt-1 text-xs text-rose-300">{errors.profession}</div> : null}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <FieldLabel title="Город" />
            <Input placeholder="Москва" value={form.city} onChange={(e) => onChange({ city: e.target.value })} />
          </div>
          <div>
            <FieldLabel title="Дата рождения" hint="ГГГГ-ММ-ДД" />
            <Input type="date" value={form.birthDate} onChange={(e) => onChange({ birthDate: e.target.value })} />
          </div>
        </div>

        <div className="mt-3">
          <FieldLabel title="О себе" />
          <TextArea
            placeholder="Коротко расскажите о себе"
            value={form.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
          />
        </div>
      </GlassCard>
    </>
  );

  const Step2 = (
    <GlassCard>
      <div className="mb-2 text-sm font-medium text-white">Образ жизни</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <FieldLabel title="Доход" />
          <div className="flex gap-3 text-sm">
            {[
              { key: "low", label: "Low" },
              { key: "med", label: "Med" },
              { key: "high", label: "High" },
            ].map((o) => (
              <label key={o.key} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="incomeLevel"
                  className="accent-white"
                  checked={form.incomeLevel === (o.key as IncomeLevel)}
                  onChange={() => onChange({ incomeLevel: o.key as IncomeLevel })}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel title="График" />
          <div className="flex gap-3 text-sm">
            {[
              { key: "day", label: "Дневной" },
              { key: "night", label: "Ночной" },
            ].map((o) => (
              <label key={o.key} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="schedule"
                  className="accent-white"
                  checked={form.schedule === (o.key as Schedule)}
                  onChange={() => onChange({ schedule: o.key as Schedule })}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel title="Семейный статус" />
          <div className="flex gap-3 text-sm">
            {[
              { key: "single", label: "Single" },
              { key: "relationship", label: "Relationship" },
            ].map((o) => (
              <label key={o.key} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="familyStatus"
                  className="accent-white"
                  checked={form.familyStatus === (o.key as FamilyStatus)}
                  onChange={() => onChange({ familyStatus: o.key as FamilyStatus })}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel title="Хобби" hint="введите и нажмите Enter" />
          <Input
            placeholder="running, dance, gaming"
            value={hobbyDraft}
            onChange={(e) => setHobbyDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addHobby(hobbyDraft);
              }
            }}
          />
          {form.hobbies.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.hobbies.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs"
                >
                  {h}
                  <button
                    type="button"
                    onClick={() => removeHobby(h)}
                    className="text-white/70 hover:text-white"
                    aria-label={`Удалить ${h}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );

  const Step3 = (
    <>
      <GlassCard>
        <div className="mb-2 text-sm font-medium text-white">Цели на месяц</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { key: "health", label: "Здоровье" },
            { key: "social", label: "Социальные" },
            { key: "creative", label: "Креатив" },
            { key: "wealth", label: "Благосостояние" },
          ].map((g) => (
            <div key={g.key}>
              <FieldLabel title={g.label} />
              <Select
                value={String((form.monthlyGoals as any)[g.key])}
                onChange={(e) =>
                  onChange({
                    monthlyGoals: {
                      ...form.monthlyGoals,
                      [g.key]: Math.max(0, Math.min(3, parseInt(e.target.value, 10))) as 0 | 1 | 2 | 3,
                    } as FormState["monthlyGoals"],
                  })
                }
              >
                {[0, 1, 2, 3].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-2 text-sm font-medium text-white">Черты</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { key: "risk", label: "Риск" },
            { key: "extrovert", label: "Экстраверт" },
            { key: "discipline", label: "Дисциплина" },
          ].map((t) => (
            <div key={t.key}>
              <FieldLabel title={`${t.label}: ${((form.traits as any)[t.key] as number).toFixed(2)}`} />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={(form.traits as any)[t.key]}
                onChange={(e) =>
                  onChange({
                    traits: {
                      ...form.traits,
                      [t.key]: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-white"
              />
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );

  const Step4 = (
    <GlassCard>
      <div className="mb-2 text-sm font-medium text-white">Интересы</div>
      <div className="mb-3 text-xs text-white/70">Выбирайте интересы кликом по «баблам».</div>
      <div className="flex flex-wrap gap-2">
        {INTERESTS_CATALOG.map((name) => (
          <Bubble key={name} active={form.interests.includes(name)} onClick={() => toggleInterest(name)}>
            {name}
          </Bubble>
        ))}
      </div>

      <div className="mt-4">
        <FieldLabel title="Добавить свой интерес" hint="введите и нажмите Enter" />
        <Input
          placeholder="Например: Architecture"
          value={interestDraft}
          onChange={(e) => setInterestDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addInterest(interestDraft);
            }
          }}
        />
        {form.interests.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.interests.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs"
              >
                {h}
                <button
                  type="button"
                  onClick={() => toggleInterest(h)}
                  className="text-white/70 hover:text-white"
                  aria-label={`Убрать ${h}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </GlassCard>
  );

  const Step5 = (
    <GlassCard>
      <div className="mb-2 text-sm font-medium text-white">Табу</div>
      <div className="mb-3 text-xs text-white/70">Выберите темы, которых стоит избегать.</div>
      <div className="flex flex-wrap gap-2">
        {TABOOS.map((t) => (
          <Bubble key={t.key} active={form.taboos.includes(t.key)} onClick={() => toggleTaboo(t.key)}>
            {t.label}
          </Bubble>
        ))}
      </div>
    </GlassCard>
  );

  const Step6 = (
    <GlassCard>
      <div className="mb-2 text-sm font-medium text-white">Социальные сети</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <FieldLabel title="Website" />
          <Input
            placeholder="https://example.com"
            value={form.website}
            onChange={(e) => onChange({ website: e.target.value })}
            aria-invalid={Boolean(errors.website) && submitted}
          />
          {submitted && errors.website ? <div className="mt-1 text-xs text-rose-300">{errors.website}</div> : null}
        </div>
        <div>
          <FieldLabel title="Twitter / X" />
          <Input
            placeholder="https://x.com/username"
            value={form.twitter}
            onChange={(e) => onChange({ twitter: e.target.value })}
            aria-invalid={Boolean(errors.twitter) && submitted}
          />
          {submitted && errors.twitter ? <div className="mt-1 text-xs text-rose-300">{errors.twitter}</div> : null}
        </div>
        <div>
          <FieldLabel title="Instagram" />
          <Input
            placeholder="https://instagram.com/username"
            value={form.instagram}
            onChange={(e) => onChange({ instagram: e.target.value })}
            aria-invalid={Boolean(errors.instagram) && submitted}
          />
          {submitted && errors.instagram ? <div className="mt-1 text-xs text-rose-300">{errors.instagram}</div> : null}
        </div>
        <div>
          <FieldLabel title="Facebook" />
          <Input
            placeholder="https://facebook.com/username"
            value={form.facebook}
            onChange={(e) => onChange({ facebook: e.target.value })}
            aria-invalid={Boolean(errors.facebook) && submitted}
          />
          {submitted && errors.facebook ? <div className="mt-1 text-xs text-rose-300">{errors.facebook}</div> : null}
        </div>
        <div>
          <FieldLabel title="LinkedIn" />
          <Input
            placeholder="https://linkedin.com/in/username"
            value={form.linkedin}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            aria-invalid={Boolean(errors.linkedin) && submitted}
          />
          {submitted && errors.linkedin ? <div className="mt-1 text-xs text-rose-300">{errors.linkedin}</div> : null}
        </div>
        <div>
          <FieldLabel title="Telegram" />
          <Input
            placeholder="https://t.me/username"
            value={form.telegram}
            onChange={(e) => onChange({ telegram: e.target.value })}
            aria-invalid={Boolean(errors.telegram) && submitted}
          />
          {submitted && errors.telegram ? <div className="mt-1 text-xs text-rose-300">{errors.telegram}</div> : null}
        </div>
      </div>
    </GlassCard>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return Step1;
      case 2:
        return Step2;
      case 3:
        return Step3;
      case 4:
        return Step4;
      case 5:
        return Step5;
      case 6:
        return Step6;
      default:
        return null;
    }
  };

  const stepTitle = () => {
    switch (step) {
      case 1:
        return "Базовые данные";
      case 2:
        return "Образ жизни";
      case 3:
        return "Цели и черты";
      case 4:
        return "Интересы";
      case 5:
        return "Табу";
      case 6:
        return "Социальные сети";
    }
  };

  const isStepValid = () => {
    if (step === 1) return isBaseStepValid;
    if (step === 6) return isFormValid; // финальный шаг — вся форма
    return true; // остальные шаги контролируются UI и имеют дефолтно валидные значения
  };

  return (
    <div className="h-dvh w-full p-4 text-white">
      <div className="mx-auto flex h-full w-full max-w-xl flex-col gap-4">
        <div className="glass flex items-center justify-between rounded-2xl border px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/70">
              {isEdit ? "Редактирование" : "Создание"} персонажа
            </div>
            <div className="text-xl font-semibold">Профиль аватара</div>
            <div className="mt-1 text-xs text-white/60">
              Шаг {step} из 6 • {stepTitle()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Назад
            </Button>
            {/* Убрали отображение аватара и переход в 3D-редактор оставили как было при необходимости */}
          </div>
        </div>

        {/* Многошаговая форма без блока аватара */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pb-4">
          {renderStep()}

          <div className="sticky bottom-0 z-10 mt-2 flex gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/home")}>
              Отмена
            </Button>
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrev}>
                Назад
              </Button>
            ) : null}
            {step < 6 ? (
              <Button type="button" onClick={handleNext} disabled={!isStepValid()}>
                Продолжить
              </Button>
            ) : (
              <Button type="submit" disabled={!isStepValid()}>
                Сохранить
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCharacter;