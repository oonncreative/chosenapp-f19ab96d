// Conteúdo bíblico/conforto para notificações horárias e card "Escolhida agora".
// Fonte única: derivado de src/lib/data.ts para evitar duplicatas.
import { MENSAGENS } from "./data";

export type ChosenItem = {
  ref: string;
  text: string;
};

export const PSALMS: ChosenItem[] = Object.values(MENSAGENS)
  .flat()
  .map((m) => ({ ref: m.referencia, text: m.texto }));

// Pool exclusivo de salmos / versículos (para alternância nas notificações).
export const SALMOS_POOL: ChosenItem[] = Object.values(MENSAGENS)
  .flat()
  .filter((m) => m.tipo === "salmo" || m.tipo === "versiculo")
  .map((m) => ({ ref: m.referencia, text: m.texto }));

// Pool motivacional: categoria Motivação + mensagens-convite.
const MOTIVACAO_MENSAGENS: ChosenItem[] = (MENSAGENS["Motivação"] || []).map(
  (m) => ({ ref: m.referencia, text: m.texto })
);

// Seleção determinística por hora — todos veem a "mesma escolhida" naquela hora.
export function getChosenForHour(date = new Date()): ChosenItem {
  const key = Math.floor(date.getTime() / (60 * 60 * 1000));
  return PSALMS[key % PSALMS.length];
}

export function getChosenRandom(): ChosenItem {
  return PSALMS[Math.floor(Math.random() * PSALMS.length)];
}

// Sorteia deterministicamente um salmo/versículo para a hora dada.
export function getSalmoForHour(date = new Date()): ChosenItem {
  const key = Math.floor(date.getTime() / (60 * 60 * 1000));
  return SALMOS_POOL[key % SALMOS_POOL.length];
}

// Sorteia deterministicamente uma mensagem motivacional para a hora dada
// (categoria Motivação + mensagens-convite).
export function getMotivacionalForHour(date = new Date()): ChosenItem {
  const pool = [...MOTIVACAO_MENSAGENS, ...INVITATION_MESSAGES];
  const key = Math.floor(date.getTime() / (60 * 60 * 1000));
  return pool[key % pool.length];
}

export const NOTIFICATION_TITLES = [
  "Essa foi escolhida para você",
  "Uma palavra para agora",
  "CHOSEN — para o seu momento",
  "Pausa para a alma",
  "Respire e leia",
  "Uma luz para o seu caminho",
  "Deus tem algo para você",
  "Respire fundo e ouça",
  "Tempo de descansar nele",
  "Uma promessa para hoje",
  "Para o seu coração agora",
  "Pare por um instante",
  "Você foi lembrado(a)",
  "Palavra do Pai para você",
  "Um sopro de paz",
  "Lembre-se de quem te ama",
  "Pequena pausa, grande verdade",
  "Hoje, isso é para você",
  "Recarregue a alma",
];

