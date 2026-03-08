<template>
  <div v-for="(page, index) in pagesStore.pages" :key="page.id">
    <component :is="page.component" :page-index="index" v-bind="page.metadata" />
  </div>
</template>

<script lang="ts" setup>
import { usePagesStore } from '@/stores/pages';

const pagesStore = usePagesStore();
</script>
