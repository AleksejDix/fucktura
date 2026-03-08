<template>
  <div class="text-right font-mono whitespace-nowrap">
    <span class="font-semibold font-mono" notranslate>
      {{ listedDayCount }}
    </span>
    <span class="text-gray-600">
      {{ pluralize(listedDayCount, 'day') }}
    </span>
  </div>
</template>

<script setup lang="ts">
const pluralize = (count: number, noun: string, suffix = 's') =>
  ` ${noun}${count !== 1 ? suffix : ''}`;

defineProps({
  listedDayCount: {
    type: Number,
    default: 0,
  },
});
</script>
