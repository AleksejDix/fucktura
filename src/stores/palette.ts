import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePaletteStore = defineStore('palette', () => {
  const open = ref(false);

  function toggle() {
    open.value = !open.value;
  }

  return { open, toggle };
});
