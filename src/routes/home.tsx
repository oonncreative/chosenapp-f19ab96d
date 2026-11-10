import chosenIcone from "@/assets/chosen-icone.png.asset.json";
import { AppFooter } from "@/components/AppFooter";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shuffle, List, GalleryHorizontal, Vibrate, VibrateOff, Heart, MoreHorizontal, X, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, getRandomIdForCategoria, getRandomMensagemGlobal } from "@/lib/data";
import { isShakeEnabled, setShakeEnabled, requestShakePermission } from "@/hooks/useShakeToChosen";
import { searchMensagens, type SearchHit } from "@/lib/searchMensagens";
import { toast } from "sonner";

const triggerHaptic = async () => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
};

import mascote1 from "@/assets/mascotes/mascote-1.png.asset.json";
import mascote2 from "@/assets/mascotes/mascote-2.png.asset.json";
import mascote3 from "@/assets/mascotes/mascote-3.png.asset.json";
import mascote4 from "@/assets/mascotes/mascote-4.png.asset.json";
import mascote5 from "@/assets/mascotes/mascote-5.png.asset.json";
import mascote6 from "@/assets/mascotes/mascote-6.png.asset.json";
import mascote7 from "@/assets/mascotes/mascote-7.png.asset.json";
import mascote8 from "@/assets/mascotes/mascote-8.png.asset.json";
import mascote9 from "@/assets/mascotes/mascote-9.png.asset.json";
import mascote10 from "@/assets/mascotes/mascote-10.png.asset.json";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const MASCOTES: Record<string, string> = {
  "Feliz": mascote1.url,
  "Ansioso": mascote4.url,
  "Triste": mascote6.url,
  "Sozinho": mascote3.url,
  "Agradecido": mascote7.url,
  "Nervoso": mascote9.url,
  "Preciso de esperança": mascote5.url,
  "Preciso de paz": mascote2.url,
  "Preciso de força": mascote8.url,
  "Motivação": mascote10.url,
};

