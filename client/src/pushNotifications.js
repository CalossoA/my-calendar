// pushNotifications.js
// Funzioni per gestire la subscription push dal frontend React

const VAPID_PUBLIC_KEY = 'BPnRDjM4ebVBPbcA4clTgjhdcj-VrZi0HioNotgYSTHMhcjmRzDpF9ipyeGxNTGOIqZYxStVs7ac4Qbf2RpVu9s';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      // Invia la subscription al backend
      await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return true;
    } catch (err) {
      console.error('Errore nella subscription push:', err);
      return false;
    }
  }
  return false;
}
