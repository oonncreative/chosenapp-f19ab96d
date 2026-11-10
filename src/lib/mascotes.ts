import mascote1 from "@/assets/mascotes/mascote-1.png.asset.json";
import mascote2 from "@/assets/mascotes/mascote-2.png.asset.json";
import mascote3 from "@/assets/mascotes/mascote-3.png.asset.json";
import mascote4 from "@/assets/mascotes/mascote-4.png.asset.json";
import mascote5 from "@/assets/mascotes/mascote-5.png.asset.json";
import mascote6 from "@/assets/mascotes/mascote-6.png.asset.json";
import mascote7 from "@/assets/mascotes/mascote-7.png.asset.json";
import mascote8 from "@/assets/mascotes/mascote-8.png.asset.json";
import mascote9 from "@/assets/mascotes/mascote-9.png.asset.json";
import mascote10 from "@/assets/mascotes/mascote-10.png.asset.json";

/** Figurinha 3D de cada sentimento — usada na home, na mensagem e onde mais houver. */
export const MASCOTE_POR_SENTIMENTO: Record<string, string> = {
  "Feliz": mascote1.url,
  "Ansioso": mascote4.url,
  "Triste": mascote6.url,
  "Sozinho": mascote3.url,
  "Agradecido": mascote7.url,
  "Nervoso": mascote9.url,
  "Preciso de esperança": mascote5.url,
  "Preciso de paz": mascote2.url,
  "Preciso de força": mascote8.url,
  "Motivação": mascote10.url,
};
