<template>
  <Pages />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDocumentsStore } from '@/stores/documents';
import Pages from '@/components/Pages.vue';

const route = useRoute();
const store = useDocumentsStore();

watch(
  () => route.params.number,
  (num) => {
    store.setActive(typeof num === 'string' && num ? num : null);
  },
  { immediate: true },
);
</script>
