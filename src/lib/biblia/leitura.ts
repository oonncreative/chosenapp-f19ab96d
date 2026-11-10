// Preferências de leitura e grifos da Bíblia — salvos só no aparelho.

export type TemaLeitura = "claro" | "sepia" | "noturno";
export type Prefs = { fonte: number; tema: TemaLeitura };
export type CorGrifo = "amarelo" | "verde" | "azul";
export type Grifo = {
  livro: string;
  nome: string;
  capitulo: number;
  versiculo: number;
  texto: string;
  cor: CorGrifo;
  at: number;
};

const PREFS = "biblia:prefs";
const GRIFOS = "biblia:grifos";
export const FONTE_MIN = 14;
export const FONTE_MAX = 26;

export const CORES_GRIFO: Record<CorGrifo, string> = {
  amarelo: "rgba(241,242,108,0.65)",
  verde: "rgba(134,239,172,0.55)",
  azul: "rgba(147,197,253,0.55)",
};

export const TEMAS: Record<TemaLeitura, { bg: string; fg: string; sub: string; label: string }> = {
  claro: { bg: "#ffffff", fg: "#111111", sub: "rgba(0,0,0,0.4)", label: "Claro" },
  sepia: { bg: "#f6eedc", fg: "#3b2f1e", sub: "rgba(59,47,30,0.5)", label: "Sépia" },
  noturno: { bg: "#121212", fg: "#e8e6e1", sub: "rgba(232,230,225,0.45)", label: "Noturno" },
};

function ler<T>(k: string, padrao: T): T {
  if (typeof window === "undefined") return padrao;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function getPrefs(): Prefs {
  const p = ler<Partial<Prefs>>(PREFS, {});
  return { fonte: p.fonte ?? 17, tema: p.tema ?? "claro" };
}

export function setPrefs(p: Prefs) {
  localStorage.setItem(PREFS, JSON.stringify(p));
}

export function getGrifos(): Grifo[] {
  return ler<Grifo[]>(GRIFOS, []).sort((a, b) => b.at - a.at);
}

export function grifosDoCapitulo(livro: string, capitulo: number): Record<number, CorGrifo> {
  const out: Record<number, CorGrifo> = {};
  for (const g of getGrifos()) if (g.livro === livro && g.capitulo === capitulo) out[g.versiculo] = g.cor;
  return out;
}

/** Aplica a cor aos versículos (ou remove quando cor = null). */
export function grifar(items: Omit<Grifo, "cor" | "at">[], cor: CorGrifo | null) {
  const chave = (g: { livro: string; capitulo: number; versiculo: number }) =>
    `${g.livro}|${g.capitulo}|${g.versiculo}`;
  const novos = new Set(items.map(chave));
  const resto = getGrifos().filter((g) => !novos.has(chave(g)));
  const add = cor ? items.map((i) => ({ ...i, cor, at: Date.now() })) : [];
  localStorage.setItem(GRIFOS, JSON.stringify([...add, ...resto]));
}
