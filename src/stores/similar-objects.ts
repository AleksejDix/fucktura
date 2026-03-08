import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useGlobalStore } from './global';

export const useSimilarObjectsStore = defineStore('similar-objects', () => {
  const global = useGlobalStore();

  const objects = computed(() => global.data?.similarObjects || []);

  return { objects };
});
