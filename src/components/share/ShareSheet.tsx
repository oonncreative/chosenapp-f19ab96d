import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Share2, Check } from "lucide-react";
import type { Mensagem } from "@/lib/data";
import { ShareCanvas } from "./ShareCanvas";
import {
  DEFAULT_SHARE_OPTIONS,
  FORMATS,
  MASCOTES,
  THEMES,
  type ShareFormat,
  type ShareOptions,
  type ShareTheme,
} from "./themes";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mensagem: Mensagem;
  sentimento: string;
}

const THEME_LABEL: Record<ShareTheme, string> = {
  branco: "Branco",
  preto: "Preto",
  creme: "Creme",
  coral: "Coral",
};

export function ShareSheet({ open, onOpenChange, mensagem, sentimento }: Props) {
  const [options, setOptions] = useState<ShareOptions>(DEFAULT_SHARE_OPTIONS);
  const [isSharing, setIsSharing] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { width, height } = FORMATS[options.format];
  // Preview escalonado pra caber em ~280px de largura
  const previewMaxW = 280;
  const previewScale = previewMaxW / width;
  const previewW = width * previewScale;
  const previewH = height * previewScale;

  const update = <K extends keyof ShareOptions>(key: K, value: ShareOptions[K]) =>
    setOptions((o) => ({ ...o, [key]: value }));

  const handleShare = async () => {
    if (!exportRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics").catch(
        () => ({ Haptics: null, ImpactStyle: null } as any),
      );
      if (Haptics) await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});

      // iPhone/WebView: imagens (mascote, céu) às vezes somem na captura.
      // Convertemos para data URL, esperamos carregar e fazemos uma captura de aquecimento.
      const node = exportRef.current;
      const toData = async (url: string) => {
        if (!url || url.startsWith("data:")) return url;
        const r = await fetch(url, { cache: "force-cache" });
        const b = await r.blob();
        return await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.onerror = rej;
          fr.readAsDataURL(b);
        });
      };
      await Promise.all(
        Array.from(node.querySelectorAll("img")).map(async (img) => {
          try {
            const src = img.getAttribute("src") || "";
            if (src && !src.startsWith("data:")) img.src = await toData(new URL(src, location.href).href);
            await img.decode().catch(() => {});
          } catch {}
        }),
      );
      await Promise.all(
        Array.from(node.querySelectorAll<HTMLElement>("*")).map(async (el) => {
          const m = el.style.backgroundImage?.match(/url\(["']?([^"')]+)["']?\)/);
          if (m && !m[1].startsWith("data:")) {
            try { el.style.backgroundImage = `url("${await toData(new URL(m[1], location.href).href)}")`; } catch {}
          }
        }),
      );
      const captureOpts = {
        width,
        height,
        pixelRatio: 1,
        skipFonts: false,
        fontEmbedCSS: "",
        style: { visibility: "visible", position: "static", left: "0", top: "0", transform: "none" },
      };
      await htmlToImage.toPng(node, captureOpts).catch(() => {});
      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        width,
        height,
        pixelRatio: 1,
        skipFonts: false,
        fontEmbedCSS: "",
        style: { visibility: "visible", position: "static", left: "0", top: "0", transform: "none" },
      });
      if (!dataUrl || dataUrl === "data:,") throw new Error("Imagem vazia");

      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      const text = `"${mensagem.texto}" - ${mensagem.referencia}`;

      if (isNative) {
        const { Filesystem, Directory } = await import("@capacitor/filesystem");
        const { Share } = await import("@capacitor/share");
        const fileName = `chosen-${Date.now()}.png`;
        await Filesystem.writeFile({
          path: fileName,
          data: dataUrl.split(",")[1],
          directory: Directory.Cache,
        });
        const file = await Filesystem.getUri({ path: fileName, directory: Directory.Cache });
        await Share.share({ title: "Chosen", text, url: file.uri, dialogTitle: "Compartilhar" });
      } else if (navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `chosen-${sentimento}.png`, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "Chosen", text });
          } else {
            triggerDownload(dataUrl, sentimento);
          }
        } catch {
          triggerDownload(dataUrl, sentimento);
        }
      } else {
        triggerDownload(dataUrl, sentimento);
      }
      onOpenChange(false);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Erro ao compartilhar:", err);
        alert("Não foi possível compartilhar. Tente novamente.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92dvh] overflow-y-auto rounded-t-2xl p-0"
      >
        <SheetHeader className="px-5 pt-5 pb-2 text-left">
          <SheetTitle className="text-base font-semibold">Personalizar compartilhamento</SheetTitle>
        </SheetHeader>

        {/* Preview */}
        <div className="flex justify-center px-5 py-3">
          <div
            style={{
              width: previewW,
              height: previewH,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
              background: THEMES[options.theme].bg,
            }}
          >
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
                width,
                height,
              }}
            >
              <ShareCanvas mensagem={mensagem} options={options} sentimento={sentimento} />
            </div>
          </div>
        </div>

        {/* Canvas oculto pra exportação no tamanho nativo */}
        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <ShareCanvas ref={exportRef} mensagem={mensagem} options={options} sentimento={sentimento} />
        </div>

        {/* Controles */}
        <div className="space-y-5 px-5 pb-5">
          {/* Estilo */}
          <Section title="Estilo">
            <div className="grid grid-cols-2 gap-2">
              {(["minimalista", "moderna"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => update("estilo", e)}
                  className={`h-11 rounded-full border text-sm font-semibold transition-colors ${
                    options.estilo === e ? "border-black bg-black text-white" : "border-gray-200"
                  }`}
                >
                  {e === "minimalista" ? "Minimalista" : "Moderna"}
                </button>
              ))}
            </div>
          </Section>

          {/* Tema */}
          {options.estilo === "minimalista" && (
          <Section title="Tema">
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(THEMES) as ShareTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => update("theme", t)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                    options.theme === t ? "border-black" : "border-gray-200"
                  }`}
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-black/10"
                    style={{ background: THEMES[t].bg }}
                  />
                  {THEME_LABEL[t]}
                  {options.theme === t && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </Section>
          )}

          {/* Formato */}
          <Section title="Formato">
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(FORMATS) as ShareFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => update("format", f)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    options.format === f ? "border-black bg-black text-white" : "border-gray-200"
                  }`}
                >
                  {FORMATS[f].label}
                </button>
              ))}
            </div>
          </Section>

          {/* Mostrar */}
          <Section title="Mostrar">
            <Toggle
              label="Resumo"
              checked={options.showResumo}
              onChange={(v) => update("showResumo", v)}
            />
            <Toggle
              label="Referência bíblica"
              checked={options.showRef}
              onChange={(v) => update("showRef", v)}
            />
            <Toggle
              label="Rodapé (chosen.oonn.com.br)"
              checked={options.showFooter}
              onChange={(v) => update("showFooter", v)}
            />
          </Section>

          {/* Tamanho do texto */}
          <Section title="Tamanho do texto">
            <div className="flex gap-2 flex-wrap">
              {([
                { v: 0, label: "Padrão" },
                { v: 1, label: "Menor" },
                { v: 2, label: "Bem menor" },
                { v: 3, label: "Mínimo" },
              ] as const).map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => update("textScale", v)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    options.textScale === v ? "border-black bg-black text-white" : "border-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* Mascote */}
          <Section title="Mascote">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => update("mascoteUrl", null)}
                className={`shrink-0 flex h-14 w-14 items-center justify-center rounded-lg border text-[10px] ${
                  !options.mascoteUrl ? "border-black" : "border-gray-200"
                }`}
              >
                Nenhum
              </button>
              {MASCOTES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => update("mascoteUrl", m.url)}
                  className={`shrink-0 h-14 w-14 rounded-lg border overflow-hidden ${
                    options.mascoteUrl === m.url ? "border-black" : "border-gray-200"
                  }`}
                >
                  <img src={m.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </Section>

          {/* Assinatura */}
          <Section title="Assinatura (opcional)">
            <Input
              value={options.signature}
              onChange={(e) => update("signature", e.target.value.slice(0, 30))}
              placeholder="Seu nome"
              className="h-10"
            />
          </Section>
        </div>

        {/* CTA fixo */}
        <div className="sticky bottom-0 left-0 right-0 border-t bg-white px-5 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="h-12 w-full rounded-full bg-[#f1f26c] text-black hover:opacity-90 shadow-none gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-semibold">
              {isSharing ? "Gerando..." : "Compartilhar"}
            </span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-widest uppercase text-gray-500">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm text-black">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function triggerDownload(dataUrl: string, sentimento: string) {
  const link = document.createElement("a");
  link.download = `chosen-${sentimento}.png`;
  link.href = dataUrl;
  link.click();
}