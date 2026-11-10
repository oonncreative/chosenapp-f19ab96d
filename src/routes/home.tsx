import chosenIcone from "@/assets/chosen-icone.png.asset.json";
import { AppFooter } from "@/components/AppFooter";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Shuffle, List, GalleryHorizontal, Vibrate, VibrateOff, Heart, MoreHorizontal, X, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, getRandomIdForCategoria, getRandomMensagemGlobal } from "@/lib/data";
import { isShakeEnabled, setShakeEnabled, requestShakePermission } from "@/hooks/useShakeToChosen";
import { searchMensagens, type SearchHit } from "@/lib/searchMensagens";
import { toast } from "sonner";
import { MASCOTE_POR_SENTIMENTO } from "@/lib/mascotes";

const triggerHaptic = async () => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {}
};


export const Route = createFileRoute("/home")({
  component: HomePage,
});

const MASCOTES = MASCOTE_POR_SENTIMENTO;

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
    <div className="h-[100dvh] overflow-hidden bg-background flex flex-col w-full max-w-[100vw]">
      <header className="px-5 sm:px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-3 flex flex-col gap-3 shrink-0 bg-background z-20">
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

        <div className="mt-2">
          <h2 className="text-[28px] leading-[1.1] font-bold tracking-tight text-ink">Como está seu coração?</h2>
          <p className="mt-1 text-sm text-ink/60">Escolha seu momento.</p>
        </div>

        <label className="mt-1 flex items-center gap-2 h-12 px-4 rounded-full bg-surface border border-black/5 focus-within:border-ink/30 transition-colors">
          <Search className="h-4 w-4 text-ink/50 shrink-0" strokeWidth={2} />
          <input
            ref={searchInputRef}
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onBlur={closeSearchIfEmpty}
            placeholder="Buscar por palavra-chave"
            aria-label="Buscar por palavra-chave"
            className="flex-1 min-w-0 bg-transparent text-sm text-ink placeholder:text-ink/40 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
              aria-label="Limpar busca"
              className="shrink-0 p-1 text-ink/40 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className={`flex justify-center ${searchOpen && searchQuery.trim() ? "hidden" : ""}`}>
          <div role="tablist" className="inline-flex p-1 rounded-full bg-surface border border-black/5">
            {([
              { key: "list" as const, icon: List, label: "Lista" },
              { key: "swipe" as const, icon: GalleryHorizontal, label: "Swipe" },
            ]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={viewMode === key}
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-1.5 h-8 px-4 rounded-full text-[13px] font-semibold transition-all ${
                  viewMode === key ? "bg-brand-yellow text-ink shadow-sm" : "text-ink/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                {label}
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

const FRASES: Record<string, string> = {
  "Motivação": "Encontre força em Deus para hoje.",
  "Feliz": "Celebre as bênçãos de hoje.",
  "Ansioso": "Entregue suas preocupações a Deus.",
  "Triste": "Encontre consolo em sua presença.",
  "Sozinho": "Ele está com você agora.",
  "Agradecido": "Agradeça pelo que Deus fez.",
  "Nervoso": "Respire e descanse nele.",
  "Preciso de esperança": "Um novo começo é possível.",
  "Preciso de paz": "A paz que excede todo entendimento.",
  "Preciso de força": "Ele renova as suas forças.",
};

const TINTS = ["bg-tint-lavender", "bg-tint-sky", "bg-tint-peach", "bg-tint-mint", "bg-tint-rose"];

function ListView({ navigate: _navigate }: { navigate: NavFn }) {
  const [destaque, ...resto] = CATEGORIAS;
  return (
    <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 sm:px-6 pb-36 pt-8">
      <div className="grid grid-cols-2 gap-3 w-full">
        <Link
          to="/mensagem/$sentimento"
          params={{ sentimento: destaque }}
          search={{ color: "#f1f26c", id: getRandomIdForCategoria(destaque) }}
          onClick={() => { void triggerHaptic(); }}
          className="group relative col-span-2 flex min-h-[168px] rounded-[28px] bg-tint-yellow p-5 text-left active:scale-[0.98] transition-transform mascote-enter"
        >
          <div className="relative z-10 flex w-[55%] flex-col">
            <span className="text-2xl font-bold tracking-tight text-ink">{destaque}</span>
            <span className="mt-1.5 text-[13px] leading-snug text-ink/65">{FRASES[destaque]}</span>
            <span className="mt-auto pt-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-ink shadow-sm">
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </span>
          </div>
          <div className="pointer-events-none absolute -top-9 right-1 bottom-0 w-[46%] mascote-wrap">
            <img
              src={MASCOTES[destaque]}
              alt={destaque}
              className="mascote-anim h-full w-full object-contain object-bottom drop-shadow-md"
            />
          </div>
        </Link>

        {resto.map((sentimento, i) => (
          <Link
            key={sentimento}
            to="/mensagem/$sentimento"
            params={{ sentimento }}
            search={{ color: "#f1f26c", id: getRandomIdForCategoria(sentimento) }}
            onClick={() => { void triggerHaptic(); }}
            className={`group relative flex min-h-[176px] flex-col overflow-hidden rounded-[24px] ${TINTS[i % TINTS.length]} p-4 text-left active:scale-[0.97] transition-transform mascote-enter`}
            style={{ animationDelay: `${Math.min(i + 1, 9) * 55}ms` }}
          >
            <span className="relative z-10 text-[17px] font-bold leading-tight tracking-tight text-ink">{sentimento}</span>
            <span className="relative z-10 mt-1 w-[70%] text-[12px] leading-snug text-ink/60">{FRASES[sentimento]}</span>
            <div className="pointer-events-none absolute -bottom-1 -right-2 h-[62%] aspect-square mascote-wrap">
              <img
                src={MASCOTES[sentimento]}
                alt=""
                className="mascote-anim h-full w-full object-contain object-bottom"
                style={{ animationDelay: `${(i % 5) * 400}ms` }}
                loading="lazy"
              />
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
  const [hint, setHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 3200);
    return () => clearTimeout(t);
  }, []);

  const total = CATEGORIAS.length;
  const prev = () => { void triggerHaptic(); setIndex((i) => (i - 1 + total) % total); };
  const next = () => { void triggerHaptic(); setIndex((i) => (i + 1) % total); };

  const onStart = (x: number) => { setHint(false); startX.current = x; deltaX.current = 0; };
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
        className="relative w-full max-w-sm h-[clamp(360px,64vh,500px)]"
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
          const rotate = offset === 0 ? drag / 40 : 0;
          const scale = offset === 0 ? 1 : 0.9;
          const opacity = offset === 0 ? 1 : 0.4;
          return (
            <div
              key={sentimento}
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `translateX(${translate}%) scale(${scale}) rotate(${rotate}deg)`, opacity, transitionDuration: startX.current !== null ? "0ms" : "300ms" }}
            >
              <button
                onClick={() => offset === 0 && goTo(navigate, sentimento)}
                className={`relative w-full h-full overflow-hidden rounded-[32px] bg-tint-yellow flex flex-col items-center justify-end p-5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.25)] active:scale-[0.98] transition-transform ${offset === 0 && hint ? "swipe-hint-card" : ""}`}
              >
                <div aria-hidden className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-[75%] aspect-square rounded-full bg-background/50 blur-2xl" />
                <div className="mascote-wrap relative flex-1 min-h-0 w-full flex items-end justify-center">
                  <img
                    src={MASCOTES[sentimento]}
                    alt={sentimento}
                    className={`h-full max-h-full w-auto object-contain drop-shadow-xl ${offset === 0 ? "mascote-anim" : ""}`}
                  />
                </div>
                <span className="relative mt-2 rounded-full bg-background/80 backdrop-blur px-5 py-2 text-xl font-bold tracking-tight text-ink text-center break-words">{sentimento}</span>
              </button>
            </div>
          );
        })}
        {hint && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 z-10 flex flex-col items-center gap-2 animate-in fade-in duration-300">
            <div className="swipe-hint-hand flex h-12 w-12 items-center justify-center rounded-full bg-ink/80 text-2xl shadow-lg">👆</div>
            <span className="rounded-full bg-ink/80 px-3 py-1 text-[12px] font-semibold text-background">Arraste para o lado</span>
          </div>
        )}
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
