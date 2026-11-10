// Palavra do Dia: mesmo versículo para todos, troca à meia-noite de Brasília.
export type PalavraDoDia = {
  texto: string;
  referencia: string;
  livro: string;
  capitulo: number;
  versiculo: number;
  acolhimento: string;
};

const LISTA: PalavraDoDia[] = [
  { texto: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.", referencia: "Mateus 11:28", livro: "mateus", capitulo: 11, versiculo: 28, acolhimento: "Você não precisa carregar tudo sozinho hoje." },
  { texto: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", referencia: "Isaías 41:10", livro: "isaias", capitulo: 41, versiculo: 10, acolhimento: "Ele está ao seu lado em cada passo." },
  { texto: "O Senhor é o meu pastor; nada me faltará.", referencia: "Salmos 23:1", livro: "salmos", capitulo: 23, versiculo: 1, acolhimento: "Descanse: você é cuidado." },
  { texto: "Tudo posso naquele que me fortalece.", referencia: "Filipenses 4:13", livro: "filipenses", capitulo: 4, versiculo: 13, acolhimento: "A força de hoje vem dele." },
  { texto: "Deixo-vos a paz, a minha paz vos dou.", referencia: "João 14:27", livro: "joao", capitulo: 14, versiculo: 27, acolhimento: "Receba essa paz agora, sem pressa." },
  { texto: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.", referencia: "1 Pedro 5:7", livro: "1-pedro", capitulo: 5, versiculo: 7, acolhimento: "Entregue o que pesa. Ele cuida de você." },
  { texto: "As misericórdias do Senhor se renovam cada manhã; grande é a tua fidelidade.", referencia: "Lamentações 3:22-23", livro: "lamentacoes", capitulo: 3, versiculo: 22, acolhimento: "Hoje é um novo começo." },
  { texto: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus.", referencia: "Romanos 8:28", livro: "romanos", capitulo: 8, versiculo: 28, acolhimento: "Nada do que você vive é em vão." },
  { texto: "Esforça-te e tem bom ânimo; o Senhor teu Deus é contigo por onde quer que andares.", referencia: "Josué 1:9", livro: "josue", capitulo: 1, versiculo: 9, acolhimento: "Coragem: você não caminha só." },
  { texto: "Perto está o Senhor dos que têm o coração quebrantado.", referencia: "Salmos 34:18", livro: "salmos", capitulo: 34, versiculo: 18, acolhimento: "Ele se aproxima de quem sofre." },
  { texto: "Em paz me deito e logo pego no sono, porque só tu, Senhor, me fazes repousar seguro.", referencia: "Salmos 4:8", livro: "salmos", capitulo: 4, versiculo: 8, acolhimento: "Você pode descansar em segurança." },
  { texto: "O amor é paciente, o amor é bondoso.", referencia: "1 Coríntios 13:4", livro: "1-corintios", capitulo: 13, versiculo: 4, acolhimento: "Seja gentil com você e com os outros hoje." },
  { texto: "Os que esperam no Senhor renovarão as suas forças.", referencia: "Isaías 40:31", livro: "isaias", capitulo: 40, versiculo: 31, acolhimento: "Esperar nele renova." },
  { texto: "Eu sou a luz do mundo; quem me segue não andará em trevas.", referencia: "João 8:12", livro: "joao", capitulo: 8, versiculo: 12, acolhimento: "Há luz para o seu caminho." },
  { texto: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.", referencia: "Filipenses 4:4", livro: "filipenses", capitulo: 4, versiculo: 4, acolhimento: "Procure hoje um motivo para agradecer." },
  { texto: "Entrega o teu caminho ao Senhor, confia nele, e ele tudo fará.", referencia: "Salmos 37:5", livro: "salmos", capitulo: 37, versiculo: 5, acolhimento: "Confie o dia de hoje a Ele." },
  { texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.", referencia: "João 3:16", livro: "joao", capitulo: 3, versiculo: 16, acolhimento: "Você é profundamente amado." },
  { texto: "Buscai primeiro o reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.", referencia: "Mateus 6:33", livro: "mateus", capitulo: 6, versiculo: 33, acolhimento: "Comece o dia com Ele." },
  { texto: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.", referencia: "Provérbios 3:5", livro: "proverbios", capitulo: 3, versiculo: 5, acolhimento: "Não precisa entender tudo para confiar." },
  { texto: "A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.", referencia: "2 Coríntios 12:9", livro: "2-corintios", capitulo: 12, versiculo: 9, acolhimento: "Sua fraqueza não é o fim." },
  { texto: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", referencia: "Salmos 46:1", livro: "salmos", capitulo: 46, versiculo: 1, acolhimento: "Há abrigo para você agora." },
];

export function getPalavraDoDia(data = new Date()): PalavraDoDia {
  const br = new Date(data.getTime() - 3 * 3600 * 1000);
  const dia = Math.floor(br.getTime() / 86400000);
  return LISTA[dia % LISTA.length];
}
