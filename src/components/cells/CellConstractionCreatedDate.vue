<template>
  <div>
    <div v-if="date" class="text-right whitespace-nowrap" notranslate>
      <span>{{ formatDateShort(new Date(date)) }}</span>
    </div>
    <div v-if="!date" class="text-red-500">
      <PackageOpen :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PackageOpen } from 'lucide-vue-next';
import { formatDateShort } from '../../formatters/date';

defineProps({
  date: {
    type: String,
    default: '',
  },
});
</script>
