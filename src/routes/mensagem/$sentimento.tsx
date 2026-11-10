import { createFileRoute, Link } from "@tanstack/react-router";
import { getMensagemById, getProximaMensagemFeed, type Categoria, type Mensagem } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Share2, ArrowLeft, Heart, ChevronUp } from "lucide-react";
import { isFavorite, toggleFavorite, addToHistory } from "@/lib/favorites";
import { toast } from "sonner";
import { ShareSheet } from "@/components/share/ShareSheet";
import { MASCOTE_POR_SENTIMENTO } from "@/lib/mascotes";
import chosenIcone from "@/assets/chosen-icone.png.asset.json";
import ceuAmanhecer from "@/assets/ceu-amanhecer.jpg";

function ResumoBlock({ text, onExpandedChange }: { text: string; onExpandedChange?: (v: boolean) => void }) {
  const pRef = useRef<HTMLParagraphElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => { onExpandedChange?.(isExpanded); }, [isExpanded, onExpandedChange]);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = pRef.current;
    if (!el) return;
    const check = () => {
      // Só há necessidade do botão se, colapsado, o texto realmente estoura o clamp.
      const prevExpanded = el.classList.contains("chosen-resumo-expanded");
      el.classList.remove("chosen-resumo-expanded");
      const doesOverflow = el.scrollHeight - el.clientHeight > 1;
      if (prevExpanded) el.classList.add("chosen-resumo-expanded");
      setOverflows(doesOverflow);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div className="mt-6 flex flex-col items-start w-full border-t border-black/5 pt-5">
      <h3 className="text-[15px] font-bold text-ink">Para refletir</h3>
      <p
        ref={pRef}
        className={`chosen-resumo mt-2 text-[14px] text-ink/70 w-full leading-relaxed transition-all duration-300 break-words ${
          isExpanded ? "chosen-resumo-expanded" : "line-clamp-4"
        }`}
      >
        {text}
      </p>
      {overflows && (
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="mt-3 h-9 px-5 rounded-full bg-surface text-[13px] font-semibold text-ink/80 active:scale-95 transition-transform"
        >
          {isExpanded ? "Menos" : "Mais..."}
        </button>
      )}
    </div>
  );
}

const triggerHaptic = async () => {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
};

