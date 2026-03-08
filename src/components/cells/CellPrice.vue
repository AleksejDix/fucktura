<template>
  <div class="min-w-[100px] break-words line-clamp-2">
    <div v-if="price" class="font-semibold font-mono text-right" notranslate>
      {{ formatPrice(price) }}
    </div>
    <div v-else class="text-red-500 text-right">price not known</div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/formatters/currency';

defineProps({
  price: {
    type: Number,
    default: 0,
  },
});
</script>