function HomePage() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"list" | "swipe">(() => {
    if (typeof window === "undefined") return "swipe";
    return (localStorage.getItem("viewMode") as "list" | "swipe") || "swipe";
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  const [shakeOn, setShakeOn] = useState(false);
  useEffect(() => {
    setShakeOn(isShakeEnabled());
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchHits: SearchHit[] = searchQuery.trim() ? searchMensagens(searchQuery, 15) : [];

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 30);
  };
  const closeSearchIfEmpty = () => {
    if (!searchQuery.trim()) {
      setSearchOpen(false);
    }
  };

  const handleToggleShake = async () => {
    if (shakeOn) {
      setShakeEnabled(false);
      setShakeOn(false);
      toast("Chacoalhar desativado", {
        description: "Você não vai mais receber uma mensagem ao chacoalhar o celular.",
      });
      return;
    }
    const ok = await requestShakePermission();
    if (!ok) {
      toast.error("Permissão negada", {
        description: "Não foi possível acessar o sensor de movimento.",
      });
      return;
    }
    setShakeEnabled(true);
    setShakeOn(true);
    toast("Chacoalhar ativado ✨", {
      description: "Chacoalhe o celular pra receber uma mensagem pra este momento.",
    });
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-white flex flex-col w-full max-w-[100vw]">
      <header className="px-4 sm:px-6 pt-[max(env(safe-area-inset-top),2rem)] pb-2 flex flex-col gap-3 shrink-0 bg-white z-20">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h1 className="flex items-center gap-2 truncate text-sm sm:text-base font-bold tracking-[0.4em] text-brand-olive uppercase"><img src={chosenIcone.url} alt="" className="h-7 w-7 shrink-0 object-contain" />CHOSEN</h1>
          
          <div className="flex items-center gap-0 shrink-0">
            <div
              className={`flex items-center gap-0 overflow-hidden transition-all duration-300 ease-out ${
                menuOpen ? "max-w-[240px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
            <button
              onClick={handleToggleShake}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 transition-opacity active:opacity-50"
              title={shakeOn ? "Chacoalhar ativado" : "Chacoalhar desativado"}
              aria-pressed={shakeOn}
            >
              {shakeOn ? (
                <Vibrate className="h-5 w-5 text-black" strokeWidth={2} />
              ) : (
                <VibrateOff className="h-5 w-5 text-black/40" strokeWidth={2} />
              )}
            </button>
            <button
              onClick={() => {
                const { categoria, id } = getRandomMensagemGlobal();
                navigate({ to: "/mensagem/$sentimento", params: { sentimento: categoria }, search: { color: "#f1f26c", id } });
              }}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 transition-opacity active:opacity-50"
              title="Aleatório"
            >
              <Shuffle className="h-5 w-5 text-black" strokeWidth={2} />
            </button>
            <Link
              to="/escolhidas"
              className="flex items-center justify-center min-w-11 min-h-11 p-2 transition-opacity active:opacity-50"
              title="Minhas escolhidas"
            >
              <Heart className="h-5 w-5 text-black" strokeWidth={2} />
            </Link>
            <button 
              onClick={() => {
                const current = document.documentElement.classList.contains('grayscale');
                const next = !current;
                localStorage.setItem('isMono', next.toString());
                if (next) {
                  document.documentElement.classList.add('grayscale');
                } else {
                  document.documentElement.classList.remove('grayscale');
                }
              }}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 transition-opacity active:opacity-50"
              title="Modo Minimalista"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" className="text-black">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
              </svg>
            </button>
            </div>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="flex items-center justify-center min-w-11 min-h-11 p-2 transition-opacity active:opacity-50"
              title="Menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5 text-black" strokeWidth={2} />
              ) : (
                <MoreHorizontal className="h-5 w-5 text-black" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          {searchOpen ? (
            <div className="flex items-center gap-2 flex-1 min-w-0 border-b border-black/20 focus-within:border-black transition-colors">
              <Search className="h-4 w-4 text-black/50 shrink-0" strokeWidth={2} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={closeSearchIfEmpty}
                placeholder="ansiedade, gratidão, medo..."
                className="flex-1 min-w-0 bg-transparent py-1.5 text-sm text-black placeholder:text-black/30 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                  aria-label="Limpar busca"
                  className="shrink-0 p-1 text-black/40 hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={openSearch}
              aria-label="Buscar por palavra-chave"
              className="text-sm sm:text-base font-light tracking-[0.3em] sm:tracking-[0.4em] text-black uppercase text-left cursor-pointer active:opacity-60 transition-opacity"
            >
              Qual seu sentimento?
            </button>
          )}
          <div className={`flex items-center gap-0 -mr-1 shrink-0 ${searchOpen ? "hidden" : ""}`}>
          {([
            { key: "list" as const, icon: List, label: "Lista" },
            { key: "swipe" as const, icon: GalleryHorizontal, label: "Swipe" },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`p-2.5 transition-all ${
                viewMode === key ? "text-black" : "text-black/25 hover:text-black/60"
              }`}
              title={label}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          ))}
          </div>
        </div>
      </header>

      {searchOpen && searchQuery.trim() ? (
        <SearchResults hits={searchHits} navigate={navigate} query={searchQuery} />
      ) : (
        <>
          {viewMode === "list" && <ListView navigate={navigate} />}
          {viewMode === "swipe" && <SwipeView navigate={navigate} />}
        </>
      )}

      <AppFooter />
    </div>
  );
}

type NavFn = ReturnType<typeof useNavigate>;

function SearchResults({ hits, navigate, query }: { hits: SearchHit[]; navigate: NavFn; query: string }) {
  if (hits.length === 0) {
    return (
      <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pb-6 pt-4 text-center">
        <p className="text-sm text-black/50">
          Nada encontrado para <span className="font-semibold text-black">"{query}"</span>.
        </p>
        <p className="mt-2 text-xs text-black/40">Tente outra palavra como "paz", "medo" ou "gratidão".</p>
      </section>
    );
  }
  return (
    <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 pb-6 pt-2">
      <div className="flex flex-col gap-2 w-full">
        {hits.map((h) => (
          <button
            key={`${h.categoria}-${h.id}`}
            onClick={() =>
              navigate({
                to: "/mensagem/$sentimento",
                params: { sentimento: h.categoria },
                search: { color: "#f1f26c", id: h.id },
              })
            }
            className="w-full text-left px-4 py-3 rounded-2xl bg-black/[0.03] hover:bg-black/[0.06] active:scale-[0.99] transition-all"
          >
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-black/50">{h.categoria}</p>
            <p className="mt-1 text-sm text-black leading-snug line-clamp-3">"{h.texto}"</p>
            <p className="mt-1 text-[11px] font-semibold tracking-wider uppercase text-black/60">{h.referencia}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function goTo(navigate: NavFn, sentimento: string) {
  navigate({
    to: "/mensagem/$sentimento",
    params: { sentimento },
    search: { color: "#f1f26c", id: getRandomIdForCategoria(sentimento as any) },
  });
}

function ListView({ navigate }: { navigate: NavFn }) {
  return (
    <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 sm:px-6 pb-6 pt-2">
      <div className="flex flex-col gap-3 w-full">
        {CATEGORIAS.map((sentimento, i) => (
          <Link
            key={sentimento}
            to="/mensagem/$sentimento"
            params={{ sentimento }}
            search={{ color: "#f1f26c", id: getRandomIdForCategoria(sentimento) }}
            onClick={() => { void triggerHaptic(); }}
            className="group relative flex items-center gap-3 sm:gap-4 min-h-[100px] px-4 sm:px-5 py-4 transition-all active:scale-[0.98] rounded-[28px] bg-white hover:-translate-y-0.5 w-full mascote-enter"
            style={{ animationDelay: `${Math.min(i, 9) * 55}ms` }}
          >
            <div className="mascote-wrap shrink-0 w-[4.75rem] h-[4.75rem] sm:w-[5.25rem] sm:h-[5.25rem] flex items-center justify-center">
              <img
                src={MASCOTES[sentimento]}
                alt={sentimento}
                className="mascote-anim w-full h-full object-contain"
                style={{ animationDelay: `${(i % 5) * 400}ms` }}
                loading="lazy"
              />
            </div>
            <span className="flex-1 min-w-0 text-base sm:text-lg font-medium tracking-tight uppercase text-black truncate">{sentimento}</span>
            <div className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity text-black">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SwipeView({ navigate }: { navigate: NavFn }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const [drag, setDrag] = useState(0);

  const total = CATEGORIAS.length;
  const prev = () => { void triggerHaptic(); setIndex((i) => (i - 1 + total) % total); };
  const next = () => { void triggerHaptic(); setIndex((i) => (i + 1) % total); };

  const onStart = (x: number) => { startX.current = x; deltaX.current = 0; };
  const onMove = (x: number) => {
    if (startX.current === null) return;
    deltaX.current = x - startX.current;
    setDrag(deltaX.current);
  };
  const onEnd = () => {
    if (Math.abs(deltaX.current) > 80) {
      if (deltaX.current < 0) next(); else prev();
    }
    startX.current = null; deltaX.current = 0; setDrag(0);
  };

  return (
    <section className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 pb-6 pt-2 select-none w-full">
      <div
        className="relative w-full max-w-sm h-[clamp(320px,60vh,440px)]"
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => startX.current !== null && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={() => startX.current !== null && onEnd()}
      >
        {CATEGORIAS.map((sentimento, i) => {
          const offset = i - index;
          if (Math.abs(offset) > 1) return null;
          const translate = offset * 100 + (drag / 4);
          const scale = offset === 0 ? 1 : 0.9;
          const opacity = offset === 0 ? 1 : 0.4;
          return (
            <div
              key={sentimento}
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${translate}%) scale(${scale})`, opacity, transitionDuration: startX.current !== null ? "0ms" : "300ms" }}
            >
              <button
                onClick={() => offset === 0 && goTo(navigate, sentimento)}
                className="w-full h-full rounded-[32px] bg-white flex flex-col items-center justify-center gap-4 sm:gap-6 p-6 sm:p-8 active:scale-[0.98] transition-transform"
              >
                <div className="mascote-wrap w-[52vw] max-w-52 aspect-square flex items-center justify-center">
                  <img
                    src={MASCOTES[sentimento]}
                    alt={sentimento}
                    className={`w-full h-full object-contain ${offset === 0 ? "mascote-anim" : ""}`}
                  />
                </div>
                <span className="text-xl sm:text-2xl font-medium tracking-tight uppercase text-black text-center break-words">{sentimento}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-6 mt-6">
        <button onClick={prev} className="p-3 rounded-full active:scale-95 transition-transform" title="Anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="flex items-center gap-1.5">
          {CATEGORIAS.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-black" : "w-1.5 bg-black/20"}`} />
          ))}
        </div>
        <button onClick={next} className="p-3 rounded-full active:scale-95 transition-transform" title="Próximo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5"><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
}
