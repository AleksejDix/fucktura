<template>
  <div class="max-w-[120px] break-words line-clamp-4">
    <div v-if="status" notranslate>
      <span>{{ status }}</span>
    </div>
    <div v-if="!status" class="text-red-500">status not known</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  status: {
    type: String,
    default: '',
  },
});
</script>
