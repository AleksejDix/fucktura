<template>
  <span class="font-mono">{{ formatted }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDate } from '@/composables/useDate';

const props = defineProps<{
  value: string;
}>();

defineEmits<{
  update: [value: string];
}>();

const { formatDate } = useDate();
const formatted = computed(() => formatDate(props.value));
</script>
