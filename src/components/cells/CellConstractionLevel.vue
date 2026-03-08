<template>
  <div class="text-right whitespace-nowrap" notranslate>
    <div v-if="isNumberWithZero(level)" class="flex gap-2 justify-end items-center">
      <i class="fa-regular fa-layer-group" />
      <span>{{ level }}</span>
    </div>
    <div v-else class="text-red-400">
      <i class="fa-regular fa-transporter-empty"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isNumberWithZero } from '@/validators/isNumberWithZero';

defineProps({
  level: {
    type: Number,
    default: 0,
  },
});
</script>