// Mensagens-convite: chamam o usuário a abrir o app para receber a palavra.
// Usadas intercaladas com os versículos nas notificações.
export const INVITATION_MESSAGES: ChosenItem[] = [
  { ref: "CHOSEN", text: "Você está precisando de uma mensagem agora… sinto isso. Abra o app." },
  { ref: "CHOSEN", text: "Este momento pede uma palavra especial. Vem ver o que foi escolhido para você." },
  { ref: "CHOSEN", text: "Tem algo separado só para você hoje. Toque para abrir." },
  { ref: "CHOSEN", text: "Pare por um instante… há uma mensagem te esperando." },
  { ref: "CHOSEN", text: "Sinto que seu coração precisa ouvir algo agora. Abre o app." },
  { ref: "CHOSEN", text: "Uma palavra foi escolhida para esse seu momento. Vem ler." },
  { ref: "CHOSEN", text: "Respira fundo. Tem uma mensagem aqui pra te abraçar." },
  { ref: "CHOSEN", text: "Hoje é dia de lembrar quem você é. Abra o app." },
  { ref: "CHOSEN", text: "Algo bom foi reservado pra você. Toque e descubra." },
  { ref: "CHOSEN", text: "Não é coincidência você ver isso agora. Vem ouvir." },
  { ref: "CHOSEN", text: "Sua alma pediu uma pausa. Estou aqui com uma palavra." },
  { ref: "CHOSEN", text: "Esse instante merece uma mensagem especial. Abra o CHOSEN." },
  // Motivacionais
  { ref: "CHOSEN", text: "Você é mais forte do que imagina. Continue, Deus está com você." },
  { ref: "CHOSEN", text: "Não desista hoje. O melhor de Deus ainda está por vir." },
  { ref: "CHOSEN", text: "Cada passo seu é visto e sustentado pelo Pai. Siga em frente." },
  { ref: "CHOSEN", text: "Levanta a cabeça: você é amado(a), escolhido(a) e cuidado(a)." },
  { ref: "CHOSEN", text: "Hoje pode ser difícil, mas você não está sozinho(a). Respira e continua." },
  { ref: "CHOSEN", text: "Confia no processo. Deus está escrevendo algo lindo na sua história." },
  { ref: "CHOSEN", text: "Coragem! Aquilo que te assusta não é maior do que Aquele que vive em você." },
  { ref: "CHOSEN", text: "Você foi feito(a) para vencer. Não esqueça quem caminha ao seu lado." },
  { ref: "CHOSEN", text: "Mesmo no cansaço, há força sendo renovada em você agora." },
  { ref: "CHOSEN", text: "Acredite: dias melhores estão a caminho. Deus não se esqueceu de você." },
  { ref: "CHOSEN", text: "Persista. A sua benção tem hora certa para chegar." },
  { ref: "CHOSEN", text: "Sorri. Você é prova viva de que Deus cuida dos detalhes." },
  { ref: "CHOSEN", text: "Respira. Deus está no controle, mesmo do que você não entende." },
  { ref: "CHOSEN", text: "Sua história não acaba aqui. O capítulo mais bonito ainda vem." },
  { ref: "CHOSEN", text: "Não meça suas forças pelo cansaço de hoje. Amanhã também é graça." },
  { ref: "CHOSEN", text: "Você é semente boa em terra cuidada pelo Pai." },
  { ref: "CHOSEN", text: "Calma no coração: o que é seu, ninguém tira." },
  { ref: "CHOSEN", text: "Deus não te trouxe até aqui pra te deixar." },
  { ref: "CHOSEN", text: "Pequenos passos também são vitória. Comemora cada um." },
  { ref: "CHOSEN", text: "Você é amado(a) antes mesmo de acertar." },
  { ref: "CHOSEN", text: "Hoje, escolha acreditar de novo. Vale a pena." },
  { ref: "CHOSEN", text: "A tempestade passa. A fé permanece." },
  { ref: "CHOSEN", text: "Levanta. Sacode a poeira. Deus ainda tem planos com você." },
  { ref: "CHOSEN", text: "Quem caminha com Deus nunca caminha sozinho." },
  { ref: "CHOSEN", text: "Tudo o que você precisa hoje, o Pai já separou." },
  { ref: "CHOSEN", text: "Não tenha medo de recomeçar. O fim de um ciclo é abertura de outro." },
  { ref: "CHOSEN", text: "Você é resposta de oração de alguém. Não esquece disso." },
  { ref: "CHOSEN", text: "A sua paz vale mais do que a aprovação dos outros." },
  { ref: "CHOSEN", text: "Onde você vê deserto, Deus já vê fonte." },
  { ref: "CHOSEN", text: "Continua. Mesmo devagar, você está mais perto do que ontem." },
  { ref: "CHOSEN", text: "Sua dor não é o fim. É terreno onde Deus vai plantar milagre." },
  { ref: "CHOSEN", text: "Tem muita coisa boa querendo te alcançar. Abre o coração." },
  { ref: "CHOSEN", text: "Você não precisa ter tudo resolvido pra ser amado(a) por Deus." },
  { ref: "CHOSEN", text: "Hoje é um bom dia pra confiar de novo." },
  { ref: "CHOSEN", text: "A graça de Deus é nova a cada manhã. Inclusive a sua." },
  { ref: "CHOSEN", text: "Você é luz, mesmo nos dias em que se sente apagado(a)." },
  { ref: "CHOSEN", text: "O Pai está perto de quem tem o coração quebrantado." },
  { ref: "CHOSEN", text: "Tudo o que parece atraso, Deus está usando como preparo." },
  { ref: "CHOSEN", text: "Não compara sua caminhada. Cada um tem o seu tempo com Deus." },
  { ref: "CHOSEN", text: "Você é cuidado(a) por um Deus que conhece o seu nome." },
  { ref: "CHOSEN", text: "Hoje pode ser o dia em que tudo começa a mudar." },
  { ref: "CHOSEN", text: "Coragem é confiar mesmo quando não dá pra ver o próximo passo." },
  { ref: "CHOSEN", text: "Você é mais do que o seu pior dia." },
  { ref: "CHOSEN", text: "Existe propósito até no que parece sem sentido. Confia." },
  { ref: "CHOSEN", text: "Deus ouve até as orações que você não consegue dizer em voz alta." },
  { ref: "CHOSEN", text: "Não desiste de você. O Pai não desistiu." },
  { ref: "CHOSEN", text: "Sua vida tem valor enorme aos olhos de Deus." },
  { ref: "CHOSEN", text: "Permita-se descansar. Você não precisa carregar tudo sozinho(a)." },
  { ref: "CHOSEN", text: "A fé move o impossível, e o seu impossível tem nome e prazo." },
  { ref: "CHOSEN", text: "Você é escolhido(a). Não por acaso, por amor." },
  { ref: "CHOSEN", text: "Não tenha pressa. O que é de Deus chega no tempo certo." },
  { ref: "CHOSEN", text: "Hoje, troque o medo pela confiança. Deus está contigo." },
  { ref: "CHOSEN", text: "Os planos de Deus pra você são de paz, não de mal." },
  { ref: "CHOSEN", text: "Cada lágrima sua é guardada por Deus. Nenhuma é em vão." },
  { ref: "CHOSEN", text: "Recomeçar é sinal de coragem, não de fraqueza." },
  { ref: "CHOSEN", text: "Não está perdido(a). Está sendo conduzido(a)." },
  { ref: "CHOSEN", text: "Onde tem fé, tem caminho." },
  { ref: "CHOSEN", text: "Deus está formando algo bonito em silêncio dentro de você." },
  { ref: "CHOSEN", text: "Você é capaz. Deus não chama os capazes, ele capacita os chamados." },
  { ref: "CHOSEN", text: "Não duvide do que Deus te prometeu nos seus melhores dias." },
  { ref: "CHOSEN", text: "Sua oração de hoje será o testemunho de amanhã." },
  { ref: "CHOSEN", text: "Há esperança pra você. Sempre haverá." },
  { ref: "CHOSEN", text: "Deus transforma cinzas em coroa, choro em dança." },
  { ref: "CHOSEN", text: "Você está sendo cuidado(a) mesmo quando não percebe." },
  { ref: "CHOSEN", text: "Coragem para hoje, esperança pra amanhã, fé pra sempre." },
  { ref: "CHOSEN", text: "O Pai te ama do jeitinho que você é, agora mesmo." },
  { ref: "CHOSEN", text: "Não acredite em toda voz que aparece. Acredita na voz do Pai." },
  { ref: "CHOSEN", text: "Você é forte porque Cristo é a sua força." },
  { ref: "CHOSEN", text: "Mantenha o coração leve. Deus carrega o resto." },
  { ref: "CHOSEN", text: "Cada dia é uma nova chance de ver Deus agindo." },
  { ref: "CHOSEN", text: "Não pare de orar. A resposta pode estar a um passo." },
  { ref: "CHOSEN", text: "Quem se entrega nas mãos de Deus, nunca cai no chão." },
  { ref: "CHOSEN", text: "Sua paz interior vale mais do que qualquer aplauso." },
  { ref: "CHOSEN", text: "Hoje, escolha gratidão. Ela muda tudo." },
  { ref: "CHOSEN", text: "Você é amado(a) sem condições. Recebe isso." },
  { ref: "CHOSEN", text: "Não tenha medo do silêncio. Deus fala nele também." },
  { ref: "CHOSEN", text: "Deus ainda faz milagres. E o seu já tem destinatário." },
  { ref: "CHOSEN", text: "A vida é presente. Mesmo quando dói, agradece pelo respirar." },
  { ref: "CHOSEN", text: "Você não é o que disseram. Você é o que Deus diz." },
  { ref: "CHOSEN", text: "Tem dias que vencer é só continuar de pé. E hoje você venceu." },
  { ref: "CHOSEN", text: "Confia: Deus está cuidando do que você nem viu ainda." },
  { ref: "CHOSEN", text: "Você é importante. Você importa. Você é visto(a)." },
  { ref: "CHOSEN", text: "O Pai conhece o seu coração e cuida dele com ternura." },
  { ref: "CHOSEN", text: "Tudo passa. A paz de Deus permanece." },
  { ref: "CHOSEN", text: "Não deixe o medo escrever a sua história. Deixe Deus." },
  { ref: "CHOSEN", text: "Você está exatamente onde Deus quer começar algo novo." },
  { ref: "CHOSEN", text: "Acredita: o Pai sabe o melhor caminho pra você." },
  { ref: "CHOSEN", text: "Hoje é dia de renovar a esperança. Deus não falha." },
  { ref: "CHOSEN", text: "Você é resposta, mesmo se hoje só consegue fazer pergunta." },
  { ref: "CHOSEN", text: "Deus está mais perto do que sua respiração." },
  { ref: "CHOSEN", text: "Não duvide do amor de Deus por você. Ele é maior do que qualquer falha." },
  { ref: "CHOSEN", text: "Continua orando. Continua acreditando. Continua." },
  { ref: "CHOSEN", text: "Deus transforma. E o que parece impossível, em Suas mãos, vira testemunho." },
  { ref: "CHOSEN", text: "Você não foi feito(a) pra desistir. Você foi feito(a) pra brilhar." },
  { ref: "CHOSEN", text: "Hoje, deixe Deus cuidar do que você não dá conta." },
  { ref: "CHOSEN", text: "Há propósito até no inverno da alma. Confia." },
  { ref: "CHOSEN", text: "Sorria pra vida. Deus te chamou pra plenitude." },
  { ref: "CHOSEN", text: "Não se cobra tanto. Você é processo, e Deus é paciência." },
  { ref: "CHOSEN", text: "A bondade do Senhor te alcança, mesmo quando você corre na direção oposta." },
  { ref: "CHOSEN", text: "Você é convidado(a) hoje a confiar mais um pouquinho." },
  { ref: "CHOSEN", text: "Mantém a fé acesa. A noite mais escura sempre vira manhã." },
  { ref: "CHOSEN", text: "Não compare seu interior com a aparência dos outros." },
  { ref: "CHOSEN", text: "Deus cuida dos lírios do campo. Imagina de você." },
  { ref: "CHOSEN", text: "Você ainda vai olhar pra trás e agradecer por tudo o que viveu." },
  { ref: "CHOSEN", text: "Hoje, descansa em saber que você é amado(a)." },
  { ref: "CHOSEN", text: "O melhor de Deus pra você ainda está sendo preparado." },
];

// Sorteia entre versículo (peso 2) e mensagem-convite (peso 1)
export function pickNotificationBody(date = new Date()): ChosenItem {
  const useInvite = Math.random() < 0.33;
  if (useInvite) {
    return INVITATION_MESSAGES[Math.floor(Math.random() * INVITATION_MESSAGES.length)];
  }
  return getChosenForHour(date);
}

export const QUIET_HOURS = { start: 8, end: 22 } as const;

export function isWithinQuietHours(date = new Date()): boolean {
  const h = date.getHours();
  return h >= QUIET_HOURS.start && h < QUIET_HOURS.end;
}
