# Chosen — Guia de Build Nativo (Android + iOS)

Documento de handoff para o time técnico responsável por gerar e publicar
o app **Chosen** na **Google Play** e na **Apple App Store**.
Inclui tudo o que o app entrega ao usuário, como ele funciona por dentro
e os passos exatos para transformar a base web (TanStack Start + Capacitor)
em binários assinados prontos para as lojas.

---

## 1. Visão geral do produto

**Nome comercial:** Chosen
**Bundle / Application ID:** `com.oonn.chosen`
**Display name:** Chosen
**Idioma principal:** Português (pt-BR)
**Orientação:** Retrato (portrait-only)
**Categoria sugerida nas lojas:** Estilo de vida / Espiritualidade
**Faixa etária sugerida:** Livre (4+ na App Store)
**Site / URL pública:** https://chosen.oonn.com.br
**Domínio de preview (Lovable):** https://chosenapp.lovable.app

### O que o app entrega ao usuário

Chosen é um app devocional que envia **palavras de fé, motivação e paz na
hora certa do dia**. Toda a experiência é feita para caber em 10–30 segundos,
sem feed infinito, sem contas, sem login.

Principais entregas para quem usa:

- **Mensagem por sentimento** — o usuário escolhe como está se sentindo
  (Feliz, Ansioso, Triste, Sozinho, Agradecido, Nervoso, Motivação,
  Preciso de esperança, Preciso de paz, Preciso de força) e recebe um
  versículo, salmo ou reflexão pensado para aquele momento, com uma
  breve explicação do contexto.
- **Notificações vivas ao longo do dia** — perguntas espirituais curtas
  ("Como seu coração acordou?", "O que sua alma pede agora?"), palavras
  de bênção, gratidão e paz, com intensidade configurável
  (Leve = 4/dia · Normal = 9/dia · Presente = 14/dia).
- **Mini-conversa nas notificações** — respostas encadeadas: quando o
  usuário toca um sentimento na notificação, o app agenda um follow-up
  3–8 minutos depois com uma palavra específica pra aquele estado.
- **Aprendizado leve do humor** — o app guarda localmente as últimas
  ~30 respostas e adapta as próximas mensagens (streak de "Ansioso"
  vira convite pra paz; streak de "Grato" vira convite pra registrar
  um momento).
- **Momentos (gratidão em texto livre)** — o usuário pode responder
  perguntas direto da notificação (input inline nativo) e o texto vai
  para a aba **Momentos** dentro de "Escolhidas".
- **Favoritas & Histórico** — coração pra salvar qualquer mensagem;
  histórico local do que foi lido.
- **Orações** — guia devocional com estrutura ACTS e orações prontas.
- **Silêncio** — modo de respiração + palavra curta para pausar.
- **Compartilhar** — gera imagem bonita da mensagem (via `html-to-image`)
  e compartilha pelo share nativo do sistema.
- **Chacoalhar para receber uma palavra (shake to Chosen)** —
  atalho físico usando acelerômetro do device.
- **Atalhos no ícone (long-press)** — 4 ações rápidas: *Preciso de
  mensagem*, *Uma motivação*, *Um salmo*, *Orações*.
- **Tema por hora do dia** — a UI muda de tonalidade conforme manhã,
  tarde, noite, madrugada.
- **Onboarding curto** e **modo sem cadastro** — nenhum dado do usuário
  sai do device.

### O que o app **não** faz (importante para review)

- Não coleta dados pessoais, não pede login, não pede e-mail.
- Não tem chat, não tem UGC (conteúdo gerado por usuário público),
  não tem comunidade nem comentários.
- Não tem compras dentro do app (nem IAP, nem assinatura, nem paywall).
- Não tem anúncios.
- Não tem tracking de terceiros / SDK de ads / SDK de analytics.
- Não usa localização, contatos, câmera, microfone, calendário, saúde
  nem armazenamento externo.
- Todo conteúdo é embutido no bundle (versículos, salmos, reflexões,
  motivacionais) — não há chamada a servidor obrigatória em runtime.

---

