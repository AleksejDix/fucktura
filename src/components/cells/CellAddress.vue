<template>
  <div v-if="address" class="min-w-[100px] max-w-[160px] break-words line-clamp-4" notranslate>
    <div v-for="line in lines" :key="line" class="break-words">
      {{ line }}
    </div>
  </div>
  <div v-if="!address" class="text-red-500">address not known</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  address: {
    type: String,
    default: '',
  },
});

const lines = computed(() =>
  props.address
    .split(',')
    .flatMap((line) => line.split('/').map((x) => x.trim()))
    .slice(0, 2),
);
</script>
