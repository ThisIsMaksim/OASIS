import type { Episode } from "../lib/scenarioEngine";

export const localEpisodes: Episode[] = [
  {
    id: "ep_run_01",
    tags: ["health", "outdoor", "boxing"],
    gate: { minStats: { eng: 3 }, tabooNotContains: ["nsfw"] },
    scene: "Утро. В парке начинается открытая тренировка по боксу.",
    options: [
      { id: "A", label: "Присоединиться", deltas: { eng: 2, soc: 1, crtv: 0, wealth: 0 } },
      { id: "B", label: "Посмотреть и уйти", deltas: { eng: 0, soc: 0, crtv: 0, wealth: 0 } }
    ],
    outcomes: {
      A: "Тебя хвалят за стойку, знакомство с тренером.",
      B: "Лёгкая ностальгия, планируешь прийти позже."
    },
    share_caption: "Первый спарринг!"
  },
  {
    id: "ep_code_meetup_01",
    tags: ["career", "tech", "social"],
    gate: { minStats: { soc: 1 }, tabooNotContains: ["nsfw"] },
    scene: "Вечерний митап разработчиков в коворкинге. Лёгкий нетворкинг и доклады.",
    options: [
      { id: "A", label: "Задать вопрос спикеру и представиться", deltas: { soc: 2, wealth: 0, eng: 0, crtv: 0 } },
      { id: "B", label: "Тихо послушать доклад и уйти", deltas: { crtv: 1, soc: 0, eng: 0, wealth: 0 } }
    ],
    outcomes: {
      A: "Обменялись контактами, тебя пригласили в закрытый чат.",
      B: "Поймал пару идей, записал тезисы для себя."
    },
    share_caption: "Новый контакт в индустрии"
  },
  {
    id: "ep_art_jam_01",
    tags: ["creative", "social", "indoor", "art"],
    gate: { minStats: { crtv: 1 }, tabooNotContains: ["nsfw"] },
    scene: "Тусовка иллюстраторов в студии — свободный джем с музыкой.",
    options: [
      { id: "A", label: "Нарисовать мини-комикс за 30 минут", deltas: { crtv: 2, soc: 1, eng: 0, wealth: 0 } },
      { id: "B", label: "Пообщаться и посмотреть работы", deltas: { soc: 1, crtv: 1, eng: 0, wealth: 0 } }
    ],
    outcomes: {
      A: "Твой скетч заметили, зовут поучаствовать в коллабе.",
      B: "Пара полезных знакомств и вдохновляющие референсы."
    },
    share_caption: "Скетч-джем удался"
  },
  {
    id: "ep_budget_review_01",
    tags: ["wealth", "indoor", "career", "planning"],
    gate: { minStats: { wealth: 0 }, tabooNotContains: ["nsfw"] },
    scene: "Вечер дома. Таблицы расходов открыты, кофе остывает.",
    options: [
      { id: "A", label: "Пересобрать бюджет и урезать лишнее", deltas: { wealth: 2, eng: -1, soc: 0, crtv: 0 } },
      { id: "B", label: "Оставить всё как есть", deltas: { wealth: 0, eng: 0, soc: 0, crtv: 0 } }
    ],
    outcomes: {
      A: "Нашёл лишние подписки, экономия на месяц вперёд.",
      B: "Стабильность — тоже результат. Вернёшься к вопросу позже."
    },
    share_caption: "Апгрейд личных финансов"
  },
  {
    id: "ep_calm_walk_01",
    tags: ["health", "outdoor", "mindful"],
    scene: "После работы близится закат. Рядом тихая набережная.",
    options: [
      { id: "A", label: "Быстрым шагом 20 минут", deltas: { eng: 1, soc: 0, crtv: 0, wealth: 0 } },
      { id: "B", label: "Сесть на лавку и подышать", deltas: { crtv: 1, eng: 0, soc: 0, wealth: 0 } }
    ],
    outcomes: {
      A: "Тело благодарит. Настроение ровнее.",
      B: "Мысли выровнялись, заметил красивый свет на воде."
    },
    share_caption: "Дыхание и закат"
  },
  {
    id: "ep_volunteer_01",
    tags: ["social", "health", "outdoor", "community"],
    gate: { minStats: { soc: 2 }, tabooNotContains: ["nsfw"] },
    scene: "Субботник во дворе: уборка и озеленение с соседями.",
    options: [
      { id: "A", label: "Взять на себя организацию инвентаря", deltas: { soc: 2, eng: 1, wealth: 0, crtv: 0 } },
      { id: "B", label: "Поддержать рублём дистанционно", deltas: { wealth: -1, soc: 1, eng: 0, crtv: 0 } }
    ],
    outcomes: {
      A: "Все прошло организованно, тебя поблагодарили на собрании.",
      B: "Внес вклад, а в чате тебя отметили как спонсора."
    },
    share_caption: "Двор стал чище"
  },
  {
    id: "ep_read_book_01",
    tags: ["creative", "indoor", "health", "learning"],
    gate: { minStats: { eng: 0 }, tabooNotContains: ["nsfw"] },
    scene: "Тихий вечер. На столе — книга, о которой давно мечтал.",
    options: [
      { id: "A", label: "Читать 30 минут с заметками", deltas: { crtv: 2, eng: 1, soc: 0, wealth: 0 } },
      { id: "B", label: "Полистать оглавление и закладки", deltas: { crtv: 1, eng: 0, soc: 0, wealth: 0 } }
    ],
    outcomes: {
      A: "Пара инсайтов для проекта, идеи заискрились.",
      B: "Наметил главы, к которым вернёшься."
    },
    share_caption: "Чтение вернулось в рутину"
  }
];

export default localEpisodes;