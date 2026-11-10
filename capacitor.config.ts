import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oonn.chosen',
  appName: 'Chosen',
  webDir: '.output/public',
  // Sem server.url: o nativo abre o app embutido e funciona sem internet.
  server: {
    // Mantém a origem anterior no Android para conservar os dados locais.
    // As funções online usam o endereço publicado alternativo, sem colisão
    // com os arquivos servidos localmente pelo Capacitor.
    hostname: 'chosen.oonn.com.br',
    androidScheme: 'https',
    // WKWebView não aceita http/https como scheme local no iOS.
    iosScheme: 'capacitor',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Light',
      backgroundColor: '#ffffff',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_chosen',
      iconColor: '#f1f26c',
    },
    AppShortcuts: {
      // Atalhos padrão exibidos já no primeiro long-press, antes do JS rodar.
      // O useAppShortcuts sobrescreve depois com a mesma lista (idempotente).
      shortcuts: [
        { id: 'mensagem', title: 'Preciso de mensagem', description: 'Uma palavra pra agora' },
        { id: 'motivacao', title: 'Uma motivação', description: 'Um empurrão pro seu dia' },
        { id: 'salmo', title: 'Um salmo', description: 'Palavra do Senhor' },
        { id: 'oracoes', title: 'Orações', description: 'Fale com Deus' },
        { id: 'ia', title: 'Chosen IA', description: 'Converse e receba uma palavra' },
      ],
    },
  },
};

export default config;