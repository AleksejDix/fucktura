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
  () => route.params.id,
  (id) => {
    store.setActive(id ? Number(id) : null);
  },
  { immediate: true },
);
</script>
