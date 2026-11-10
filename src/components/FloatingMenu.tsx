import { useEffect, useMemo, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Menu, Plus, RefreshCw, Sparkles, CalendarClock, Share2, HelpCircle, Trash2, Heart, Send, Smile, Shuffle, BellRing, Wind, Copy, Check, PlayCircle, Bell, Clock, BookOpen, HandHeart, Sun, Search } from "lucide-react";
import { toast } from "sonner";
import nuvensLavanda from "@/assets/nuvens-lavanda.jpg";
import mascotePaz from "@/assets/mascotes/mascote-2.png.asset.json";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PSALMS, INVITATION_MESSAGES, NOTIFICATION_TITLES } from "@/lib/psalms";
import { getFavorites, removeFavorite, type Favorite } from "@/lib/favorites";
import { getRandomMensagemGlobal, getMensagemById, getProximaMensagem, CATEGORIAS, type Categoria } from "@/lib/data";
import { buildShareUrl } from "@/lib/share";
import { SMART_LINK } from "@/lib/storeLinks";
import {
  getNotificationIntensity,
  setNotificationIntensity,
  INTENSITY_LABELS,
  type NotificationIntensity,
} from "@/lib/notificationPrefs";
import { rescheduleNotifications } from "@/hooks/useNativeNotifications";
import { isTimeThemeEnabled, setTimeThemeEnabled } from "@/lib/timeThemePrefs";
import { getMarcador, getMarcadorManual, type Marcador as BibliaMarcador } from "@/lib/biblia/marcador";
import { getLivro } from "@/lib/biblia";

const SCHEDULED_KEY = "chosen_user_schedules";
const PWA_SCHEDULE_BASE_ID = 50000;

type ScheduleType = "motivacao" | "salmo" | "aleatorio";

interface UserSchedule {
  id: number;
  at: string; // ISO
  type: ScheduleType;
  title: string;
  body: string;
}

function isCapacitor(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
}

function pickTitle(): string {
  return NOTIFICATION_TITLES[Math.floor(Math.random() * NOTIFICATION_TITLES.length)];
}

function pickBodyByType(type: ScheduleType): string {
  if (type === "motivacao") {
    const m = INVITATION_MESSAGES[Math.floor(Math.random() * INVITATION_MESSAGES.length)];
    return m.text;
  }
  if (type === "salmo") {
    const salmos = PSALMS.filter((p) => /salm/i.test(p.ref));
    const pool = salmos.length ? salmos : PSALMS;
    const s = pool[Math.floor(Math.random() * pool.length)];
    return `${s.ref} — ${s.text}`;
  }
  // aleatório
  const all = [...PSALMS, ...INVITATION_MESSAGES];
  const x = all[Math.floor(Math.random() * all.length)];
  return x.ref === "CHOSEN" ? x.text : `${x.ref} — ${x.text}`;
}

function loadSchedules(): UserSchedule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCHEDULED_KEY);
    if (!raw) return [];
    const list: UserSchedule[] = JSON.parse(raw);
    // Limpa as que já passaram
    const now = Date.now();
    return list.filter((s) => new Date(s.at).getTime() > now);
  } catch {
    return [];
  }
}

function saveSchedules(list: UserSchedule[]) {
  try {
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(list));
  } catch {}
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function defaultDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000); // +1h
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

