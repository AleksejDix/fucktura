<template>
  <image-with-placeholder
    @click="toggleObjectFit"
    :src="src"
    :decoding="decoding"
    :alt="alt"
    class="block h-full w-full border bg-gray-100"
    :class="[coverTypes[0], cursor[0]]"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineEmits(['zoomin']);

defineProps({
  decoding: {
    type: String,
    default: 'eager',
  },
  src: {
    type: String,
    required: false,
    default: null,
  },
  size: {
    type: String,
    default: 'sm',
  },
  alt: {
    type: String,
    default: '',
  },
});

const coverTypes = ref(['object-cover', 'object-contain']);
const cursor = ref(['cursor-zoom-in', 'cursor-zoom-out']);

function toggleObjectFit() {
  coverTypes.value = coverTypes.value.reverse();
  cursor.value = cursor.value.reverse();
}
</script>
