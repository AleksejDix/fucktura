import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useModeStore = defineStore('mode', () => {
  const mode = ref<'read' | 'edit'>('read');

  const isEditMode = computed(() => mode.value === 'edit');
  const isReadMode = computed(() => mode.value === 'read');

  return {
    mode,
    isEditMode,
    isReadMode,
  };
});
