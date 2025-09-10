import { useEffect, useRef, useState, useMemo, CSSProperties, FC, ReactNode } from 'react';
import * as RPMVisage from '@readyplayerme/visage';
import { ANIMATIONS, getRandomIdleAnimation, isIdleAnimation } from '../lib/animations';
import { Loader } from './ui/Loader';
import { useAppStore } from '../store/useAppStore';

const { Avatar } = RPMVisage;

// Единственный «ведущий» инстанс AvatarViewer управляет сменой анимаций через стор.
// Это устраняет гонки, когда несколько вьюеров одновременно дергают setAnimationActiveKey.
let animationControllerId: number | null = null;
let nextAnimationControllerId = 1;

interface AvatarViewerProps {
  modelSrc: string;
  animationSrc?: string;
  className?: string;
  style?: CSSProperties;
  onLoaded?: () => void;
  onLoading?: () => void;
  showControls?: boolean;
  loader?: ReactNode;
}

export const AvatarViewer: FC<AvatarViewerProps> = ({
  modelSrc,
  className = "",
  style = {},
  onLoaded,
  onLoading
}) => {
  const animationActiveKey = useAppStore(s => s.animationActiveKey);
  const animationAutoSwitchIdle = useAppStore(s => s.animationAutoSwitchIdle);
  const setAnimationActiveKey = useAppStore(s => s.setAnimationActiveKey);
  const modelReadyRef = useRef(false);

// Таймер резервного возврата в idle для не-idle анимаций (на случай, если onAnimationEnd не придет)
const actionResetTimerRef = useRef<number | null>(null);
const scheduleResetToIdle = (forKey: string, delay = 4000) => {
  if (actionResetTimerRef.current) {
    window.clearTimeout(actionResetTimerRef.current);
  }
  actionResetTimerRef.current = window.setTimeout(() => {
    const current = useAppStore.getState().animationActiveKey;
    if (!isIdleAnimation(current) && current === forKey) {
      const nextAnim = getRandomIdleAnimation(current) || getRandomIdleAnimation();
      const nextKey = nextAnim ? nextAnim.key : 'idle1';
      setAnimationActiveKey(nextKey);
      // Пересобираем набор действий, если сами вернули в idle
      regenerateActions();
    }
  }, delay);
};
// Действия вокруг аватара: состояние, генерация и обработчики
type Corner = 'tr' | 'tl' | 'bl';
const CORNERS: Corner[] = ['tr', 'tl', 'bl'];

type ActionKey = 'box' | 'dance' | 'coffee';

const ACTION_LABELS: Record<ActionKey, string> = {
  box: 'Боксировать',
  dance: 'Танцевать',
  coffee: 'Сходить за кофе',
};

const cornerClass: Record<Corner, string> = {
  tl: 'top-3 left-3',
  tr: 'top-3 right-3',
  bl: 'bottom-3 left-3',
};

const [cornerActions, setCornerActions] = useState<Partial<Record<Corner, ActionKey>>>({});
const [visibleCorners, setVisibleCorners] = useState<Record<Corner, boolean>>({ tr: false, tl: false, bl: false });
const [actionsLocked, setActionsLocked] = useState(false);

const [toastVisible, setToastVisible] = useState(false);
const [toastText, setToastText] = useState('');

const showToast = (text: string, timeout = 2200) => {
  setToastText(text);
  setToastVisible(true);
  window.setTimeout(() => setToastVisible(false), timeout);
};

const actionHandlers = useMemo(() => ({
  box: () => {
    setAnimationActiveKey('punchingBag');
    scheduleResetToIdle('punchingBag', 4000);
  },
  dance: () => {
    const dances = ['rumbaDancing', 'sillyDancing'] as const;
    const key = dances[Math.floor(Math.random() * dances.length)];
    setAnimationActiveKey(key);
    scheduleResetToIdle(key, 4000);
  },
  coffee: () => {
    showToast('кайф, идея');
    // После тоста пересоберем набор действий заново
    window.setTimeout(() => {
      regenerateActions();
    }, 2400);
  },
}), [setAnimationActiveKey]);

function sampleUniqueActions(min = 1, max = 3): ActionKey[] {
  const pool: ActionKey[] = ['box', 'dance', 'coffee'];
  const count = Math.max(min, Math.min(max, Math.floor(Math.random() * (max - min + 1)) + min));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function regenerateActions() {
  const actions = sampleUniqueActions(1, 3);
  const assignment: Partial<Record<Corner, ActionKey>> = {};
  actions.forEach((a, idx) => {
    const corner = CORNERS[idx]; // фиксированный приоритет: tr, tl, bl
    if (corner) assignment[corner] = a;
  });
  setCornerActions(assignment);

  // Стадированное появление по порядку: tr -> tl -> bl
  // Сбрасываем видимость
  setVisibleCorners({ tr: false, tl: false, bl: false });

  // Показ по очереди с небольшими задержками
  let delay = 0;
  CORNERS.forEach((corner) => {
    if (assignment[corner]) {
      window.setTimeout(() => {
        setVisibleCorners(prev => ({ ...prev, [corner]: true }));
      }, delay);
      delay += 140; // интервал между «облаками»
    }
  });
}

// Инициализация набора действий при первом монтировании
useEffect(() => {
  regenerateActions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

function renderActionPill(corner: Corner) {
  const key = (cornerActions as any)[corner] as ActionKey | undefined;
  if (!key) return null;

  const base = 'absolute z-10 select-none px-3 py-2 rounded-2xl bg-black/50 text-white text-xs border border-white/10 shadow-md backdrop-blur-md transition-all duration-300 transform';
  const showCls = visibleCorners[corner] ? ' opacity-100 scale-100' : ' opacity-0 scale-90';
  const disabledCls = actionsLocked ? ' pointer-events-none opacity-80' : '';

  return (
    <button
      key={`${corner}-${key}`}
      onClick={() => handlePillClick(corner, key)}
      className={`${base}${showCls}${disabledCls} ${cornerClass[corner]} hover:bg-black/60 active:scale-95`}
    >
      {ACTION_LABELS[key]}
    </button>
  );
}

function handlePillClick(corner: Corner, key: ActionKey) {
  if (actionsLocked) return;
  setActionsLocked(true);

  // 1) Схлопываем все, кроме нажатого
  setVisibleCorners(prev => {
    const next = { ...prev };
    (Object.keys(next) as Corner[]).forEach((c) => {
      if (c !== corner) next[c] = false;
    });
    return next;
  });

  // 2) Затем схлопываем нажатый
  window.setTimeout(() => {
    setVisibleCorners(prev => ({ ...prev, [corner]: false }));
  }, 140);

  // 3) После завершения анимации запускаем действие
  window.setTimeout(() => {
    actionHandlers[key]();
    // Разлочим позже, когда regenerateActions снова покажет набор
    window.setTimeout(() => setActionsLocked(false), 50);
  }, 140 + 300); // duration-300 из Tailwind
}
  // Локальные маркеры, чтобы не дергать стор повторно при одном и том же завершении
  const lastAppliedKeyRef = useRef<string | null>(null);
  const lastEndKeyRef = useRef<string | null>(null);

  // Фиксируем последний примененный ключ и сбрасываем маркер завершения на смене клипа
  useEffect(() => {
    lastAppliedKeyRef.current = animationActiveKey;
    lastEndKeyRef.current = null;
  }, [animationActiveKey]);

  // Идентификатор инстанса и назначение контроллера
  const instanceIdRef = useRef<number>(nextAnimationControllerId++);

  useEffect(() => {
    // Назначаем контроллером первый смонтированный вьюер
    if (animationControllerId === null) {
      animationControllerId = instanceIdRef.current;
    }
    return () => {
      // Снимаем контроль при размонтировании
      if (animationControllerId === instanceIdRef.current) {
        animationControllerId = null;
      }
    };
  }, []);

  // Очистка резервного таймера при размонтировании
  useEffect(() => {
    return () => {
      if (actionResetTimerRef.current) {
        window.clearTimeout(actionResetTimerRef.current);
        actionResetTimerRef.current = null;
      }
    };
  }, []);

  // Выбрать idle, отличную от текущей
  const pickIdleDifferentFrom = (exclude?: string) => {
    const next = getRandomIdleAnimation(exclude);
    if (next && next.key !== exclude) return next.key;
    // fallback: если вдруг вернулся тот же — пробуем первую доступную из списка
    const alt = getRandomIdleAnimation(); // без exclude
    return alt ? alt.key : 'idle1';
  };

  // Обработчик завершения анимации
  const handleAnimationFinished = () => {
    // Защита от гонок:
    // 1) завершается не тот клип, который сейчас активен в сторе
    if (lastAppliedKeyRef.current !== animationActiveKey) return;
    // 2) это завершение уже обработано
    if (lastEndKeyRef.current === animationActiveKey) return;
    lastEndKeyRef.current = animationActiveKey;

    if (isIdleAnimation(animationActiveKey)) {
      if (animationAutoSwitchIdle) {
        const nextKey = pickIdleDifferentFrom(animationActiveKey);
        if (nextKey !== animationActiveKey) {
          setAnimationActiveKey(nextKey);
        }
      }
    } else {
      // Сбрасываем резервный таймер, если он был запланирован
      if (actionResetTimerRef.current) {
        window.clearTimeout(actionResetTimerRef.current);
        actionResetTimerRef.current = null;
      }
      // Любая не-idle по завершении возвращается к idle, отличной от текущей
      const nextKey = pickIdleDifferentFrom();
      if (nextKey !== animationActiveKey) {
        setAnimationActiveKey(nextKey);
      }
      // Пересобираем доступные действия после завершения активного действия
      regenerateActions();
    }
  };

  const handleLoaded = () => {
    // Фикс дребезга: считаем, что модель готова после первого onLoaded
    if (!modelReadyRef.current) {
      modelReadyRef.current = true;
      if (onLoaded) onLoaded();
    }
  };

  const handleLoading = () => {
    // Игнорируем повторные onLoading, которые приходят при смене клипов анимации
    if (modelReadyRef.current) return;
    if (onLoading) onLoading();
  };

  return (
    <div className={`avatar-viewer relative ${className}`} style={style}>
      <Avatar
        animations={ANIMATIONS}
        activeAnimation={animationActiveKey}
        backLightColor="#FFB878"
        backLightIntensity={6}
        modelSrc={modelSrc}
        scale={1.2}
        shadows
        style={{ width: '100%', height: '100%', ...style }}
        cameraInitialDistance={2.8}
        cameraTarget={1.7}
        onAnimationEnd={handleAnimationFinished}
        onLoaded={handleLoaded}
        onLoading={handleLoading}
        loader={<Loader />}
      />

      {renderActionPill('tr')}
      {renderActionPill('tl')}
      {renderActionPill('bl')}

      <div
        className={`pointer-events-none absolute left-1/2 bottom-4 -translate-x-1/2 transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <div className="pointer-events-auto px-4 py-2 rounded-xl bg-black/70 text-white text-sm border border-white/10 shadow-lg backdrop-blur">
          {toastText}
        </div>
      </div>
    </div>
  );
};

// Компонент с предустановленными настройками для мужского аватара
export const MaleAvatarViewer: React.FC<AvatarViewerProps> = (props) => {
  return (
    <AvatarViewer
      {...props}
    />
  );
};

// Компонент с предустановленными настройками для женского аватара
export const FemaleAvatarViewer: React.FC<AvatarViewerProps> = (props) => {
  return (
    <AvatarViewer
      {...props}
    />
  );
};

// Компонент с эмиссивным материалом (светящийся)
export const EmissiveAvatarViewer: React.FC<AvatarViewerProps> = (props) => {
  return (
    <AvatarViewer
      {...props}
      modelSrc={props.modelSrc || "https://readyplayerme-assets.s3.amazonaws.com/animations/visage/male-emissive.glb"}
    />
  );
};

// Компонент с контролами анимации
export const InteractiveAvatarViewer: React.FC<Omit<AvatarViewerProps, 'showControls'>> = (props) => {
  return (
    <AvatarViewer
      {...props}
      showControls={true}
    />
  );
};