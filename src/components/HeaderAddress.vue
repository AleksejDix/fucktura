<template>
  <address v-if="address" class="flex not-italic text-black" notranslate>
    <div class="flex items-center gap-3">
      <i class="fa-regular fa-location-dot text-2xl" />
      <div>
        <p>{{ street }}</p>
        <p>{{ locality }}</p>
      </div>
    </div>
  </address>
</template>

<script setup lang="ts">
const props = defineProps({
  address: {
    type: String,
    default: '',
  },
});

const [street = '', locality = ''] = props.address.split(',');
</script>