export const Route = createFileRoute("/mensagem/$sentimento")({
  head: ({ params, loaderData }: { params: { sentimento: string }; loaderData?: { mensagem?: Mensagem } }) => ({
    meta: [
      {
        title: `Versículo para quando você está ${params.sentimento} — Chosen`,
      },
      {
        name: 'description',
        content: loaderData?.mensagem
          ? `"${loaderData.mensagem.texto}" — ${loaderData.mensagem.referencia}`
          : 'Uma palavra escolhida especialmente para você.',
      },
      {
        property: 'og:title',
        content: `Versículo para quando você está ${params.sentimento} — Chosen`,
      },
      {
        property: 'og:description',
        content: loaderData?.mensagem
          ? `"${loaderData.mensagem.texto}" — ${loaderData.mensagem.referencia}`
          : 'Uma palavra escolhida especialmente para você.',
      },
      {
        property: 'og:url',
        content: `https://chosen.oonn.com.br/mensagem/${params.sentimento}`,
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      color: (search.color as string) || "#2D8C3C",
      id: search.id as string,
    };
  },
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: ({ params, deps: { id } }) => {
    return {
      mensagem: getMensagemById(params.sentimento as Categoria, id),
    };
  },
  component: MensagemPage,
});

function MensagemPage() {
  const { sentimento } = Route.useParams();
  const { mensagem: mensagemInicial } = Route.useLoaderData();
  const [feed, setFeed] = useState<Mensagem[]>([mensagemInicial]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const gesto = useRef<{ y: number; t: number; topo: boolean; fim: boolean } | null>(null);
  const irPara = useCallback((idx: number) => {
    const el = slideRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const estadoCard = (target: EventTarget | null) => {
    const card = (target as HTMLElement | null)?.closest?.("[data-card]") as HTMLElement | null;
    if (!card) return { topo: true, fim: true };
    return { topo: card.scrollTop <= 2, fim: card.scrollTop + card.clientHeight >= card.scrollHeight - 2 };
  };
  // Arrasto longo e firme: só muda de frase com >= 140px e o texto no fim/início.
  const onTouchStart = (e: React.TouchEvent) => {
    const { topo, fim } = estadoCard(e.target);
    gesto.current = { y: e.touches[0].clientY, t: Date.now(), topo, fim };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const g = gesto.current; gesto.current = null;
    if (!g) return;
    const dy = e.changedTouches[0].clientY - g.y;
    const atual = estadoCard(e.target);
    if (dy <= -140 && g.fim && atual.fim) irPara(currentIndex + 1);
    else if (dy >= 140 && g.topo && atual.topo && currentIndex > 0) irPara(currentIndex - 1);
  };
  const wheelAcc = useRef(0);
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    const { topo, fim } = estadoCard(e.target);
    if ((e.deltaY > 0 && !fim) || (e.deltaY < 0 && !topo)) { wheelAcc.current = 0; return; }
    if (Date.now() < wheelLock.current) return;
    wheelAcc.current += e.deltaY;
    if (Math.abs(wheelAcc.current) > 240) {
      const dir = wheelAcc.current > 0 ? 1 : -1; wheelAcc.current = 0; wheelLock.current = Date.now() + 700;
      if (dir > 0) irPara(currentIndex + 1); else if (currentIndex > 0) irPara(currentIndex - 1);
    }
  };
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  const mensagemAtual = feed[currentIndex] ?? mensagemInicial;

  // Carrega estado de favorito para toda mensagem que entra no feed.
  useEffect(() => {
    setFavMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const m of feed) {
        if (!(m.id in next)) {
          next[m.id] = isFavorite(m.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [feed]);

  // Registra no histórico sempre que uma mensagem se torna visível.
  useEffect(() => {
    if (!mensagemAtual?.id) return;
    addToHistory({
      id: mensagemAtual.id,
      categoria: sentimento,
      ref: mensagemAtual.referencia,
      text: mensagemAtual.texto,
    });
  }, [mensagemAtual?.id, mensagemAtual?.referencia, mensagemAtual?.texto, sentimento]);

  // Atualiza a URL (sem navegar) para refletir a mensagem visível — mantém deep-link/back.
  useEffect(() => {
    if (!mensagemAtual?.id) return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("id") !== mensagemAtual.id) {
        url.searchParams.set("id", mensagemAtual.id);
        window.history.replaceState(window.history.state, "", url.toString());
      }
    } catch {}
  }, [mensagemAtual?.id]);

  // Adiciona novas mensagens ao feed quando o usuário se aproxima do fim.
  const ensureNext = useCallback(() => {
    setFeed((prev) => {
      if (currentIndex < prev.length - 2) return prev;
      const excluir = prev.map((m) => m.id);
      const proxima = getProximaMensagemFeed(sentimento as Categoria, excluir);
      return [...prev, proxima];
    });
  }, [currentIndex, sentimento]);

  useEffect(() => {
    ensureNext();
  }, [ensureNext]);

  // Detecta qual slide está visível.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.idx);
          if (Number.isNaN(idx)) continue;
          if (!best || e.intersectionRatio > best.ratio) {
            best = { idx, ratio: e.intersectionRatio };
          }
        }
        if (best && best.ratio > 0.55) {
          setCurrentIndex((old) => (old === best!.idx ? old : best!.idx));
        }
      },
      { root: scroller, threshold: [0.25, 0.55, 0.85] },
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [feed.length]);

  // Dica visual de "arraste pra cima" na primeira abertura.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const KEY = "chosen_feed_hint_v1";
      if (!localStorage.getItem(KEY)) {
        setShowHint(true);
        const t = setTimeout(() => {
          setShowHint(false);
          localStorage.setItem(KEY, "1");
        }, 4500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  // Some com a dica assim que rolar.
  useEffect(() => {
    if (currentIndex > 0 && showHint) setShowHint(false);
  }, [currentIndex, showHint]);

  const handleToggleFav = () => {
    if (!mensagemAtual) return;
    void triggerHaptic();
    const now = toggleFavorite({
      id: mensagemAtual.id,
      categoria: sentimento,
      ref: mensagemAtual.referencia,
      text: mensagemAtual.texto,
    });
    setFavMap((prev) => ({ ...prev, [mensagemAtual.id]: now }));
    toast(now ? "Adicionada às suas escolhidas 💛" : "Removida das escolhidas");
  };

  const handleOpenShare = () => {
    void triggerHaptic();
    setShareOpen(true);
  };

  const favAtual = favMap[mensagemAtual.id] ?? false;
  const mascote = MASCOTE_POR_SENTIMENTO[sentimento];

  return (
    <div
      className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col overflow-hidden bg-background"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 2rem)",
      }}
    >
      {/* Elemento para geração da imagem de compartilhamento - otimizado */}
      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        mensagem={mensagemAtual}
        sentimento={sentimento}
      />

      {/* Imagem discreta no topo */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[42%] z-0">
        <img src={ceuAmanhecer} alt="" className="h-full w-full object-cover opacity-80" width={1024} height={640} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
      </div>

      {/* Header fixo */}
      <header className="relative shrink-0 z-20 grid grid-cols-[2.5rem_1fr_2.5rem] h-14 items-center px-4">
        <Link
          to="/home"
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-colors justify-self-start"
        >
          <ArrowLeft className="h-5 w-5 text-ink" />
        </Link>
        <span className="flex items-center justify-center gap-1.5 text-sm font-bold tracking-[0.3em] uppercase text-brand-olive">
          <img src={chosenIcone.url} alt="" className="h-6 w-6 object-contain" />
          CHOSEN
        </span>
        <button
          onClick={handleToggleFav}
          aria-label={favAtual ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-background/70 backdrop-blur justify-self-end active:scale-90 transition-transform"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${favAtual ? "fill-red-500 text-red-500" : "text-ink"}`}
            strokeWidth={2}
          />
        </button>
      </header>

      <main
        ref={scrollerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        className={`relative z-10 flex-1 min-h-0 w-full overflow-hidden touch-none snap-y snap-mandatory no-scrollbar overscroll-contain`}
        style={{ scrollBehavior: "smooth" }}
      >
        {feed.map((m, idx) => {
          const len = m.texto.length;
          const tamanho = len < 110 ? "text-[26px] sm:text-3xl" : len < 220 ? "text-[21px] sm:text-2xl" : "text-[18px] sm:text-xl";
          return (
            <section
              key={`${m.id}-${idx}`}
              data-idx={idx}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              className="snap-start snap-always h-full min-h-full w-full flex flex-col items-center justify-end px-4 sm:px-6 pt-28 pb-4"
            >
              <div className="relative flex min-h-0 max-h-full w-full max-w-md flex-col animate-in fade-in duration-500">
                {mascote && (
                  <img
                    src={mascote}
                    alt=""
                    className="pointer-events-none absolute -top-[88px] right-3 z-0 h-[120px] w-auto object-contain drop-shadow-md"
                  />
                )}
                <div data-card className="relative z-10 min-h-0 touch-pan-y overflow-y-auto overscroll-contain no-scrollbar rounded-[28px] bg-background px-6 py-6 text-left shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)]">
                  <span className="inline-flex h-7 items-center rounded-full bg-tint-lavender px-3 text-[11px] font-bold tracking-[0.15em] uppercase text-ink/70">
                    {sentimento}
                  </span>
                  <p className={`mt-4 font-bold leading-[1.2] tracking-tight text-ink break-words select-text ${tamanho}`}>
                    {m.texto}
                  </p>
                  {m.referencia && m.referencia.trim().toLowerCase() !== sentimento.trim().toLowerCase() && (
                    <p className="mt-3 text-[15px] text-ink/55">{m.referencia}</p>
                  )}

                  {m.resumo && <ResumoBlock key={m.id} text={m.resumo} />}
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {showHint && (
        <div className="pointer-events-none absolute inset-x-0 top-[18%] z-30 flex flex-col items-center gap-1 text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <ChevronUp className="h-5 w-5 animate-bounce" />
          <span className="text-[11px] font-semibold tracking-[0.15em] text-ink/50">
            Arraste para a próxima
          </span>
        </div>
      )}

      {/* Footer fixo */}
      <footer className="relative shrink-0 z-20 w-full px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+5rem)] bg-background flex items-center justify-center gap-3">
        <Button
          onClick={handleOpenShare}
          className="h-12 rounded-full border-none bg-brand-yellow text-ink hover:opacity-90 shadow-none flex items-center gap-2 px-6 transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="text-sm font-semibold tracking-wide">Compartilhar</span>
          <Share2 className="h-5 w-5 shrink-0" />
        </Button>
      </footer>
    </div>
  );
}
