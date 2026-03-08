<template>
  <div class="flex gap-8 w-[210mm] mx-auto items-center justify-center print:hidden relative">
    <DLegend v-if="modeStore.mode === 'edit'" class="absolute left-0" />
    <button
      @click="$emit('generate-pdf')"
      type="button"
      class="print:hidden bg-white text-xl text-black px-4 rounded-md font-medium shadow-sm py-2 whitespace-nowrap"
      data-testid="pdf-download-button"
    >
      <Printer :size="20" />
    </button>

    <select
      v-model="normStore.norm"
      class="bg-white text-sm text-black px-3 py-2 rounded-md shadow-sm border border-gray-200"
    >
      <option value="SN010130">SN 010130 (CH)</option>
      <option value="DIN5008">DIN 5008 (DE)</option>
    </select>

    <label class="relative inline-flex items-center cursor-pointer">
      <input
        v-model="modeStore.mode"
        true-value="edit"
        false-value="read"
        type="checkbox"
        class="sr-only peer"
      />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-0 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
      ></div>
      <span class="ml-3 text-sm font-medium text-gray-90">{{ $t('Edit') }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { Printer } from 'lucide-vue-next';
import { useModeStore } from '@/stores/mode';
import { useLetterNormStore } from '@/stores/letterNorm';
import DLegend from '@/components/DLegend.vue';

const modeStore = useModeStore();
const normStore = useLetterNormStore();

defineEmits(['generate-pdf']);
</script>
