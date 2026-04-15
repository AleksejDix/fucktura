import { ref } from 'vue';

export const updateReady = ref(false);
let waiting: ServiceWorker | null = null;

export function registerServiceWorker() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) {
        waiting = reg.waiting;
        updateReady.value = true;
      }
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            waiting = nw;
            updateReady.value = true;
          }
        });
      });
    })
    .catch((e) => console.warn('[sw] register failed', e));

  // Reload exactly once when a new SW takes over.
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
}

export function applyUpdate() {
  waiting?.postMessage({ type: 'SKIP_WAITING' });
}
