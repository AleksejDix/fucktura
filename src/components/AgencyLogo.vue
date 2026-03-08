<template>
  <div class="relative w-full" v-if="agencyStore.data.logo">
    <img
      class="absolute top-0 bottom-0 right-0 h-full object-contain"
      :src="agencyStore.data?.logo"
      :alt="agencyStore.data?.name"
    />
  </div>
</template>

<script setup lang="ts">
import { useAgencyStore } from '@/stores/agency';

const agencyStore = useAgencyStore();
</script>
