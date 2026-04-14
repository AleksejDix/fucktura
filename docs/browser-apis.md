# Browser APIs — ideas for Fucktura

Curated shortlist of web platform APIs that could meaningfully improve the
app, ranked by actual payoff. Chromium-only where noted (acceptable — we
already require Chromium for File System Access).

## High impact

### File Handling API + Launch Queue

Register `.json` with the app so double-clicking an invoice file in Finder
opens it directly in Fucktura.

- Manifest entry: `file_handlers`
- Runtime: `window.launchQueue.setConsumer(launch => launch.files)`
- Pairs naturally with our on-disk JSON layout.

### Web Share API

Replace `mailto:` with the native share sheet for sending invoices.

```ts
await navigator.share({
  title: `Rechnung ${doc.number}`,
  files: [pdfBlob], // File[]
});
```

Gives Mail, Messages, AirDrop, WhatsApp, etc. for free. Requires HTTPS
and a user gesture.

### BroadcastChannel

When the app is open in two tabs on the same folder, writes in one tab
instantly refresh the other. Today we rely on window focus — this fixes
multi-tab edits without any polling.

```ts
const ch = new BroadcastChannel('erechnung');
ch.postMessage({ type: 'doc-changed', number });
ch.onmessage = (e) => documentsStore.load();
```

### Badging API

Show overdue-invoice count on the dock / taskbar icon.

```ts
navigator.setAppBadge(overdueCount);
navigator.clearAppBadge();
```

Only visible when installed as a PWA.

### BarcodeDetector (Shape Detection API)

Point camera at a Swiss QR bill (or drop an image) → auto-fill a new
invoice's recipient, IBAN, and amount.

```ts
const detector = new BarcodeDetector({ formats: ['qr_code'] });
const codes = await detector.detect(imageBitmap);
// parse SPC payload from codes[0].rawValue
```

Saves minutes per incoming supplier invoice.

### Persistent Storage

Ask the browser not to evict our config IDB (which holds the folder
handle). Without this, long-inactive users can lose the handle and have
to re-pick the folder.

```ts
await navigator.storage.persist();
```

## Nice polish

### View Transitions API

Cross-fade between documents when navigating the sidebar.

```ts
document.startViewTransition(() => router.push(`/${doc.number}`));
```

### Popover API + CSS anchor positioning

Native replacement for the current custom absolute-positioning in
`DMenuBar`, `DClientPicker`. Less JS, better a11y, free ESC dismissal.

### Web App Manifest (PWA)

Install as a standalone app with its own window. We already work offline
because all data is local — just need the manifest + service worker.

### Local Fonts Access API

`navigator.fonts.query()` → let the user pick any installed system font
for invoice typography. Currently Chromium-only, behind permission
prompt.

### CompressionStream

One-click "Export backup.zip" of the whole folder without a library.

```ts
const cs = new CompressionStream('gzip');
```

### Screen Wake Lock

Prevent display sleep while drafting a long Mahnung.

```ts
const lock = await navigator.wakeLock.request('screen');
```

## Not worth it for this project

- **WebUSB / WebHID** — we print A4, not POS receipts.
- **Contact Picker** — mobile-only; clients already live in the folder.
- **WebCodecs / WebGPU** — no media or heavy compute.
- **Service Worker background sync** — nothing to sync; data is local.

## Next to ship

If we pick two:

1. **File Handling API** — biggest "desktop app" UX win.
2. **BroadcastChannel** — fixes a real multi-tab edge case for free.