## 2. Stack técnica

| Camada | Tecnologia |
|---|---|
| UI / SPA | React 19 + TanStack Router/Start (SSG estático para nativo) |
| Estilo | Tailwind v4 (via `@tailwindcss/vite`), shadcn/ui, Radix |
| Build | Vite 7 (`vite build` gera `.output/public`, incluindo o `index.html` estático) |
| Empacotamento nativo | Capacitor 8 (`@capacitor/core@^8.4`) |
| Notificações | `@capacitor/local-notifications@^8.2` |
| Atalhos no ícone | `@capawesome/capacitor-app-shortcuts@^8.0` |
| Compartilhar | `@capacitor/share@^8.0` |
| Haptics | `@capacitor/haptics@^8.0` |
| Splash / StatusBar | `@capacitor/splash-screen@^8.0`, `@capacitor/status-bar@^8.0` |
| App events (backButton, deep-link) | `@capacitor/app@^8.1` |
| Mídia | `@capacitor-community/media@^9.1` (salvar imagem gerada) |
| Filesystem | `@capacitor/filesystem@^8.1` |
| Runtime alvo | Android 8+ (API 26+) · iOS 14+ |

O conteúdo devocional e a Bíblia não dependem de backend. Firebase Cloud Messaging
é usado apenas para push remoto; Chosen IA, painel administrativo, registro de
push e widgets online precisam de conexão. A parte web também roda como PWA em
https://chosenapp.lovable.app de forma independente do binário nativo.

---

## 3. Configuração do Capacitor

Arquivo raiz: `capacitor.config.ts`

```ts
{
  appId: 'com.oonn.chosen',
  appName: 'Chosen',
  webDir: '.output/public',
  // Não configurar server.url: o app deve abrir os arquivos embutidos.
  // O hostname preserva a origem local anterior no Android. No iOS, o
  // WKWebView exige um scheme próprio (http/https não são aceitos).
  server: {
    hostname: 'chosen.oonn.com.br',
    androidScheme: 'https',
    iosScheme: 'capacitor',
    cleartext: false,
  },
  plugins: {
    SplashScreen: { launchShowDuration: 1500, launchAutoHide: true,
                    launchFadeOutDuration: 300, backgroundColor: '#ffffff',
                    showSpinner: false },
    StatusBar:    { style: 'Light', backgroundColor: '#ffffff' },
    LocalNotifications: { smallIcon: 'ic_stat_chosen', iconColor: '#f1f26c' },
    AppShortcuts: { shortcuts: [
      { id: 'mensagem',  title: 'Preciso de mensagem', description: 'Uma palavra pra agora' },
      { id: 'motivacao', title: 'Uma motivação',       description: 'Um empurrão pro seu dia' },
      { id: 'salmo',     title: 'Um salmo',            description: 'Palavra do Senhor' },
      { id: 'oracoes',   title: 'Orações',             description: 'Fale com Deus' },
    ]},
  },
}
```

### Regras de build web -> nativo

1. `bun install` (ou `npm ci`)
2. `bun run build` (roda `vite build` — gera `.output/public` com `index.html`)
3. `npx cap sync` (copia `.output/public` para `android/app/src/main/assets/public` e para o bundle do iOS)
4. Abrir o projeto nativo (`npx cap open android` / `npx cap open ios`) e assinar.

> Alternativa: `bun run cap:sync` já faz build + sync em um passo.

O script **não** exige variáveis de ambiente em runtime para abrir o app.
Mensagens, Bíblia completa, orações, favoritos, grifos, preferências e
notificações locais funcionam offline após o `sync`. Chosen IA, painel,
registro/envio de push remoto e atualização dos widgets precisam de internet.
Como o conteúdo fica dentro do binário, mudanças no app nativo passam a exigir
um novo build e uma nova versão nas lojas.

---

## 4. Android

### 4.1 Metadados

- **applicationId:** `com.oonn.chosen`
- **minSdkVersion:** 26 (Android 8.0)
- **targetSdkVersion:** 35 (Android 15) — obrigatório pela Play a partir de 2025
- **compileSdkVersion:** 35
- **versionCode / versionName:** definir em `android/app/build.gradle` a cada release

