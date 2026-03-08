<template>
  <div class="whitespace-nowrap text-right">
    <div v-if="date" notranslate>
      <span>{{ formatDateShort(new Date(date)) }}</span>
    </div>
    <div v-if="!date" class="text-red-500">
      <i class="fa-regular fa-transporter-empty"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateShort } from '../../formatters/date';

defineProps({
  date: {
    type: String,
    default: '',
  },
});
</script>
