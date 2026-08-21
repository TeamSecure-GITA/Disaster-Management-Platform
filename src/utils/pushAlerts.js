export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const sendLocalEmergencyAlert = (title, body) => {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: "/pwa-192x192.png",
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true
      });
    });
  } else {
    alert(`🚨 ${title}: ${body}`);
  }
};