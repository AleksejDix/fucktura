<template>
  <div class="flex justify-between">
    <span class="text-gray-600">{{ label }}:</span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>
