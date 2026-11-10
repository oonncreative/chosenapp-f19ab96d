import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { getLivro } from "@/lib/biblia";
import mascote from "@/assets/img/mascote-1.webp";
import {
  getLidosDoLivro,
  getMarcador,
  getMarcadorManual,
  reiniciarLivro,
  setLido,
} from "@/lib/biblia/marcador";

export const Route = createFileRoute("/biblia/$livro/")({
  loader: ({ params }) => {
    const livro = getLivro(params.livro);
    if (!livro) throw notFound();
    return livro;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Livro não encontrado | Chosen" }, { name: "robots", content: "noindex" }],
      };
    }
    const titulo = `${loaderData.nome} — Bíblia NT | Chosen`;
    const desc = `Leia ${loaderData.nome} no Chosen: ${loaderData.capitulos} capítulos, com marcador de onde você parou.`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: desc },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: CapitulosPage,
});

function CapitulosPage() {
  const livro = Route.useLoaderData();
  const [ultimoCap, setUltimoCap] = useState<number | null>(null);
  const [lidos, setLidos] = useState<number[]>([]);

  useEffect(() => {
    const m = getMarcadorManual() ?? getMarcador();
    if (m && m.livro === livro.slug) setUltimoCap(m.capitulo);
    else setUltimoCap(null);
    setLidos(getLidosDoLivro(livro.slug));
  }, [livro.slug]);

  const alternar = (c: number) => {
    const novo = !lidos.includes(c);
    setLido(livro.slug, c, novo);
    setLidos(getLidosDoLivro(livro.slug));
  };

  const reiniciar = () => {
    if (!window.confirm(`Reiniciar a leitura de ${livro.nome}? Isso apaga os capítulos lidos e o marcador deste livro.`))
      return;
    reiniciarLivro(livro.slug);
    setLidos([]);
    setUltimoCap(null);
    toast(`Leitura de ${livro.nome} reiniciada`);
  };

  const pct = Math.round((lidos.length / livro.capitulos) * 100);

  // Onde o mascote fica: marcador, senão o primeiro capítulo ainda não lido.
  const primeiroNaoLido =
    Array.from({ length: livro.capitulos }, (_, i) => i + 1).find((c) => !lidos.includes(c)) ??
    livro.capitulos;
  const atual = ultimoCap ?? primeiroNaoLido;

  return (
    <div className="flex flex-col h-[100dvh] bg-white">
      <header className="grid grid-cols-3 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] pb-2 shrink-0">
        <Link
          to={livro.testamento === "at" ? "/ler-biblia" : "/biblia"}
          aria-label="Voltar"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 justify-self-start"
        >
          <ArrowLeft className="h-6 w-6 text-gray-400" />
        </Link>
        <span className="text-sm font-bold tracking-[0.3em] uppercase text-black text-center">
          CHOSEN
        </span>
        <span />
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-28 pt-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl bg-[#f1f26c] px-5 py-5">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-black/50">
              {livro.testamento === "at" ? "Antigo Testamento" : "Novo Testamento"}
            </p>
            <h1 className="mt-1 text-[30px] leading-none font-semibold text-black tracking-tight">
              {livro.nome}
            </h1>
            <p className="text-[13px] text-black/60 mt-2">
              {livro.capitulos} {livro.capitulos === 1 ? "capítulo" : "capítulos"} ·{" "}
              {lidos.length} {lidos.length === 1 ? "lido" : "lidos"} · {pct}%
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-black/10">
              <div
                className="h-1.5 rounded-full bg-black transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-black/40 mt-5 mb-1">
            Siga a trilha: toque no número para ler e no tique para marcar como lido.
          </p>

          {(lidos.length > 0 || ultimoCap !== null) && (
            <button
              onClick={reiniciar}
              className="mb-2 flex h-9 items-center gap-1.5 rounded-full bg-black/[0.04] px-3 text-[12px] font-medium text-black/60 active:scale-[0.98] transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar leitura deste livro
            </button>
          )}

          <TrilhaCapitulos
            slug={livro.slug}
            total={livro.capitulos}
            lidos={lidos}
            atual={atual}
            onAlternar={alternar}
          />
        </div>
      </main>


      <AppFooter />
    </div>
  );
}

// Trilha em zigue-zague: cada capítulo é uma parada do caminho e o mascote
// caminha até onde a pessoa está.
function TrilhaCapitulos({
  slug,
  total,
  lidos,
  atual,
  onAlternar,
}: {
  slug: string;
  total: number;
  lidos: number[];
  atual: number;
  onAlternar: (c: number) => void;
}) {
  const navigate = useNavigate();
  const COLS = 4;
  const W = 320;
  const ROW_H = 88;
  const TOP = 82;
  const linhas = Math.ceil(total / COLS);
  const H = TOP + (linhas - 1) * ROW_H + 60;

  const pontos = Array.from({ length: total }, (_, i) => {
    const cap = i + 1;
    const linha = Math.floor(i / COLS);
    const idx = i % COLS;
    const col = linha % 2 === 0 ? idx : COLS - 1 - idx;
    return { cap, x: 40 + col * 80, y: TOP + linha * ROW_H };
  });

  const d = pontos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const lidosSet = new Set(lidos);
  const ultimoLidoIdx = pontos.reduce((acc, p, i) => (lidosSet.has(p.cap) ? i : acc), -1);
  const dFeito =
    ultimoLidoIdx >= 0
      ? pontos
          .slice(0, ultimoLidoIdx + 1)
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ")
      : "";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      preserveAspectRatio="xMidYMin meet"
      className="block w-full h-auto overflow-visible"
      style={{ aspectRatio: `${W} / ${H}` }}
      role="list"
      aria-label="Trilha de capítulos"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        className="text-black/10"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 14"
      />
      {dFeito && (
        <path
          d={dFeito}
          fill="none"
          stroke="currentColor"
          className="text-black/70"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1 14"
        />
      )}

      {pontos.map((p) => {
        const lido = lidosSet.has(p.cap);
        const aqui = p.cap === atual;
        const fill = aqui ? "#000000" : lido ? "#f1f26c" : "#f2f2f2";
        const texto = aqui ? "#ffffff" : "#000000";
        return (
          <g key={p.cap} role="listitem">
            {aqui && (
              <circle cx={p.x} cy={p.y} r={30} fill="none" stroke="#f1f26c" strokeWidth={3} />
            )}
            <g
              onClick={() =>
                navigate({
                  to: "/biblia/$livro/$capitulo",
                  params: { livro: slug, capitulo: String(p.cap) },
                })
              }
              className="cursor-pointer"
            >
              <circle cx={p.x} cy={p.y} r={24} fill={fill} />
              <text
                x={p.x}
                y={p.y + 6}
                textAnchor="middle"
                fontSize={16}
                fontWeight={aqui ? 700 : 500}
                fill={texto}
              >
                {p.cap}
              </text>
            </g>

            <g
              onClick={(e) => {
                e.stopPropagation();
                onAlternar(p.cap);
              }}
              className="cursor-pointer"
              role="button"
              aria-label={`Marcar capítulo ${p.cap} como lido`}
            >
              <circle
                cx={p.x + 19}
                cy={p.y - 19}
                r={10}
                fill={lido ? "#000000" : "#ffffff"}
                stroke={lido ? "#000000" : "rgba(0,0,0,0.15)"}
                strokeWidth={1.5}
              />
              <path
                d={`M ${p.x + 14.5} ${p.y - 19} l 3 3 l 5.5 -5.5`}
                fill="none"
                stroke={lido ? "#ffffff" : "rgba(0,0,0,0.2)"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {aqui && (
              <image
                href={mascote}
                x={p.x - 24}
                y={p.y - 78}
                width={48}
                height={48}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
