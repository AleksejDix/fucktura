<template>
  <address v-if="address" class="flex not-italic text-black" notranslate>
    <div class="flex items-center gap-3">
      <MapPin :size="24" />
      <div>
        <p>{{ street }}</p>
        <p>{{ locality }}</p>
      </div>
    </div>
  </address>
</template>

<script setup lang="ts">
import { MapPin } from 'lucide-vue-next';

const props = defineProps({
  address: {
    type: String,
    default: '',
  },
});

const [street = '', locality = ''] = props.address.split(',');
</script>
