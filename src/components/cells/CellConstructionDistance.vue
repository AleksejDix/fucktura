<template>
  <div>
    <div v-if="distance" class="text-right" notranslate>
      <span class="font-medium">{{ distance }}</span>
      <span class="text-gray-500">m</span>
    </div>
    <div v-if="!distance" class="text-red-500">distance not known</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  distance: {
    type: Number,
    default: 0,
  },
});
</script>
