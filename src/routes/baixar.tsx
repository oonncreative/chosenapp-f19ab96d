import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  APP_STORE_URL,
  PLAY_URL,
  SITE_URL,
  detectarPlataforma,
  type Plataforma,
} from "@/lib/storeLinks";
import logo from "@/assets/chosen-icone.png.asset.json";

export const Route = createFileRoute("/baixar")({
  head: () => ({
    meta: [
      { title: "Baixar o Chosen — inspirações pra cada momento do dia" },
      {
        name: "description",
        content:
          "Baixe o Chosen no iPhone ou Android, ou use direto pelo navegador. Versículos, orações, Bíblia e palavras de motivação todos os dias.",
      },
      { property: "og:title", content: "Baixar o Chosen" },
      {
        property: "og:description",
        content: "Versículos, orações e motivação pra cada momento do seu dia.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/baixar` },
      { property: "og:image", content: `${SITE_URL}/og-chosen.jpg?v=2` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Baixar o Chosen" },
      {
        name: "twitter:description",
        content: "Versículos, orações e motivação pra cada momento do seu dia.",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-chosen.jpg?v=2` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/baixar` }],
  }),
  component: Baixar,
});

const RECURSOS = [
  {
    titulo: "Palavras pra cada momento",
    texto: "Versículos, salmos e frases escolhidas conforme a hora do seu dia.",
  },
  {
    titulo: "Bíblia — Novo Testamento",
    texto: "Leitura completa com marcador de onde você parou e trilha de progresso.",
  },
  {
    titulo: "Orações guiadas",
    texto: "Ora comigo em etapas, devocional de 3 minutos e orações curtas.",
  },
  {
    titulo: "Lembretes ao longo do dia",
    texto: "Avisos discretos com uma palavra boa, no ritmo que você escolher.",
  },
];

function Baixar() {
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);

  useEffect(() => {
    setPlataforma(detectarPlataforma());
  }, []);

  const ios = plataforma === "ios";
  const android = plataforma === "android";

  return (
    <div className="h-[100dvh] overflow-y-auto overscroll-contain bg-background">
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-6 pb-16 pt-[max(env(safe-area-inset-top),2.5rem)] text-center">
        <img
          src={logo.url}
          alt="Logo do Chosen"
          className="h-20 w-20 rounded-3xl object-contain"
        />
        <h1 className="mt-5 text-3xl font-bold uppercase tracking-tight text-brand-olive">
          Chosen
        </h1>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-foreground/60">
          Inspirações escolhidas pra cada momento do seu dia. Versículos, orações,
          Bíblia e palavras de motivação — simples, leve e sem distração.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full px-5 py-3.5 text-sm font-medium transition-opacity active:opacity-80 ${
              android
                ? "border border-foreground/15 text-foreground"
                : "bg-foreground text-background"
            }`}
          >
            Baixar no iPhone
          </a>
          <a
            href={PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full px-5 py-3.5 text-sm font-medium transition-opacity active:opacity-80 ${
              ios
                ? "border border-foreground/15 text-foreground"
                : "bg-foreground text-background"
            }`}
          >
            Baixar no Android
          </a>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-5 py-3.5 text-sm font-medium text-foreground/60"
          >
            Usar pelo navegador
          </a>
        </div>

        <ul className="mt-10 w-full space-y-3 text-left">
          {RECURSOS.map((r) => (
            <li
              key={r.titulo}
              className="rounded-2xl border border-foreground/10 px-4 py-3.5"
            >
              <p className="text-sm font-medium text-foreground">{r.titulo}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-foreground/55">
                {r.texto}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-foreground/40">
          Gratuito · Sem cadastro · Funciona offline
        </p>
        <div className="mt-3 flex gap-4 text-xs text-foreground/40">
          <a href="/privacy">Privacidade</a>
          <a href="/terms">Termos</a>
        </div>
      </main>
    </div>
  );
}
