<template>
  <div class="text-right min-w-[100px] break-words line-clamp-2">
    <div v-if="pricePerSquareMeter" notranslate>
      <span class="font-semibold font-mono">
        {{ formatPrice(roundToStep(pricePerSquareMeter, 250)) }}
      </span>
      <span class="text-gray-500"> / m²</span>
    </div>
    <div v-if="!pricePerSquareMeter" class="text-red-500">price not known</div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '@/formatters/currency';
import { roundToStep } from '@/functions/roundToStep';

defineProps({
  pricePerSquareMeter: {
    type: Number,
    default: 0,
  },
});
</script>
