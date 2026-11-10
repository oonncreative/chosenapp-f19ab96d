import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Check, ChevronRight, Bookmark, RotateCcw, BookmarkX } from "lucide-react";
import { toast } from "sonner";
import { ChosenBackdrop, ChosenHeader } from "@/components/ChosenBackdrop";
import { LIVROS_EVANGELHOS_CARTAS, LIVRO_APOCALIPSE } from "@/lib/biblia";
import {
  formatarMarcador,
  getLidos,
  getMarcador,
  getMarcadorManual,
  limparMarcadores,
  reiniciarTudo,
  type Lidos,
  type Marcador,
} from "@/lib/biblia/marcador";

export const Route = createFileRoute("/biblia/")({
  head: () => ({
    meta: [
      { title: "Bíblia — Novo Testamento | Chosen" },
      {
        name: "description",
        content:
          "Leia o Novo Testamento no Chosen, de Mateus a Judas com Apocalipse no fim, e continue de onde você parou.",
      },
      { property: "og:title", content: "Bíblia — Novo Testamento | Chosen" },
      {
        property: "og:description",
        content: "Leia o Novo Testamento e marque onde parou para continuar amanhã.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BibliaIndex,
});

function BibliaIndex() {
  const [auto, setAuto] = useState<Marcador | null>(null);
  const [manual, setManual] = useState<Marcador | null>(null);
  const [lidos, setLidos] = useState<Lidos>({});

  useEffect(() => {
    setAuto(getMarcador());
    setManual(getMarcadorManual());
    setLidos(getLidos());
  }, []);

  const ondeParou = manual ?? auto;
  const temLidos = Object.keys(lidos).length > 0;

  const desmarcar = () => {
    limparMarcadores();
    setAuto(null);
    setManual(null);
    toast("Marcador removido");
  };

  const reiniciar = () => {
    if (!window.confirm("Reiniciar toda a leitura? Isso apaga os capítulos lidos e os marcadores."))
      return;
    reiniciarTudo();
    setAuto(null);
    setManual(null);
    setLidos({});
    toast("Leitura reiniciada");
  };

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-hidden bg-background">
      <ChosenBackdrop />
      <ChosenHeader />

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar px-4 pb-32 pt-6">
        <div className="mx-auto w-full max-w-md">
          <div className="px-1 pb-4">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-ink/60">Sua leitura</span>
            <h1 className="mt-1 text-[30px] font-bold leading-tight tracking-tight text-ink">Novo Testamento</h1>
          </div>
          <div className="rounded-[28px] bg-background px-4 py-5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)]">

          <p className="text-sm text-black/60 mb-6">
            Leitura completa, sem internet. A gente guarda onde você parou.
          </p>

          {(manual || auto) && (
            <div className="flex flex-col gap-2 mb-3">
              {manual && (
                <ContinuarCard
                  titulo="Você marcou aqui"
                  marcador={manual}
                  destaque
                />
              )}
              {auto && (!manual || manual.livro !== auto.livro || manual.capitulo !== auto.capitulo) && (
                <ContinuarCard titulo="Continuar de onde parei" marcador={auto} />
              )}
            </div>
          )}

          {(manual || auto || temLidos) && (
            <div className="mb-8 flex flex-wrap gap-2">
              {(manual || auto) && (
                <button
                  onClick={desmarcar}
                  className="flex h-9 items-center gap-1.5 rounded-full bg-black/[0.04] px-3 text-[12px] font-medium text-black/60 active:scale-[0.98] transition"
                >
                  <BookmarkX className="h-3.5 w-3.5" />
                  Desmarcar
                </button>
              )}
              <button
                onClick={reiniciar}
                className="flex h-9 items-center gap-1.5 rounded-full bg-black/[0.04] px-3 text-[12px] font-medium text-black/60 active:scale-[0.98] transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reiniciar tudo
              </button>
            </div>
          )}

          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mb-3">
            Evangelhos e cartas
          </h2>
          <ul className="flex flex-col gap-1.5">
            {LIVROS_EVANGELHOS_CARTAS.map((l) => (
              <li key={l.slug}>
                <LivroLinha
                  slug={l.slug}
                  nome={l.nome}
                  capitulos={l.capitulos}
                  lidos={(lidos[l.slug] ?? []).length}
                  aqui={ondeParou?.livro === l.slug ? ondeParou.capitulo : null}
                />
              </li>
            ))}
          </ul>

          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/40 mt-8 mb-3">
            Profecia
          </h2>
          <LivroLinha
            slug={LIVRO_APOCALIPSE.slug}
            nome={LIVRO_APOCALIPSE.nome}
            capitulos={LIVRO_APOCALIPSE.capitulos}
            lidos={(lidos[LIVRO_APOCALIPSE.slug] ?? []).length}
            aqui={ondeParou?.livro === LIVRO_APOCALIPSE.slug ? ondeParou.capitulo : null}
            destaque
          />
          </div>
        </div>
      </main>

    </div>
  );
}

function LivroLinha({
  slug,
  nome,
  capitulos,
  lidos,
  aqui,
  destaque,
}: {
  slug: string;
  nome: string;
  capitulos: number;
  lidos: number;
  aqui: number | null;
  destaque?: boolean;
}) {
  const completo = lidos >= capitulos;
  const pct = Math.round((lidos / capitulos) * 100);
  return (
    <Link
      to="/biblia/$livro"
      params={{ livro: slug }}
      className={`flex items-center gap-3 rounded-2xl active:scale-[0.99] transition-all px-4 py-3 ${
        destaque ? "bg-brand-yellow" : "bg-muted/60"
      }`}
    >
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className={`text-[15px] text-black truncate ${destaque ? "font-semibold" : ""}`}>
            {nome}
          </span>
          {completo && <Check className="h-3.5 w-3.5 shrink-0 text-black/60" />}
          {aqui !== null && (
            <span className="flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shrink-0">
              <Bookmark className="h-2.5 w-2.5 fill-[#f1f26c] text-[#f1f26c]" />
              Cap. {aqui}
            </span>
          )}
        </span>
        <span className="mt-1.5 block h-1 w-full rounded-full bg-black/10">
          <span
            className="block h-1 rounded-full bg-black transition-all"
            style={{ width: `${pct}%` }}
          />
        </span>
      </span>
      <span className="flex items-center gap-2 text-[11px] text-black/40 shrink-0">
        {lidos}/{capitulos}
        <ChevronRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function ContinuarCard({
  titulo,
  marcador,
  destaque,
}: {
  titulo: string;
  marcador: Marcador;
  destaque?: boolean;
}) {
  return (
    <Link
      to="/biblia/$livro/$capitulo"
      params={{ livro: marcador.livro, capitulo: String(marcador.capitulo) }}
      hash={`v${marcador.versiculo}`}
      className={`flex items-center gap-3 rounded-2xl px-4 py-4 active:scale-[0.99] transition-all ${
        destaque ? "bg-brand-yellow text-ink" : "bg-muted/60 text-ink"
      }`}
    >
      <Bookmark
        className={`h-5 w-5 shrink-0 ${destaque ? "text-ink fill-ink" : "text-ink/50"}`}
      />
      <span className="flex-1 min-w-0">
        <span
          className={`block text-[10px] font-bold tracking-[0.25em] uppercase ${
            "text-ink/50"
          }`}
        >
          {titulo}
        </span>
        <span className="block text-[15px] mt-0.5 truncate">
          {formatarMarcador(marcador)}
        </span>
      </span>
      <ChevronRight className={`h-4 w-4 ${"text-ink/50"}`} />
    </Link>
  );
}
