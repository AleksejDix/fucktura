<template>
  <div class="text-right">
    <div v-if="percent" notranslate>
      <span class="font-semibold font-mono" notranslate>{{ percent.toFixed(2) }}</span>
      <span class="text-gray-500"> %</span>
    </div>
    <div v-if="!percent" class="text-red-500">percentage not known</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  percent: {
    type: Number,
    default: 0,
  },
});
</script>
