import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import type { Mensagem } from "@/lib/data";
import { FORMATS, THEMES, type ShareOptions } from "./themes";
import { MASCOTE_POR_SENTIMENTO } from "@/lib/mascotes";
import ceuAmanhecer from "@/assets/ceu-amanhecer.jpg";

interface Props {
  mensagem: Mensagem;
  options: ShareOptions;
  sentimento?: string;
}

// Renderiza o conteúdo da imagem de compartilhamento no tamanho nativo do formato.
// Mantém o layout original (story branca) como padrão; só muda quando o usuário
// altera tema/formato/toggles/extras.
export const ShareCanvas = forwardRef<HTMLDivElement, Props>(function ShareCanvas(
  { mensagem, options, sentimento },
  ref,
) {
  if (options.estilo === "moderna") return <ModernaCanvas ref={ref} mensagem={mensagem} options={options} sentimento={sentimento} />;
  const { width, height } = FORMATS[options.format];
  const c = THEMES[options.theme];
  const isHorizontal = options.format === "horizontal";
  const isSquare = options.format === "quadrado";
  const isPost = options.format === "post";

  // Escala de fonte por formato (story = base)
  const scale = isHorizontal ? 0.85 : isSquare ? 0.78 : isPost ? 0.9 : 1;

  const topPad = isHorizontal ? 80 : isSquare ? 80 : isPost ? 100 : 140;
  const bottomPad = isHorizontal ? 70 : isSquare ? 70 : isPost ? 80 : 100;
  const sidePad = isHorizontal ? 140 : 80;

  const textScaleFactor = 1 - (options.textScale ?? 0) * 0.12;
  const textSize = Math.round(72 * scale * textScaleFactor);
  const refSize = Math.round(32 * scale);
  const resumoSize = Math.round(
    (mensagem.resumo && mensagem.resumo.length > 600
      ? 24
      : mensagem.resumo && mensagem.resumo.length > 400
      ? 28
      : mensagem.resumo && mensagem.resumo.length > 250
      ? 32
      : 34) * scale,
  );
  const resumoClamp =
    mensagem.resumo && mensagem.resumo.length > 600 ? 14 : 12;

  return (
    <div
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: c.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* Topo: CHOSEN */}
      <div style={{ paddingTop: `${topPad}px`, display: "flex", justifyContent: "center" }}>
        <p
          style={{
            fontSize: `${Math.round(28 * scale)}px`,
            fontWeight: 300,
            letterSpacing: "0.4em",
            color: c.muted,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Chosen
        </p>
      </div>

      {/* Conteúdo central */}
      <div
        style={{
          padding: `0 ${sidePad}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: `${Math.round(60 * scale)}px`,
          width: "100%",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontSize: `${textSize}px`,
            fontWeight: 300,
            lineHeight: 1.2,
            color: c.fg,
            margin: 0,
          }}
        >
          "{mensagem.texto}"
        </p>
        {options.showRef && (
          <p
            style={{
              fontSize: `${refSize}px`,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: c.fg,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {mensagem.referencia}
          </p>
        )}
        {options.showResumo && mensagem.resumo && (
          <p
            style={{
              marginTop: `${Math.round(40 * scale)}px`,
              fontSize: `${resumoSize}px`,
              fontWeight: 300,
              color: c.sub,
              padding: "0 40px",
              lineHeight: 1.5,
              maxWidth: "900px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: resumoClamp,
            }}
          >
            {mensagem.resumo}
          </p>
        )}
      </div>

      {/* Mascote (canto inferior esquerdo) */}
      {options.mascoteUrl && (
        <img
          src={options.mascoteUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            left: `${Math.round(60 * scale)}px`,
            bottom: `${bottomPad + 20}px`,
            width: `${Math.round(180 * scale)}px`,
            height: `${Math.round(180 * scale)}px`,
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Rodapé */}
      {options.showFooter && (
        <div
          style={{
            paddingBottom: `${bottomPad}px`,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontSize: `${Math.round(20 * scale)}px`,
              fontWeight: 300,
              color: c.muted,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {options.signature
              ? `Enviado por ${options.signature}`
              : "Essa foi escolhida especialmente para mim"}
          </p>
          <p
            style={{
              fontSize: `${Math.round(24 * scale)}px`,
              fontWeight: 500,
              color: c.accent,
              margin: 0,
            }}
          >
            chosen.oonn.com.br
          </p>
        </div>
      )}
    </div>
  );
});

// Estilo "Moderna": igual à tela de frase do app — céu ao fundo, card branco e mascote.
const ModernaCanvas = forwardRef<HTMLDivElement, Props>(function ModernaCanvas(
  { mensagem, options, sentimento },
  ref,
) {
  const { width, height } = FORMATS[options.format];
  const isH = options.format === "horizontal";
  const isSq = options.format === "quadrado";
  const isPost = options.format === "post";
  const scale = isH ? 0.8 : isSq ? 0.72 : isPost ? 0.88 : 1;
  const mascote = options.mascoteUrl ?? (sentimento ? MASCOTE_POR_SENTIMENTO[sentimento] : null);
  const tf = 1 - (options.textScale ?? 0) * 0.12;
  const len = mensagem.texto.length;
  const baseText = len < 110 ? 64 : len < 220 ? 52 : 44;
  const mascH = Math.round(260 * scale);
  const showResumo = options.showResumo && !!mensagem.resumo && !isH;
  const ink = "#1c1c1c";

  // Reduz a letra até a reflexão inteira caber no cartão — sem cortar com "...".
  const [fit, setFit] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const passes = useRef(0);
  const deps = [
    options.format,
    options.showResumo,
    options.showRef,
    options.textScale,
    options.mascoteUrl,
    options.signature,
    options.showFooter,
    sentimento,
    mensagem.texto,
    mensagem.resumo,
  ];

  useLayoutEffect(() => {
    passes.current = 0;
    setFit(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const cs = getComputedStyle(wrap);
    const avail = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const need = card.offsetHeight;
    if (need <= avail + 1 || passes.current >= 10) return;
    passes.current += 1;
    const ratio = Math.max(0.5, Math.min(0.97, avail / need));
    setFit((f) => Math.max(0.5, +(f * ratio).toFixed(3)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, ...deps]);

  const textSize = Math.round(baseText * scale * tf * (fit < 0.9 ? 0.94 : 1));
  const resumoSize = Math.max(16, Math.round(27 * scale * (fit < 0.97 ? fit : 1)));
  const cardPadY = Math.round((fit < 0.85 ? 44 : 64) * scale);

  return (
    <div
      ref={ref}
      style={{
        width, height, position: "relative", overflow: "hidden",
        backgroundColor: "#fbf8f1", fontFamily: "sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}
    >
      <img src={ceuAmanhecer} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: "linear-gradient(to bottom, rgba(251,248,241,0) 25%, rgba(251,248,241,0.85) 55%, #fbf8f1 75%)" }} />
      <p style={{ position: "relative", marginTop: Math.round((isH || isSq ? 60 : 110) * scale), fontSize: Math.round(30 * scale), fontWeight: 800, letterSpacing: "0.35em", color: "#6b6a2e" }}>
        CHOSEN
      </p>
      <div style={{ position: "relative", flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: `${mascH * 0.6}px ${Math.round(isH ? 260 : 70 * scale)}px ${Math.round(40 * scale)}px` }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 1100 }}>
          {mascote && (
            <img src={mascote} alt="" crossOrigin="anonymous" style={{ position: "absolute", right: Math.round(40 * scale), top: -mascH * 0.72, height: mascH, width: "auto", objectFit: "contain" }} />
          )}
          <div style={{ position: "relative", background: "#ffffff", borderRadius: Math.round(56 * scale), padding: `${Math.round(64 * scale)}px ${Math.round(60 * scale)}px`, boxShadow: "0 30px 80px -30px rgba(0,0,0,0.25)", textAlign: "left" }}>
            {sentimento && (
              <span style={{ display: "inline-block", background: "#ece8f6", color: "rgba(28,28,28,0.7)", borderRadius: 999, padding: `${Math.round(10 * scale)}px ${Math.round(24 * scale)}px`, fontSize: Math.round(22 * scale), fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {sentimento}
              </span>
            )}
            <p style={{ marginTop: Math.round(32 * scale), fontSize: textSize, fontWeight: 800, lineHeight: 1.2, color: ink, letterSpacing: "-0.01em" }}>
              {mensagem.texto}
            </p>
            {options.showRef && mensagem.referencia && mensagem.referencia.trim().toLowerCase() !== (sentimento ?? "").trim().toLowerCase() && (
              <p style={{ marginTop: Math.round(22 * scale), fontSize: Math.round(30 * scale), color: "rgba(28,28,28,0.55)" }}>{mensagem.referencia}</p>
            )}
            {showResumo && (
              <div style={{ marginTop: Math.round(40 * scale), paddingTop: Math.round(32 * scale), borderTop: "2px solid rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: Math.round(30 * scale), fontWeight: 800, color: ink }}>Para refletir</p>
                <p style={{ marginTop: 12, fontSize: Math.round(27 * scale), lineHeight: 1.55, color: "rgba(28,28,28,0.7)", overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: isSq ? 3 : isPost ? 5 : 9 }}>
                  {mensagem.resumo}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {options.showFooter && (
        <div style={{ position: "relative", paddingBottom: Math.round((isH || isSq ? 50 : 90) * scale), textAlign: "center" }}>
          <p style={{ fontSize: Math.round(22 * scale), fontStyle: "italic", color: "rgba(28,28,28,0.5)" }}>
            {options.signature ? `Enviado por ${options.signature}` : "Essa foi escolhida especialmente para mim"}
          </p>
          <p style={{ marginTop: 8, fontSize: Math.round(26 * scale), fontWeight: 700, color: ink }}>chosen.oonn.com.br</p>
        </div>
      )}
    </div>
  );
});
