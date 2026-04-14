import { defineStore } from 'pinia';
import { ref } from 'vue';

interface ConfirmOptions {
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export const useConfirmStore = defineStore('confirm', () => {
  const open = ref(false);
  const message = ref('');
  const confirmLabel = ref('OK');
  const destructive = ref(false);
  let resolver: ((ok: boolean) => void) | null = null;

  function ask(opts: ConfirmOptions): Promise<boolean> {
    message.value = opts.message;
    confirmLabel.value = opts.confirmLabel ?? 'OK';
    destructive.value = !!opts.destructive;
    open.value = true;
    return new Promise((resolve) => {
      resolver = resolve;
    });
  }

  function resolve(ok: boolean) {
    open.value = false;
    resolver?.(ok);
    resolver = null;
  }

  return { open, message, confirmLabel, destructive, ask, resolve };
});
