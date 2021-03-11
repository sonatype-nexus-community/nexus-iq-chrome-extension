// tslint:disable:no-console

import { Workbox } from 'workbox-window';

export default function register() {
  console.debug("Registering Service Worker");

  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    wb.register();

    console.debug("Service Worker registered");
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
