import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components";
import { Logo } from "../components/Logo";

const Onboarding: React.FC = () => {
  const imageUrl =
    "https://storage.yandexcloud.net/oasis/ChatGPT%20Image%2029%20%D1%81%D0%B5%D0%BD%D1%82.%202025%20%D0%B3.%2C%2016_07_37.png";

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Background image */}
      <img
        src={imageUrl}
        alt="OASIS cover"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Global dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />


      {/* Bottom gradient overlay: colored -> transparent (bottom -> top) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[40dvh] z-[5]"
        style={{
          background:
            "linear-gradient(0deg, rgba(2,6,23,0.90) 0%, rgba(2,6,23,0.70) 30%, rgba(2,6,23,0.45) 60%, rgba(2,6,23,0.00) 100%)",
          WebkitBackdropFilter: "blur(2px)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* CTA pinned to page bottom */}
      <section className="absolute inset-x-0 bottom-0 z-[20]">
        <div
          className="mx-auto w-full max-w-2xl px-6"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
            paddingTop: "16px",
          }}
        >
          <div className="text-center text-white mb-4">
            <Logo size="lg" variant="gradient" />
            <div className="mt-1 text-white/90 text-xs sm:text-sm tracking-widest uppercase">
              your other life
            </div>
          </div>
          <div className="w-full max-w-sm mx-auto flex flex-col sm:flex-row gap-3">
            <Link to="/login" className="flex-1">
              <Button className="w-full" size="lg" variant="accent">
                Войти
              </Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button className="w-full" size="lg" variant="outline">
                Регистрация
              </Button>
            </Link>
          </div>
          <div className="mt-4 text-center text-xs text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]">
            Продолжая, вы соглашаетесь с условиями использования.
          </div>
        </div>
      </section>
    </div>
  );
};

export default Onboarding;