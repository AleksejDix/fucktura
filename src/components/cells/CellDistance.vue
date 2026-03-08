<template>
  <div>
    <div v-if="distance" class="text-right" notranslate>
      <span>{{ distance }}</span>
    </div>
    <div v-if="!distance" class="text-red-500">distance not known</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  distance: {
    type: String,
    default: '',
  },
});
</script>
