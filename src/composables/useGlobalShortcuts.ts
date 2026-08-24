import { onMounted, onUnmounted } from 'vue';
import { useDocumentsStore } from '@/stores/documents';
import { useFolderStore } from '@/stores/folder';
import { usePaletteStore } from '@/stores/palette';

/**
 * App-wide keyboard shortcuts. Installed once by the menu bar so the
 * bindings stay next to the component that displays them (⌘O, ⌘K, …).
 */
export function useGlobalShortcuts() {
  const store = useDocumentsStore();
  const folder = useFolderStore();
  const palette = usePaletteStore();

  function onKeydown(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod || e.altKey) return;
    const k = e.key.toLowerCase();
    if (!e.shiftKey && k === 'o') {
      e.preventDefault();
      folder.openFolder();
    } else if (!e.shiftKey && k === 'k') {
      e.preventDefault();
      palette.toggle();
    } else if (!e.shiftKey && k === 'd' && store.activeDocument) {
      e.preventDefault();
      store.duplicateDocument(store.activeDocument.number);
    } else if (e.shiftKey && k === 'l' && store.activeDocument) {
      e.preventDefault();
      store.addLineItemToActive();
    } else if (!e.shiftKey && e.key === ']') {
      e.preventDefault();
      store.nextDocument();
    } else if (!e.shiftKey && e.key === '[') {
      e.preventDefault();
      store.previousDocument();
    } else if (e.shiftKey && k === 'i' && store.activeDocument?.type === 'quote') {
      e.preventDefault();
      store.convertToInvoice(store.activeDocument.number);
    }
  }

  onMounted(() => document.addEventListener('keydown', onKeydown));
  onUnmounted(() => document.removeEventListener('keydown', onKeydown));
}
