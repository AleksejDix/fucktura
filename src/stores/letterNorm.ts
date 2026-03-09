import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type LetterNorm = 'SN010130' | 'DIN5008' | 'NEN1026' | 'UNE';

export const useLetterNormStore = defineStore('letterNorm', () => {
  const norm = ref<LetterNorm>('SN010130');
  const normClass = computed(() => `norm-${norm.value}`);

  return { norm, normClass };
});
