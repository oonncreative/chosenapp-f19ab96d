// Eventos de notificação do Chosen. O cache e o app shell são gerados
// automaticamente pelo vite-plugin-pwa; este arquivo não controla o cache.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const moodToCategory = {
    mood_happy: "Feliz",
    mood_neutral: "Preciso de paz",
    mood_sad: "Triste",
    mood_angry: "Nervoso",
  };
  let targetUrl = (event.notification.data && event.notification.data.url) || "/home";
  if (event.action && moodToCategory[event.action]) {
    targetUrl =
      "/mensagem/" +
      encodeURIComponent(moodToCategory[event.action]) +
      "?color=%23f1f26c&id=mood";
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          try {
            client.navigate(targetUrl);
          } catch {}
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (event.data?.type === "SCHEDULE_NOTIFICATION" && event.data.immediate) {
    self.registration.showNotification("Chosen", {
      body: event.data.message || "Uma palavra escolhida pra você.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  }
});