### 4.2 Permissões (`AndroidManifest.xml`)

Somente o que é necessário para as features documentadas:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.USE_EXACT_ALARM"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

- `POST_NOTIFICATIONS` — Android 13+ pede runtime permission (fluxo já
  implementado em `src/hooks/useNativeNotifications.ts` via
  `LocalNotifications.requestPermissions`).
- `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` — necessário para
  `@capacitor/local-notifications` disparar nos horários certos em
  Android 12+.
- `RECEIVE_BOOT_COMPLETED` — reagenda notificações após o boot.
- `VIBRATE` — usado pelo Haptics.

**Não incluir**: Location, Camera, Microphone, ReadContacts,
ReadExternalStorage, ReadMediaImages/Video, Bluetooth, etc. O app não usa.

### 4.3 Ícone e splash

- Ícone launcher: gerar mipmap adaptive a partir de `public/icon-512.png`
  (foreground) e usar `#ffffff` como background — pode-se usar
  `@capacitor/assets`: `npx capacitor-assets generate --android`.
- Ícone monocromático da status bar de notificação:
  `res/drawable/ic_stat_chosen.xml` (referenciado por
  `LocalNotifications.smallIcon` em `capacitor.config.ts`).
  Requisito Android: silhueta branca sobre fundo transparente.
- Splash: já configurada via `@capacitor/splash-screen` — fundo `#ffffff`,
  duração 1.5s.

### 4.4 App Shortcuts (long-press no ícone)

O plugin `@capawesome/capacitor-app-shortcuts` já vem configurado
**duas vezes** para garantir que apareçam desde o primeiro toque:

1. **Estáticos** — definidos em `capacitor.config.ts → plugins.AppShortcuts.shortcuts`.
   O plugin gera automaticamente `res/xml/shortcuts.xml` no `cap sync` e
   registra `<meta-data android:name="android.app.shortcuts">` no manifest.
2. **Dinâmicos** — `src/hooks/useAppShortcuts.ts` chama `AppShortcuts.set(...)`
   na inicialização do app e escuta o evento `click` para navegar para
   `/atalho/{mensagem|motivacao|salmo}?src=shortcut` ou `/oracoes?src=shortcut`.

Se, após o `cap sync`, os atalhos não aparecerem, checar que o
`res/xml/shortcuts.xml` foi gerado e que o `AndroidManifest.xml` tem a
`meta-data` apontando pra ele — reinstalar o app (long-press cache do launcher
é sticky).

### 4.5 Deep links / URL Scheme

`androidScheme: 'https'` faz o Capacitor servir a WebView de `https://localhost`.
**Não** há App Links (`android:autoVerify`) configurados por enquanto — se o
time quiser, o domínio a verificar é `chosen.oonn.com.br` (assetlinks.json a
ser hospedado em `/.well-known/assetlinks.json` no domínio).

### 4.6 Assinatura e upload

- Gerar keystore próprio da conta (ex.: `chosen-release.jks`).
- Guardar `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` no
  `~/.gradle/gradle.properties` da máquina de build (ou secrets do CI).
- Build: `./gradlew bundleRelease` → gera `app-release.aab`.
- Enviar `.aab` para o **Google Play Console** (App Bundle obrigatório).

### 4.7 Google Play — Data Safety

Preenchimento correto do formulário:

- **Coleta de dados:** *Nenhum dado coletado*.
- **Compartilhamento:** *Nenhum*.
- **Dados armazenados no device:**
  - Preferências (intensidade das notificações, histórico de humor,
    momentos escritos, favoritos, últimas mensagens vistas) — armazenados
    exclusivamente em `localStorage`/`Preferences` do device, nunca saem
    do aparelho.
- **Anúncios:** Não.
- **Faixa etária:** Everyone.

---

## 5. iOS

### 5.1 Metadados

