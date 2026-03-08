<template>
  <div>
    <div v-if="rank" class="text-right" notranslate>
      <span class="font-semibold font-mono">{{ rank }}</span>
    </div>
    <div v-if="!rank" class="text-red-500">rank not known</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  rank: {
    type: Number,
    default: 0,
  },
});
</script>
