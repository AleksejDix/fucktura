<template>
  <div>
    <div v-if="id" class="font-semibold font-mono" notranslate>
      {{ id }}
    </div>
    <div v-if="!id" class="text-red-500">id not known</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  id: {
    type: Number,
    default: 0,
  },
});
</script>