- **Bundle Identifier:** `com.oonn.chosen`
- **Display Name:** Chosen
- **Deployment Target:** iOS 14.0
- **Device Family:** iPhone (universal iPad opcional — retrato-only)
- **Orientation:** Portrait
- **Encryption (ITSAppUsesNonExemptEncryption):** `false` (só HTTPS padrão, sem cripto custom)

### 5.2 Info.plist — chaves obrigatórias

```xml
<key>UIStatusBarStyle</key><string>UIStatusBarStyleDefault</string>
<key>UISupportedInterfaceOrientations</key>
<array><string>UIInterfaceOrientationPortrait</string></array>
<key>ITSAppUsesNonExemptEncryption</key><false/>
```

**Purpose strings a incluir** (o app só usa se necessário, mas iOS exige
o texto assim que o plugin estiver linkado):

- `NSMotionUsageDescription` — "Usamos o acelerômetro para permitir
  chacoalhar o celular e receber uma mensagem." (feature *Shake to Chosen*)
- `NSUserNotificationsUsageDescription` — não é obrigatório; a permissão
  é solicitada via `LocalNotifications.requestPermissions()`.

> **Não incluir** NSCameraUsageDescription, NSMicrophoneUsageDescription,
> NSPhotoLibraryUsageDescription, NSLocationWhenInUseUsageDescription,
> NSContactsUsageDescription, NSCalendarsUsageDescription — o app não usa
> nenhum desses; incluí-los sem uso pode gerar rejeição na review.

### 5.3 Capabilities

No Xcode → *Signing & Capabilities* adicionar:

- **Push Notifications** — *não* precisa (usamos apenas *Local
  Notifications*, que não requer certificado APNs).
- **Background Modes** — *não* precisa (sem fetch em background;
  as notificações locais são agendadas com `at:` e disparam pelo iOS).

### 5.4 Ícones e splash

- App icon: `public/icon-512.png` → gerar App Icon Set com
  `npx capacitor-assets generate --ios`.
- Splash: fundo `#ffffff`, logo centralizado (mesma imagem do launcher).
- Ícone da notificação: iOS usa o próprio app icon; **não** há equivalente
  ao `ic_stat_*` do Android.

### 5.5 App Shortcuts (Home screen quick actions)

O plugin `@capawesome/capacitor-app-shortcuts` gera automaticamente as
entradas `UIApplicationShortcutItems` no `Info.plist` a partir do
`capacitor.config.ts` durante o `cap sync`. Verificar no Xcode após o sync.
O `useAppShortcuts.ts` também registra dinamicamente e trata o clique.

### 5.6 App Store Connect — Privacy Nutrition Label

- **Data Not Collected**.
- Sem trackers.
- Sem SDK de terceiros que colete dados.
- Content Rating: 4+.
- Age Rating questionnaire: todas *None*.

### 5.7 Assinatura e upload

- Time de desenvolvimento e certificado *Apple Distribution* já
  provisionados na conta OONN.
- Provisioning profile: *App Store* para `com.oonn.chosen`.
- Build: `xcodebuild archive` → *Distribute App* → *App Store Connect*
  (ou via Transporter/altool com o `.ipa`).

---

## 6. Notificações locais — detalhes técnicos

Arquivo principal: `src/hooks/useNativeNotifications.ts`
Prefs: `src/lib/notificationPrefs.ts`
Copy: `src/lib/notificationCopy.ts`
Memória de humor: `src/lib/moodMemory.ts`
Momentos (input inline): `src/lib/gratitudeLog.ts`

### Intensidades

| Modo | Notificações/dia |
|---|---|
| Leve (🌱) | 4 |
| Normal (✨) | 9 |
| Presente (💛) | 14 |

Usuário troca no menu flutuante (FloatingMenu). Escolha persiste em
`localStorage` (`chosen_notification_intensity`).

### Categorias/actions registradas

Registradas via `LocalNotifications.registerActionTypes(...)` no boot.
Cada action encaminha para uma rota interna e alguns registram *input inline*
(campo de texto na própria notificação — Android e iOS 12+).

### Quiet hours

Nenhuma notificação é agendada entre 22:30 e 06:59 (respeitando fuso local
do device). O agendamento é rebuilt uma vez por dia (chave
`chosen_native_scheduled_date`).

