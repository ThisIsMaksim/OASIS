import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { AvatarViewer } from "../components/AvatarViewer";
import { Button, Loader, Logo } from "../components";
import {
  Home as HomeIcon,
  MessageCircle,
  Plus,
  Heart,
  User,
  Settings,
  LogOut,
} from "lucide-react";

type TabKey = "feed" | "messages" | "create" | "favorites" | "profile";

const TabButton: React.FC<{
  active?: boolean;
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  className?: string;
}> = ({ active, icon, label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={[
        "flex h-11 min-w-11 flex-col items-center justify-center rounded-full px-3 text-xs transition",
        active ? "bg-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]" : "text-white/80 hover:bg-white/10",
        className ?? "",
      ].join(" ")}
    >
      <span className="pointer-events-none flex items-center justify-center">{icon}</span>
      {label ? <span className="mt-0.5">{label}</span> : null}
    </button>
  );
};

const MobileChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-dvh pb-[84px]">{children}</div>
  );
};

const FeedTab: React.FC = () => {
  const avatarUrl = useAppStore((s) => s.avatarUrl);
  
  return (
    <div className="flex flex-col h-full">
      <div className="glass relative overflow-hidden rounded-2xl border w-full h-full p-4 text-white">
        {avatarUrl ? (
          <div className="w-full h-full rounded-lg overflow-hidden">
            <AvatarViewer
              modelSrc={avatarUrl}
              className="w-full h-full"
              onLoaded={() => console.log('Avatar loaded')}
              onLoading={() => console.log('Avatar loading')}
              showControls={false}
              loader={<Loader />}
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-lg bg-white/5 p-8 text-center">
            <div className="flex flex-col items-center justify-center h-full">
              <User className="h-16 w-16 text-white/30 mb-4" />
              <p className="text-white/70 mb-2">Нет аватара</p>
              <p className="text-white/50 text-sm">Создайте аватар в редакторе</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MessagesTab: React.FC = () => {
  const items = useMemo(
    () => [
      { name: "Cynthia", text: "Hello, I want to talk about…", time: "2m ago" },
      { name: "Karen", text: "What do you need for your…", time: "08:24" },
      { name: "Ethelene", text: "Let’s change something in…", time: "09:46" },
      { name: "Ms. Stanley", text: "Hope you’re doing well", time: "Yesterday" },
    ],
    []
  );

  return (
    <div className="space-y-3">
      <div className="glass flex items-center justify-between rounded-2xl border px-4 py-3 text-white">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/70">Inbox</div>
          <div className="text-xl font-semibold">Messages</div>
        </div>
        <button className="rounded-full bg-white/10 p-2 backdrop-blur hover:bg-white/15" title="New">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="glass rounded-2xl border">
        <ul className="divide-y divide-white/10">
          {items.map((m, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3 text-white">
              <div className="h-9 w-9 shrink-0 rounded-full bg-white/20" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-white/60">{m.time}</div>
                </div>
                <div className="truncate text-xs text-white/70">{m.text}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const FavoritesTab: React.FC = () => {
  return (
    <div className="glass rounded-2xl border p-6 text-white/80">
      <div className="text-lg font-semibold text-white">Избранное</div>
      <div className="mt-2 text-sm">Здесь будут ваши понравившиеся публикации.</div>
    </div>
  );
};

const ProfileTab: React.FC = () => {
  const { avatarUrl, setAvatarUrl } = useAppStore((s) => ({
    avatarUrl: s.avatarUrl,
    setAvatarUrl: s.setAvatarUrl
  }));
  const navigate = useNavigate();

  return (
    <div className="space-y-3 text-white">
      <div className="glass flex items-center justify-between rounded-2xl border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20" />
          <div>
            <div className="text-sm font-semibold">Ваш профиль</div>
            <div className="text-xs text-white/70">Редактируйте и делитесь</div>
          </div>
        </div>
        <button className="rounded-full bg-white/10 p-2 backdrop-blur hover:bg-white/15" title="Settings">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Аватар */}
      {avatarUrl && (
        <div className="glass rounded-2xl border p-4">
          <div className="rounded-lg overflow-hidden bg-white/5" style={{ height: "200px" }}>
            <AvatarViewer
              modelSrc={avatarUrl}
              className="w-full h-full"
              showControls={false}
              loader={<Loader />}
            />
          </div>
        </div>
      )}



      <div className="glass rounded-2xl border p-4">
        <div className="text-sm text-white/80">Аккаунт</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              navigate("/", { replace: true });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
          {avatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Удалить сохраненный аватар? Это действие нельзя отменить.")) {
                  setAvatarUrl(null);
                }
              }}
            >
              Очистить аватар
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("feed");

  const renderTab = () => {
    switch (tab) {
      case "feed":
        return <FeedTab />;
      case "messages":
        return <MessagesTab />;
      case "favorites":
        return <FavoritesTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return null;
    }
  };

  return (
    <MobileChrome>
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="glass rounded-b-2xl border px-4 py-2 flex items-center justify-center">
            <Logo size="md" variant="gradient" />
          </div>
        </div>
      </header>

      <div className="w-full h-full p-4 pt-16 text-white">
        {renderTab()}
      </div>

      {/* Bottom Tab Bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto mb-4 flex w-full max-w-md justify-center px-4">
        <div className="pointer-events-auto glass flex h-[64px] w-full items-center justify-between rounded-2xl border px-2">
          <TabButton
            active={tab === "feed"}
            icon={<HomeIcon className="h-5 w-5" />}
            onClick={() => setTab("feed")}
          />
          <TabButton
            active={tab === "messages"}
            icon={<MessageCircle className="h-5 w-5" />}
            onClick={() => setTab("messages")}
          />

          <TabButton
            icon={<Plus className="h-5 w-5" />}
            onClick={() => navigate("/create")}
          />
          
          <TabButton
            active={tab === "favorites"}
            icon={<Heart className="h-5 w-5" />}
            onClick={() => setTab("favorites")}
          />
          <TabButton
            active={tab === "profile"}
            icon={<User className="h-5 w-5" />}
            onClick={() => setTab("profile")}
          />
        </div>
      </div>
    </MobileChrome>
  );
};

export default HomeScreen;