import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  ensurePermission,
  forgetFolder,
  isFileSystemAccessSupported,
  loadRecents,
  pickDirectory,
  rememberFolder,
  type RecentFolder,
} from '@/fs/handle';
import { isEmpty, setRoot } from '@/fs/repo';
import { seedFromBundled } from '@/fs/seed';
import { tryMigrateFromLegacy } from '@/fs/migrate';
import { useDocumentsStore } from './documents';

export type BootState = 'init' | 'unsupported' | 'needs-pick' | 'picking' | 'loading' | 'ready';

export const useFolderStore = defineStore('folder', () => {
  const state = ref<BootState>('init');
  const error = ref('');
  const recents = ref<RecentFolder[]>([]);
  const currentHandle = ref<FileSystemDirectoryHandle | null>(null);

  const currentName = computed(() => currentHandle.value?.name ?? '');

  async function activate(handle: FileSystemDirectoryHandle) {
    setRoot(handle);
    state.value = 'loading';
    if (await isEmpty()) {
      const isFirstBoot = recents.value.length === 0;
      if (isFirstBoot) {
        const migrated = await tryMigrateFromLegacy();
        if (!migrated) await seedFromBundled();
      }
      // On subsequent folder switches, an empty folder stays empty.
    }
    const docs = useDocumentsStore();
    await docs.load();
    currentHandle.value = handle;
    recents.value = await rememberFolder(handle);
    state.value = 'ready';
  }

  /** Called once on app boot. Cascades through recents, pruning broken ones. */
  async function init() {
    if (!isFileSystemAccessSupported()) {
      state.value = 'unsupported';
      return;
    }
    recents.value = await loadRecents();
    for (const entry of [...recents.value]) {
      if (!(await ensurePermission(entry.handle))) continue;
      try {
        await activate(entry.handle);
        return;
      } catch (e) {
        console.warn(`Recent folder "${entry.name}" failed, pruning`, e);
        recents.value = await forgetFolder(entry.handle);
      }
    }
    state.value = 'needs-pick';
  }

  async function clearRecents() {
    for (const entry of [...recents.value]) {
      recents.value = await forgetFolder(entry.handle);
    }
  }

  /** Prompt the OS picker and switch to the chosen folder. */
  async function openFolder() {
    error.value = '';
    const prev = state.value;
    state.value = 'picking';
    try {
      const handle = await pickDirectory();
      await activate(handle);
    } catch (e) {
      state.value = prev === 'ready' ? 'ready' : 'needs-pick';
      if ((e as DOMException).name !== 'AbortError') {
        error.value = (e as Error).message;
      }
    }
  }

  /** Switch to a folder already in recents. Re-prompts permission if needed. */
  async function openRecent(entry: RecentFolder) {
    error.value = '';
    if (!(await ensurePermission(entry.handle))) {
      error.value = 'Permission denied';
      return;
    }
    try {
      await activate(entry.handle);
    } catch (e) {
      recents.value = await forgetFolder(entry.handle);
      error.value = (e as Error).message;
    }
  }

  return {
    state,
    error,
    recents,
    currentName,
    currentHandle,
    init,
    openFolder,
    openRecent,
    clearRecents,
  };
});
