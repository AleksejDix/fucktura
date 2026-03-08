<template>
  <div class="w-[210mm] mx-auto print:hidden relative">
    <DLegend v-if="modeStore.mode === 'edit'" />
  </div>
</template>

<script setup lang="ts">
import { useModeStore } from '@/stores/mode';
import DLegend from '@/components/DLegend.vue';

const modeStore = useModeStore();
</script>
