<template>
  <div v-if="title" class="w-[120px]" notranslate>
    <div class="break-words line-clamp-4">
      {{ title }}
    </div>
  </div>
  <div v-if="!title" class="text-red-500">no title</div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>
