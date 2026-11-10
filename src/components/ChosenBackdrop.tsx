import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import chosenIcone from "@/assets/img/chosen-icone.webp";
import ceuAmanhecer from "@/assets/ceu-amanhecer.jpg";

/** Céu do amanhecer no topo, mesmo estilo da tela de frases. */
export function ChosenBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[42%] z-0">
      <img src={ceuAmanhecer} alt="" className="h-full w-full object-cover opacity-80" width={1024} height={640} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
    </div>
  );
}

export function ChosenHeader() {
  return (
    <header className="relative shrink-0 z-20 grid grid-cols-[2.5rem_1fr_2.5rem] h-14 items-center px-4 pt-[max(env(safe-area-inset-top),2rem)] box-content">
      <Link
        to="/home"
        aria-label="Voltar"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-background/70 backdrop-blur justify-self-start"
      >
        <ArrowLeft className="h-5 w-5 text-ink" />
      </Link>
      <span className="flex items-center justify-center gap-1.5 text-sm font-bold tracking-[0.3em] uppercase text-brand-olive">
        <img src={chosenIcone} alt="" className="h-6 w-6 object-contain" />
        CHOSEN
      </span>
      <span />
    </header>
  );
}
