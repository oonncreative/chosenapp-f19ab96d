import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronRight, Loader2, X } from "lucide-react";
import { ChosenBackdrop, ChosenHeader } from "@/components/ChosenBackdrop";
import { LIVROS_AT, LIVROS_NT } from "@/lib/biblia";
import { buscarTexto, interpretarReferencia, type Resultado } from "@/lib/biblia/busca";

export const Route = createFileRoute("/ler-biblia")({
  head: () => ({
    meta: [
      { title: "Ler a Bíblia completa | Chosen" },
      {
        name: "description",
        content:
          "Bíblia completa no Chosen: Antigo e Novo Testamento, com busca por referência (ex.: Êxodo 3:22) ou por palavra.",
      },
      { property: "og:title", content: "Ler a Bíblia completa | Chosen" },
      {
        property: "og:description",
        content: "Antigo e Novo Testamento, com busca por referência ou por palavra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LerBiblia,
});

const EXEMPLOS = ["Êxodo 3:22", "Salmos 23", "João 3:16", "amor", "não temas"];

function destacar(texto: string, consulta: string) {
  const palavras = consulta.trim().split(/\s+/).filter((p) => p.length >= 3);
  if (!palavras.length) return texto;
  const strip = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const base = strip(texto);
  const marcas = new Array(texto.length).fill(false);
  for (const p of palavras) {
    const alvo = strip(p);
    let i = base.indexOf(alvo);
    while (i >= 0) {
      for (let k = i; k < i + alvo.length; k++) marcas[k] = true;
      i = base.indexOf(alvo, i + 1);
    }
  }
  const partes: { t: string; m: boolean }[] = [];
  for (let i = 0; i < texto.length; i++) {
    const last = partes[partes.length - 1];
    if (last && last.m === marcas[i]) last.t += texto[i];
    else partes.push({ t: texto[i], m: marcas[i] });
  }
  return partes.map((p, i) =>
    p.m ? (
      <mark key={i} className="bg-[#f1f26c] text-black rounded px-0.5">
        {p.t}
      </mark>
    ) : (
      <span key={i}>{p.t}</span>
    ),
  );
}

function LerBiblia() {
  const navigate = useNavigate();
  const [aba, setAba] = useState<"at" | "nt">("at");
  const [q, setQ] = useState("");
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Resultado[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const pedido = useRef(0);

  const ref = q.trim() ? interpretarReferencia(q) : null;

  const irPara = (slug: string, capitulo: number, versiculo?: number) =>
    navigate({
      to: "/biblia/$livro/$capitulo",
      params: { livro: slug, capitulo: String(capitulo) },
      hash: versiculo ? `v${versiculo}` : undefined,
    });

  const pesquisar = async (texto: string) => {
    const t = texto.trim();
    if (!t) return;
    const r = interpretarReferencia(t);
    if (r) return irPara(r.livro.slug, r.capitulo, r.versiculo);
    const id = ++pedido.current;
    setBusca(t);
    setCarregando(true);
    setResultados(null);
    const res = await buscarTexto(t);
    if (id !== pedido.current) return;
    setResultados(res);
    setCarregando(false);
  };

  useEffect(() => {
    if (!q.trim()) {
      pedido.current++;
      setResultados(null);
      setCarregando(false);
    }
  }, [q]);

  const lista = aba === "at" ? LIVROS_AT : LIVROS_NT;

  return (
    <div className="relative flex flex-col h-[100dvh] overflow-hidden bg-background">
      <ChosenBackdrop />
      <ChosenHeader />

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain no-scrollbar px-4 pb-32">
        <div className="mx-auto w-full max-w-md">
          <div className="pt-6 pb-4 px-1">
            <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-ink/60">Bíblia completa</span>
            <h1 className="mt-1 text-[30px] font-bold leading-tight tracking-tight text-ink">O que você quer ler hoje?</h1>
          </div>
          <div className="rounded-[28px] bg-background px-4 py-5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              pesquisar(q);
            }}
            className="mt-2 flex items-center gap-2 rounded-full bg-muted px-4 h-14 ring-1 ring-transparent focus-within:ring-ink/30"
          >
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex.: Êxodo 3:22 ou uma palavra"
              enterKeyHint="search"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Limpar">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </form>

          {ref && (
            <button
              onClick={() => irPara(ref.livro.slug, ref.capitulo, ref.versiculo)}
              className="mt-3 w-full flex items-center justify-between rounded-2xl bg-brand-yellow text-ink px-4 py-3.5 font-semibold active:scale-[0.99] transition-transform"
            >
              <span className="text-[15px] font-medium">
                Abrir {ref.livro.nome} {ref.capitulo}
                {ref.versiculo ? `:${ref.versiculo}` : ""}
                {ref.versiculoFim ? `-${ref.versiculoFim}` : ""}
              </span>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {!q.trim() && (
            <div className="mt-3 flex flex-wrap gap-2">
              {EXEMPLOS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setQ(e);
                    pesquisar(e);
                  }}
                  className="rounded-full bg-tint-lavender px-3 py-1.5 text-[12px] font-medium text-ink/80 active:scale-95 transition"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {q.trim() && !ref && !carregando && resultados === null && (
            <p className="mt-3 text-[13px] text-gray-500">
              Toque em buscar para procurar “{q.trim()}” em toda a Bíblia.
            </p>
          )}

          {carregando && (
            <div className="mt-6 flex items-center gap-2 text-[13px] text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Procurando em toda a Bíblia…
            </div>
          )}

          {resultados && (
            <section className="mt-5">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">
                {resultados.length === 0
                  ? "Nada encontrado"
                  : `${resultados.length}${resultados.length >= 80 ? "+" : ""} versículos`}
              </p>
              <ul className="divide-y divide-gray-100">
                {resultados.map((r) => (
                  <li key={`${r.livro.slug}-${r.capitulo}-${r.versiculo}`}>
                    <button
                      onClick={() => irPara(r.livro.slug, r.capitulo, r.versiculo)}
                      className="w-full text-left py-3"
                    >
                      <p className="text-[12px] font-semibold text-black">
                        {r.livro.nome} {r.capitulo}:{r.versiculo}
                      </p>
                      <p className="mt-0.5 text-[14px] leading-relaxed text-gray-700 font-serif">
                        {destacar(r.texto, busca)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!q.trim() && (
            <>
              <div className="mt-6 grid grid-cols-2 rounded-full bg-muted p-1">
                {(["at", "nt"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAba(t)}
                    className={`rounded-full py-2.5 text-[13px] font-semibold transition-colors ${
                      aba === t ? "bg-brand-yellow text-ink shadow-sm" : "text-ink/50"
                    }`}
                  >
                    {t === "at" ? "Antigo Testamento" : "Novo Testamento"}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-gray-400 text-center">
                {lista.length} livros · Texto completo · Almeida Atualizada
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {lista.map((l) => (
                  <li key={l.slug}>
                    <Link
                      to="/biblia/$livro"
                      params={{ livro: l.slug }}
                      className="flex items-center justify-between rounded-2xl bg-muted/60 px-3.5 py-3 active:scale-[0.98] transition"
                    >
                      <span className="min-w-0">
                        <span className="block text-[14px] font-medium text-black truncate">
                          {l.nome}
                        </span>
                        <span className="block text-[11px] text-gray-400">
                          {l.capitulos} {l.capitulos === 1 ? "capítulo" : "capítulos"}
                        </span>
                      </span>
                      <span className="text-[11px] font-bold text-brand-olive/70">{l.abrev}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
