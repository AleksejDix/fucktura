<template>
  <div v-if="type">
    <div>
      {{ type }}
    </div>
  </div>
  <div v-if="!type" class="text-red-500">type not known</div>
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: '',
  },
});
</script>
