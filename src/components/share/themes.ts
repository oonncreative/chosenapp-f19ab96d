export type ShareTheme = "branco" | "preto" | "creme" | "coral";
export type ShareFormat = "story" | "post" | "quadrado" | "horizontal";

export interface ThemeColors {
  bg: string;
  fg: string;
  muted: string;
  sub: string;
  accent: string;
}

export const THEMES: Record<ShareTheme, ThemeColors> = {
  branco: { bg: "#ffffff", fg: "#000000", muted: "#9CA3AF", sub: "#4B5563", accent: "#6B7280" },
  preto:  { bg: "#0b0b0b", fg: "#ffffff", muted: "#9CA3AF", sub: "#cbd5e1", accent: "#f1f26c" },
  creme:  { bg: "#fdf8e9", fg: "#1c1c1c", muted: "#a98a4a", sub: "#5b4a2a", accent: "#a98a4a" },
  coral:  { bg: "#f4d3bd", fg: "#1c2238", muted: "#6b5b4a", sub: "#3b3a4a", accent: "#1c2238" },
};

export const FORMATS: Record<ShareFormat, { width: number; height: number; label: string }> = {
  story:      { width: 1080, height: 1920, label: "Story 9:16" },
  post:       { width: 1080, height: 1440, label: "Post 3:4" },
  quadrado:   { width: 1080, height: 1080, label: "Quadrado 1:1" },
  horizontal: { width: 1920, height: 1080, label: "Horizontal 16:9" },
};

export type ShareEstilo = "minimalista" | "moderna";

export interface ShareOptions {
  estilo: ShareEstilo;
  theme: ShareTheme;
  format: ShareFormat;
  showResumo: boolean;
  showRef: boolean;
  showFooter: boolean;
  mascoteUrl: string | null;
  signature: string;
  // 0 = padrão, 1..3 = frase principal reduzida (cada nível ~12% menor).
  textScale: 0 | 1 | 2 | 3;
}

export const DEFAULT_SHARE_OPTIONS: ShareOptions = {
  estilo: "minimalista",
  theme: "branco",
  format: "story",
  showResumo: true,
  showRef: true,
  showFooter: true,
  mascoteUrl: null,
  signature: "",
  textScale: 0,
};

import m1 from "@/assets/img/mascote-1.webp";
import m2 from "@/assets/img/mascote-2.webp";
import m3 from "@/assets/img/mascote-3.webp";
import m4 from "@/assets/img/mascote-4.webp";
import m5 from "@/assets/img/mascote-5.webp";
import m6 from "@/assets/img/mascote-6.webp";
import m7 from "@/assets/img/mascote-7.webp";
import m8 from "@/assets/img/mascote-8.webp";
import m9 from "@/assets/img/mascote-9.webp";
import m10 from "@/assets/img/mascote-10.webp";

export const MASCOTES: { id: number; url: string }[] = [
  m1, m2, m3, m4, m5, m6, m7, m8, m9, m10,
].map((url, i) => ({ id: i + 1, url }));