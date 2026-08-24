<template>
  <div
    class="w-[210mm] mx-auto py-8 px-[26mm] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] print:shadow-none my-4"
  >
    <slot name="top" />
    <p v-if="title" class="text-[14pt] font-bold text-gray-900 mb-6">{{ title }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>
