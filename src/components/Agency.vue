<template>
  <address v-if="agencyStore.data" class="not-italic text-right" notranslate>
    <div>
      <span v-if="agencyStore.data.name" class="font-bold" data-testid="agency-name-text">{{
        agencyStore.data.name
      }}</span>
    </div>
    <div>
      <a
        v-if="agencyStore.data.phone"
        :href="`tel:${agencyStore.data.phone}`"
        data-testid="agency-phone-text"
        >{{ agencyStore.data.phone }}</a
      >
    </div>
    <div>
      <a v-if="agencyStore.data.email" :href="`mailto:${agencyStore.data.phone}`">{{
        agencyStore.data.email
      }}</a>
    </div>
  </address>
</template>

<script setup lang="ts">
import { useAgencyStore } from '@/stores/agency';

const agencyStore = useAgencyStore();
</script>
