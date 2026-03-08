<template>
  <div class="text-right whitespace-nowrap">
    <div>
      <span>{{ isActive ? 'active' : 'inactive' }} </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
});
</script>
