<template>
  <div class="text-right whitespace-nowrap" notranslate>
    <div v-if="isNumberWithZero(level)" class="flex gap-2 justify-end items-center">
      <Layers :size="16" />
      <span>{{ level }}</span>
    </div>
    <div v-else class="text-red-400">
      <PackageOpen :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Layers, PackageOpen } from 'lucide-vue-next';
import { isNumberWithZero } from '@/validators/isNumberWithZero';

defineProps({
  level: {
    type: Number,
    default: 0,
  },
});
</script>