export function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [intensityOpen, setIntensityOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [timeThemeOn, setTimeThemeOn] = useState(false);

  useEffect(() => {
    setTimeThemeOn(isTimeThemeEnabled());
  }, []);

  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Esconde o FAB na splash/onboarding
  const hidden = pathname === "/" || pathname.startsWith("/onboarding");

  if (hidden) return null;

  const handleAtualizar = async () => {
    setOpen(false);
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
    if (isNative) {
      // No nativo, o JS roda do bundle empacotado — limpar cache não baixa
      // versão nova. Redireciona pro onboarding (3 telas iniciais) pra dar
      // a sensação de "recomeço" e mostra a versão atual.
      try {
        const { App } = await import("@capacitor/app");
        const info = await App.getInfo().catch(() => null);
        if (info?.version) {
          toast("Você já está na versão " + info.version, {
            description: "Atualizações novas chegam pela loja de apps.",
          });
        }
      } catch {}
      window.location.replace("/onboarding");
      return;
    }
    try {
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {}
    window.location.replace(`/onboarding?v=${Date.now()}`);
  };

  const handleOracoes = () => {
    setOpen(false);
    navigate({ to: "/oracoes" });
  };

  const handleAgendar = () => {
    setOpen(false);
    setScheduleOpen(true);
  };

  const handleAjuda = () => {
    setOpen(false);
    setHelpOpen(true);
  };

  const handleVerApresentacao = () => {
    setOpen(false);
    navigate({ to: "/onboarding" });
  };

  const handleCompartilhar = async () => {
    setOpen(false);
    const url = SMART_LINK;
    const text = `CHOSEN — Inspirações escolhidas pra cada momento do seu dia 💛\nBaixe e use também: ${url}`;
    try {
      if (isCapacitor()) {
        const { Share } = await import("@capacitor/share");
        await Share.share({ title: "Chosen", text, url, dialogTitle: "Compartilhar" });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "Chosen", text, url });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast("Link copiado!", {
        description: "Cole onde quiser compartilhar 💛",
      });
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text);
        toast("Link copiado!", { description: "Cole onde quiser compartilhar 💛" });
      } catch {
        toast.error("Não foi possível compartilhar", { description: url });
      }
    }
  };

  const handleFavoritos = () => {
    setOpen(false);
    navigate({ to: "/escolhidas" });
  };

  const handleEnviarPraAlguem = () => {
    setOpen(false);
    setSendOpen(true);
  };

  const handleMono = () => {
    setOpen(false);
    const current = document.documentElement.classList.contains("grayscale");
    const next = !current;
    localStorage.setItem("isMono", next.toString());
    if (next) document.documentElement.classList.add("grayscale");
    else document.documentElement.classList.remove("grayscale");
    toast(next ? "Modo preto e branco ativado" : "Modo colorido ativado");
  };

  return (
    <>
      <QuickActions onMenu={() => setOpen(true)} />






      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[32px] border-0 max-h-[92dvh] overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),1.5rem)]"
        >
          <SheetHeader className="text-left">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-ink/50">Menu</span>
            <SheetTitle className="text-[26px] leading-tight font-bold tracking-tight text-ink">
              Seu momento com Deus
            </SheetTitle>
            <SheetDescription className="sr-only">Opções do app</SheetDescription>
          </SheetHeader>

          <button
            onClick={() => { setOpen(false); navigate({ to: "/ora-comigo" }); }}
            className="relative mt-10 w-full min-h-[132px] rounded-[26px] text-left active:scale-[0.98] transition-transform"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[26px]">
              <img src={nuvensLavanda} alt="" className="h-full w-full object-cover" width={1024} height={640} loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-tint-lavender via-tint-lavender/80 to-transparent" />
            </div>
            <div className="relative z-10 flex w-[60%] flex-col p-5">
              <span className="text-[22px] font-bold leading-none tracking-tight text-ink">Ora comigo</span>
              <span className="mt-1 text-[13px] font-semibold text-ink/70">(guiado)</span>
              <span className="mt-2 text-[12px] leading-snug text-ink/65">Converse com Deus em todos os momentos.</span>
            </div>
            <img
              src={mascotePaz.url}
              alt=""
              className="pointer-events-none absolute -top-10 right-1 h-[150%] max-h-[190px] w-auto object-contain drop-shadow-md"
            />
          </button>

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {[
              { icon: <Sparkles className="h-5 w-5" />, label: "Orações", onClick: handleOracoes },
              { icon: <BookOpen className="h-5 w-5" />, label: "Devocional de 3 min", onClick: () => { setOpen(false); navigate({ to: "/devocional" }); } },
              { icon: <Clock className="h-5 w-5" />, label: "Quanto tempo você tem?", onClick: () => { setOpen(false); navigate({ to: "/meutempo" }); } },
            ].map((c) => (
              <button
                key={c.label}
                onClick={c.onClick}
                className="flex min-h-[96px] flex-col justify-between rounded-[20px] bg-surface p-3 text-left active:scale-[0.97] transition-transform"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-yellow text-ink">{c.icon}</span>
                <span className="text-[12.5px] font-semibold leading-tight text-ink">{c.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col">
            <MenuItem
              icon={<Search className="h-5 w-5" />}
              label="Ler Bíblia"
              onClick={() => { setOpen(false); navigate({ to: "/ler-biblia" }); }}
            />
            <MenuItem
              icon={<BookOpen className="h-5 w-5" />}
              label="Bíblia — Novo Testamento"
              onClick={() => { setOpen(false); navigate({ to: "/biblia" }); }}
            />
            <MenuItem
              icon={<Heart className="h-5 w-5" />}
              label="Minhas escolhidas"
              onClick={handleFavoritos}
            />
            <MenuItem
              icon={<Send className="h-5 w-5" />}
              label="Chosen pra alguém"
              onClick={handleEnviarPraAlguem}
            />
            <MenuItem
              icon={<CalendarClock className="h-5 w-5" />}
              label="Agendar uma mensagem"
              onClick={handleAgendar}
            />
            <MenuItem
              icon={<Bell className="h-5 w-5" />}
              label="Intensidade notificação"
              onClick={() => { setOpen(false); setIntensityOpen(true); }}
            />

            <Divider />

            <MenuItem
              icon={<Share2 className="h-5 w-5" />}
              label="Compartilhar o app"
              onClick={handleCompartilhar}
            />
            <MenuItem
              icon={<MonoIcon />}
              label="Modo preto e branco"
              onClick={handleMono}
            />
            <MenuItem
              icon={<Sun className="h-5 w-5" />}
              label={timeThemeOn ? "Tema por horário: ativado" : "Tema por horário: desativado"}
              onClick={() => {
                const next = !timeThemeOn;
                setTimeThemeEnabled(next);
                setTimeThemeOn(next);
                toast(next ? "Tema por horário ativado 🌅" : "Tema por horário desativado", {
                  description: next
                    ? "As cores mudam suave conforme a hora do dia."
                    : "Voltando ao visual padrão.",
                });
              }}
            />
            <MenuItem
              icon={<RefreshCw className="h-5 w-5" />}
              label="Atualizar app"
              onClick={handleAtualizar}
            />

            <Divider />

            <MenuItem
              icon={<PlayCircle className="h-5 w-5" />}
              label="Ver apresentação"
              onClick={handleVerApresentacao}
            />
            <MenuItem icon={<HelpCircle className="h-5 w-5" />} label="Sobre o App" onClick={handleAjuda} />
          </div>
        </SheetContent>
      </Sheet>

      <ScheduleDialog open={scheduleOpen} onOpenChange={setScheduleOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <IntensityDialog open={intensityOpen} onOpenChange={setIntensityOpen} />
      <FavoritesDialog open={favoritesOpen} onOpenChange={setFavoritesOpen} />
      <SendDialog open={sendOpen} onOpenChange={setSendOpen} />
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-1 py-3 text-left border-b border-black/5 last:border-b-0 active:bg-black/5 transition-colors"
    >
      <span className="shrink-0 text-ink/80 [&>svg]:h-[19px] [&>svg]:w-[19px]">{icon}</span>
      <span className="flex-1 text-[14px] text-ink">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink/30" />
    </button>
  );
}

function Divider() {
  return <div className="my-1 h-px bg-black/5" />;
}

function MonoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" />
    </svg>
  );
}

/* ============== Agendar mensagem ============== */

function ScheduleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const native = isCapacitor();
  const initial = useMemo(() => defaultDateTime(), [open]);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [type, setType] = useState<ScheduleType>("motivacao");
  const [schedules, setSchedules] = useState<UserSchedule[]>([]);

  useEffect(() => {
    if (open) {
      const d = defaultDateTime();
      setDate(d.date);
      setTime(d.time);
      setSchedules(loadSchedules());
    }
  }, [open]);

  const handleAgendar = async () => {
    if (!date || !time) {
      toast.error("Escolha data e hora");
      return;
    }
    const at = new Date(`${date}T${time}:00`);
    if (at.getTime() <= Date.now()) {
      toast.error("Escolha um horário no futuro");
      return;
    }

    const title = pickTitle();
    const body = pickBodyByType(type);
    const id = Date.now() % 1000000;

    if (native) {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== "granted") {
          const req = await LocalNotifications.requestPermissions();
          if (req.display !== "granted") {
            toast.error("Permissão de notificação negada");
            return;
          }
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title,
              body,
              schedule: { at },
              smallIcon: "ic_stat_chosen",
              iconColor: "#f1f26c",
              extra: { url: "/home" },
            },
          ],
        });
        toast.success("Mensagem agendada", {
          description: at.toLocaleString("pt-BR"),
        });
      } catch (err) {
        console.error(err);
        toast.error("Erro ao agendar");
        return;
      }
    } else {
      // PWA fallback: só dispara se o app estiver aberto
      const delay = at.getTime() - Date.now();
      const timeoutId = window.setTimeout(async () => {
        if (document.visibilityState === "visible") {
          toast(title, { description: body, duration: 10000 });
        }
        if ("serviceWorker" in navigator && Notification.permission === "granted") {
          try {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(title, {
              body,
              icon: "/logo-chosen.png",
              badge: "/logo-chosen.png",
              tag: `chosen-scheduled-${id}`,
              data: { url: "/home" },
            });
          } catch {}
        }
        // Remove da lista
        const updated = loadSchedules().filter((s) => s.id !== id);
        saveSchedules(updated);
      }, delay);
      // Guarda referência para limpar (best-effort; o setTimeout vive enquanto a página existe)
      (window as any).__chosenScheduleTimers = (window as any).__chosenScheduleTimers || {};
      (window as any).__chosenScheduleTimers[id] = timeoutId;
      toast.success("Agendamento criado", {
        description: "Funciona enquanto o app estiver aberto.",
      });
    }

    const next: UserSchedule[] = [
      ...loadSchedules(),
      { id, at: at.toISOString(), type, title, body },
    ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    saveSchedules(next);
    setSchedules(next);
  };

  const handleCancel = async (s: UserSchedule) => {
    if (native) {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications");
        await LocalNotifications.cancel({ notifications: [{ id: s.id }] });
      } catch {}
    } else {
      const timers = (window as any).__chosenScheduleTimers || {};
      if (timers[s.id]) {
        clearTimeout(timers[s.id]);
        delete timers[s.id];
      }
    }
    const updated = loadSchedules().filter((x) => x.id !== s.id);
    saveSchedules(updated);
    setSchedules(updated);
    toast("Agendamento cancelado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-light tracking-[0.2em] uppercase">
            Agendar mensagem
          </DialogTitle>
          <DialogDescription>
            Escolha quando você quer receber uma mensagem.
          </DialogDescription>
        </DialogHeader>

        {!native && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
            <strong>Atenção:</strong> no navegador, o lembrete só dispara
            enquanto o app estiver aberto. Para garantir, instale o app no
            seu celular.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sched-date" className="text-xs">Data</Label>
            <Input
              id="sched-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sched-time" className="text-xs">Hora</Label>
            <Input
              id="sched-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              step={60}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs">Tipo de mensagem</Label>
          <RadioGroup
            value={type}
            onValueChange={(v) => setType(v as ScheduleType)}
            className="grid grid-cols-3 gap-2"
          >
            {([
              { v: "motivacao", l: "Motivação" },
              { v: "salmo", l: "Salmo" },
              { v: "aleatorio", l: "Aleatório" },
            ] as const).map((opt) => (
              <label
                key={opt.v}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm ${
                  type === opt.v ? "border-black bg-black text-white" : "border-black/10"
                }`}
              >
                <RadioGroupItem value={opt.v} className="sr-only" />
                {opt.l}
              </label>
            ))}
          </RadioGroup>
        </div>

        <Button onClick={handleAgendar} className="w-full">
          Agendar
        </Button>

        {schedules.length > 0 && (
          <div className="mt-2">
            <div className="text-xs uppercase tracking-widest text-black/50 mb-2">
              Próximos agendamentos
            </div>
            <div className="flex flex-col gap-2">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {new Date(s.at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-black/50 capitalize">{s.type}</div>
                  </div>
                  <button
                    onClick={() => handleCancel(s)}
                    className="p-2 text-black/50 hover:text-red-600 transition-colors"
                    aria-label="Cancelar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============== Ajuda ============== */

function IntensityDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [intensity, setIntensity] = useState<NotificationIntensity>("present");

  useEffect(() => {
    if (open) setIntensity(getNotificationIntensity());
  }, [open]);

  const handleIntensity = async (v: NotificationIntensity) => {
    setIntensity(v);
    setNotificationIntensity(v);
    toast(`Intensidade: ${INTENSITY_LABELS[v].label}`, {
      description: INTENSITY_LABELS[v].desc,
    });
    try {
      await rescheduleNotifications();
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 border-0 rounded-2xl">
        <div className="px-6 pt-6 pb-2">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-[11px] font-light tracking-[0.35em] uppercase text-black/50">
              Notificações
            </DialogTitle>
            <DialogDescription className="sr-only">
              Escolha a intensidade das notificações
            </DialogDescription>
          </DialogHeader>
          <p className="mt-2 text-xl font-light leading-snug text-black tracking-tight">
            Quantas mensagens você quer receber por dia?
          </p>
          <p className="mt-2 text-[13px] text-black/60 leading-relaxed">
            Você pode mudar quando quiser. O padrão é <strong>Presente</strong>.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-1.5">
            {(["light", "normal", "present"] as NotificationIntensity[]).map((v) => {
              const meta = INTENSITY_LABELS[v];
              const active = intensity === v;
              return (
                <button
                  key={v}
                  onClick={() => handleIntensity(v)}
                  className={`rounded-xl border px-2 py-3 text-center transition ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black/10 active:scale-95"
                  }`}
                >
                  <div className="text-lg leading-none">{meta.emoji}</div>
                  <div className="text-[12px] font-semibold mt-1.5">{meta.label}</div>
                  <div className={`text-[10px] mt-0.5 ${active ? "text-white/70" : "text-black/45"}`}>
                    {meta.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3 flex items-center justify-end text-[10px] tracking-[0.2em] uppercase text-black/40 border-t border-black/5">
          <button
            onClick={() => onOpenChange(false)}
            className="hover:text-black transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const pix = "61.117.435/0001-05";

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pix);
      setCopied(true);
      toast("Chave Pix copiada 💛");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const features = [
    { icon: <Smile className="h-4 w-4" />, title: "Check-in de humor", desc: "Escolha como você está e receba a palavra certa." },
    { icon: <Shuffle className="h-4 w-4" />, title: "Aleatório", desc: "Um salmo ou uma motivação a qualquer hora." },
    { icon: <BookOpen className="h-4 w-4" />, title: "Bíblia — Novo Testamento", desc: "Mateus a Judas e Apocalipse, com marcador de onde você parou." },
    { icon: <Sparkles className="h-4 w-4" />, title: "Orações", desc: "Guia ACTS + orações para cada momento do dia." },
    { icon: <Wind className="h-4 w-4" />, title: "Palavra de silêncio", desc: "Um instante calmo para respirar e ouvir." },
    { icon: <Heart className="h-4 w-4" />, title: "Minhas escolhidas", desc: "Suas favoritas e histórico, disponíveis offline." },
    { icon: <Send className="h-4 w-4" />, title: "Chosen pra alguém", desc: "Envie uma palavra assinada ou anônima." },
    { icon: <CalendarClock className="h-4 w-4" />, title: "Agendar mensagem", desc: "Marque o dia e a hora do seu lembrete." },
    { icon: <BellRing className="h-4 w-4" />, title: "Lembretes diários", desc: "Notificações silenciosas em horários pensados pra você." },
    { icon: <Share2 className="h-4 w-4" />, title: "Compartilhar", desc: "Gere uma imagem bonita com o versículo em segundos." },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 border-0 rounded-2xl">
        <div className="px-6 pt-6 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-[11px] font-light tracking-[0.35em] uppercase text-black/50">
              Sobre
            </DialogTitle>
            <DialogDescription className="sr-only">O que é o Chosen</DialogDescription>
          </DialogHeader>
          <p className="mt-2 text-xl font-light leading-snug text-black tracking-tight">
            Uma palavra escolhida pra cada momento do seu dia.
          </p>
          <p className="mt-2 text-[13px] text-black/60 leading-relaxed">
            Salmos, motivações, orações e um instante de silêncio — pensados
            pra caber na sua rotina sem barulho.
          </p>
        </div>

        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {features.map((f) => (
              <div key={f.title} className="flex gap-2 items-start">
                <span className="mt-0.5 shrink-0 text-black">{f.icon}</span>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold text-black leading-tight">{f.title}</div>
                  <div className="text-[11px] text-black/55 leading-snug">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-[#f8f8f5] border-t border-black/5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-light tracking-[0.3em] uppercase text-black/50">
                Apoie com um Pix
              </div>
              <div className="text-[13px] font-medium text-black truncate">{pix}</div>
              <div className="text-[10px] text-black/45">OONN Creative · CNPJ</div>
            </div>
            <button
              onClick={copyPix}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-black text-white px-3.5 py-2 text-[11px] font-semibold tracking-wide active:scale-95 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-black/40 border-t border-black/5">
          <a
            href="https://oonn.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black transition-colors"
          >
            OONN Creative
          </a>
          <button
            onClick={() => onOpenChange(false)}
            className="hover:text-black transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============== Favoritos ============== */

function FavoritesDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [list, setList] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!open) return;
    setList(getFavorites());
    const onChange = () => setList(getFavorites());
    window.addEventListener("chosen:favorites-changed", onChange);
    return () => window.removeEventListener("chosen:favorites-changed", onChange);
  }, [open]);

  const handleOpen = (f: Favorite) => {
    onOpenChange(false);
    navigate({
      to: "/mensagem/$sentimento",
      params: { sentimento: f.categoria },
      search: { color: "#f1f26c", id: f.id },
    });
  };

  const handleRemove = (id: string) => {
    removeFavorite(id);
    setList(getFavorites());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-light tracking-[0.2em] uppercase">
            Minhas escolhidas
          </DialogTitle>
          <DialogDescription>
            Suas mensagens favoritas — toque pra abrir de novo.
          </DialogDescription>
        </DialogHeader>

        {list.length === 0 ? (
          <div className="py-8 text-center text-sm text-black/50">
            Você ainda não favoritou nenhuma mensagem.
            <div className="mt-1 text-xs">
              Toque no <Heart className="inline h-3 w-3" /> no topo de uma mensagem.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((f) => (
              <div
                key={f.id}
                className="flex items-start gap-2 rounded-lg border border-black/10 p-3"
              >
                <button
                  onClick={() => handleOpen(f)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="text-[10px] uppercase tracking-widest text-black/40 mb-1">
                    {f.categoria}
                  </div>
                  <div className="text-sm text-black line-clamp-3">"{f.text}"</div>
                  <div className="text-[11px] font-bold tracking-widest uppercase text-black/60 mt-1">
                    {f.ref}
                  </div>
                </button>
                <button
                  onClick={() => handleRemove(f.id)}
                  className="shrink-0 p-2 text-black/40 hover:text-red-600 transition-colors"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============== Chosen pra alguém ============== */

function SendDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [current, setCurrent] = useState<{ t: string; r: string; c: string } | null>(null);
  const [mood, setMood] = useState<Categoria | "surpresa">("surpresa");

  const sortear = (moodOverride?: Categoria | "surpresa") => {
    const target = moodOverride ?? mood;
    if (target === "surpresa") {
      const { categoria, id } = getRandomMensagemGlobal();
      const m = getMensagemById(categoria, id);
      setCurrent({ t: m.texto, r: m.referencia, c: categoria });
    } else {
      const m = getProximaMensagem(target);
      setCurrent({ t: m.texto, r: m.referencia, c: target });
    }
  };

  useEffect(() => {
    if (open) {
      setMood("surpresa");
      sortear("surpresa");
      try {
        const saved = localStorage.getItem("chosen_sender_name");
        if (saved) setName(saved);
      } catch {}
    }
  }, [open]);

  const handleMoodChange = (v: Categoria | "surpresa") => {
    setMood(v);
    sortear(v);
  };

  const handleEnviar = async () => {
    if (!current) return;
    try {
      if (name) localStorage.setItem("chosen_sender_name", name.trim());
    } catch {}
    const url = buildShareUrl({
      t: current.t,
      r: current.r,
      n: name.trim() || undefined,
    });
    const text = `Escolhi essa palavra pensando em você 💛\n\n"${current.t}"\n— ${current.r}\n\n${url}`;

    const isNative = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

    try {
      if (isNative) {
        const { Share } = await import("@capacitor/share");
        await Share.share({
          title: "CHOSEN — uma palavra pra você",
          text,
          url,
          dialogTitle: "Enviar pra alguém",
        });
      } else if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({
          title: "CHOSEN — uma palavra pra você",
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast("Mensagem copiada!", {
          description: "Cole no WhatsApp, SMS ou onde quiser 💛",
        });
      }
      onOpenChange(false);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text);
        toast("Mensagem copiada!");
      } catch {
        toast.error("Não foi possível enviar");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-light tracking-[0.2em] uppercase">
            Chosen pra alguém
          </DialogTitle>
          <DialogDescription>
            Escolha um sentimento (ou deixe surpresa), envie anônimo ou
            assinado. Quem receber abre um link bonito com a mensagem.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Label className="text-xs shrink-0 whitespace-nowrap">Qual seu sentimento?</Label>
            {(["surpresa", ...CATEGORIAS] as Array<Categoria | "surpresa">).map((c) => {
              const active = mood === c;
              const label = c === "surpresa" ? "✨ Surpresa" : c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleMoodChange(c)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] transition ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white text-black/70 border-black/10 active:scale-95"
                  }`}
                >
                  {label}
                </button>
              );
            })}
        </div>

        {current && (
          <div className="rounded-2xl bg-black/[0.03] p-4 text-center">
            <p className="text-base font-light leading-snug text-black">
              "{current.t}"
            </p>
            <p className="mt-2 text-[11px] font-bold tracking-widest uppercase text-black/70">
              {current.r}
            </p>
            <button
              onClick={() => sortear()}
              className="mt-3 text-[11px] uppercase tracking-widest text-black/50 hover:text-black"
            >
              sortear outra
            </button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sender-name" className="text-xs">
            Seu nome <span className="text-black/40">(opcional)</span>
          </Label>
          <Input
            id="sender-name"
            placeholder="Deixe em branco para enviar anônimo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </div>

        <Button
          onClick={handleEnviar}
          className="w-full bg-[#f1f26c] text-black hover:opacity-90"
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
function QuickActions({ onMenu }: { onMenu: () => void }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [marcador, setMarcador] = useState<BibliaMarcador | null>(null);
  const lerMarcador = () => setMarcador(getMarcadorManual() ?? getMarcador());
  useEffect(() => {
    lerMarcador();
    const onFocus = () => lerMarcador();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
    };
  }, [pathname]);
  const abrev = marcador ? (getLivro(marcador.livro)?.abrev ?? marcador.nome) : null;
  const irBiblia = () => {
    const m = getMarcadorManual() ?? getMarcador();
    if (m) {
      navigate({ to: "/biblia/$livro/$capitulo", params: { livro: m.livro, capitulo: String(m.capitulo) }, hash: `v${m.versiculo}` });
    } else navigate({ to: "/biblia" });
  };
  const isHome = pathname === "/home";
  const isBiblia = pathname.startsWith("/biblia") || pathname.startsWith("/ler-biblia");
  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 h-14 rounded-2xl text-[11px] font-semibold transition active:scale-95";
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-background/95 backdrop-blur px-4 pt-1.5"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="mx-auto flex max-w-md items-center gap-2">
        <button onClick={() => navigate({ to: "/home" })} aria-label="Início" className={`${item} ${isHome ? "bg-brand-yellow text-ink" : "text-ink/60"}`}>
          <Home className="h-5 w-5" strokeWidth={2.25} />
          Início
        </button>
        <button onClick={irBiblia} aria-label="Bíblia" className={`${item} ${isBiblia ? "bg-brand-yellow text-ink" : "text-ink/60"}`}>
          <BookOpen className="h-5 w-5" strokeWidth={2.25} />
          {abrev ? `${abrev} ${marcador!.capitulo}` : "Bíblia"}
        </button>
        <button onClick={onMenu} aria-label="Menu" className={`${item} text-ink/60`}>
          <Menu className="h-5 w-5" strokeWidth={2.25} />
          Menu
        </button>
      </div>
    </nav>
  );
}