### Gatilhos reativos

Se o app fica >24h sem abrir, o handler `appStateChange` agenda **uma**
notificação "Sumido do Chosen" no próximo slot entre 09:00 e 21:00
(controlado por `chosen_reactive_last_fired` para não repetir).

---

## 7. Atalhos do ícone (long-press)

Rota: `src/routes/atalho.$acao.tsx` sorteia uma mensagem/salmo/motivacional
aleatório e redireciona para `/mensagem/{categoria}?id=...`.

| Shortcut ID | Título | Ação |
|---|---|---|
| `mensagem` | Preciso de mensagem | Mensagem global aleatória |
| `motivacao` | Uma motivação | Motivacional aleatório |
| `salmo` | Um salmo | Salmo aleatório |
| `oracoes` | Orações | Abre `/oracoes` |

Também expostos como `manifest.json → shortcuts[]` para PWA (Chrome/Edge/Samsung).

---

## 8. Conteúdo embutido

- 10 categorias emocionais em `src/lib/data.ts` (~várias dezenas de
  versículos/salmos/reflexões por categoria, com resumo contextual).
- Salmos em `src/lib/psalms.ts`.
- Palavras de silêncio/respiração em `src/lib/silenceWords.ts`.
- Todo o conteúdo é **estático e ofensivo-safe** — versículos bíblicos
  clássicos, orações cristãs, motivacionais. Nada de política, sexo,
  violência, saúde, finanças.

---

## 9. Privacidade & compliance

- **Nenhum dado sai do device.** Não há backend próprio, nem chamadas HTTP
  a APIs externas em runtime do app instalado.
- **Sem cookies, sem tracking, sem SDK de terceiros.**
- **Sem login, sem cadastro.**
- **Política de privacidade** (obrigatória nas duas lojas):
  hospedar em `https://chosen.oonn.com.br/privacidade` (a redigir se ainda
  não existir) — texto pode ser 1 página curta reforçando *"Nenhum dado
  pessoal é coletado. Preferências ficam no seu aparelho."*
- **Termos de uso**: opcional, mesma URL base `/termos`.

---

## 10. Checklist final antes de submeter

### Android (Play Console)

- [ ] `versionCode` incrementado.
- [ ] `.aab` assinado com keystore de produção.
- [ ] Screenshots (mínimo 2, telefone) + ícone 512x512 + feature graphic 1024x500.
- [ ] Formulário *Data safety* preenchido como "no data collected".
- [ ] Classificação etária respondida (tudo *No*).
- [ ] Política de privacidade URL preenchida.
- [ ] `POST_NOTIFICATIONS` justificado (envio de devocionais diários).
- [ ] `SCHEDULE_EXACT_ALARM` justificado (horário exato das devocionais).
- [ ] App testado em dispositivo Android 13+ e Android 8.

### iOS (App Store Connect)

- [ ] Build enviado via Xcode / Transporter com sucesso.
- [ ] Screenshots 6.7" e 6.5" (obrigatório) e 5.5" (opcional).
- [ ] Ícone 1024x1024 sem transparência e sem cantos arredondados.
- [ ] Privacy Nutrition Label = *Data Not Collected*.
- [ ] `ITSAppUsesNonExemptEncryption = false`.
- [ ] `NSMotionUsageDescription` presente (shake to Chosen).
- [ ] Testado em iPhone real (notificações locais + long-press shortcuts).
- [ ] Age rating 4+.
- [ ] Política de privacidade URL preenchida.

---

## 11. Contatos e ownership

- **Proprietário do app:** OONN
- **Bundle ID:** `com.oonn.chosen`
- **Domínio oficial:** `chosen.oonn.com.br`
- **Repositório / preview:** Lovable project
  `cf808645-b75a-4bfa-9566-876b26385e38`
  (preview em `chosenapp.lovable.app`)

Qualquer dúvida sobre features ou copy: consultar o time de produto antes
de alterar strings visíveis (a linguagem espiritual é intencional).
