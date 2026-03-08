<template>
  <div v-if="pagesStore.pages[pageIndex].enabled" class="pl-2 pagination flex space-x-1">
    <span>{{ $t('Page') }}</span>
    <span class="current-page" notranslate>{{ pagesStore.pageNumbers[pageIndex] }}</span>
    <span>of</span>
    <span class="total-page" notranslate>{{ pagesStore.numberOfVisiblePages }}</span>
  </div>
</template>

<script lang="ts" setup>
import { usePagesStore } from '@/stores/pages';

defineProps({
  pageIndex: { type: Number, default: 0 },
  displayPageIndex: { type: Number, default: (props: any) => props.pageIndex },
});

const pagesStore = usePagesStore();
</script>
