<template>
  <Teleport to="body">
    <div
      v-if="store.open"
      class="fixed inset-0 z-[300] bg-black/30 flex items-center justify-center p-8"
      @click.self="store.resolve(false)"
      @keydown.esc="store.resolve(false)"
    >
      <div class="w-[360px] max-w-[90vw] bg-white shadow-2xl border border-gray-200 p-5 space-y-4">
        <p class="text-[10pt] text-gray-800 leading-relaxed">{{ store.message }}</p>
        <div class="flex justify-end gap-2">
          <button
            ref="cancelBtn"
            type="button"
            @click="store.resolve(false)"
            class="px-3 py-1.5 text-[9pt] border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {{ $t('Cancel') }}
          </button>
          <button
            type="button"
            @click="store.resolve(true)"
            class="px-3 py-1.5 text-[9pt] text-white transition-colors"
            :class="
              store.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'
            "
          >
            {{ store.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useConfirmStore } from '@/stores/confirm';

const store = useConfirmStore();
const cancelBtn = ref<HTMLButtonElement | null>(null);

watch(
  () => store.open,
  async (open) => {
    if (open) {
      await nextTick();
      cancelBtn.value?.focus();
    }
  },
);
</script>
