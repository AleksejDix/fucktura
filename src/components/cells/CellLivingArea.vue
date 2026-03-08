<template>
  <div>
    <div v-if="livingArea" class="text-right" notranslate>
      <span class="font-semibold font-mono">{{ livingArea }}</span>
      <span class="text-gray-500"> m²</span>
    </div>
    <div v-if="!livingArea" class="text-red-500 text-right">living space not known</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  livingArea: {
    type: Number,
    default: 0,
  },
});
</script>
