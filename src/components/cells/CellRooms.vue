<template>
  <div>
    <div v-if="rooms" class="font-semibold font-mono text-right" notranslate>
      {{ rooms }}
    </div>
    <div v-else class="text-red-500 text-right">-</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  rooms: {
    type: Number,
    default: 0,
  },
});
</script>
