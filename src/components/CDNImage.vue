<template>
  <image-with-placeholder
    @click="toggleObjectFit"
    :src="getImageSrc(src, size)"
    :decoding="decoding"
    :alt="alt"
    class="block h-full w-full border bg-gray-100"
    :class="[coverTypes[0], cursor[0]]"
  />
</template>

<script setup lang="ts">
import { BunnyCDNImageSize, imageSizes } from '@/lib/images';

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
    type: String as PropType<string | BunnyCDNImageSize>,
    default: imageSizes.SMALL,
  },
  alt: {
    type: String,
    default: '',
  },
});

const coverTypes = ref(['object-cover', 'object-contain']);
const cursor = ref(['cursor-zoom-in', 'cursor-zoom-out']);

function isValidHttpUrl(url: string) {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function toggleObjectFit() {
  coverTypes.value = coverTypes.value.reverse();
  cursor.value = cursor.value.reverse();
}

function isValidDataUrl(url: string) {
  return (url || '').startsWith('data:');
}

const getImageSrc = (src: string, size: BunnyCDNImageSize | string) => {
  if (isValidHttpUrl(src)) {
    return size === imageSizes.SMALL
      ? `${src}?optimizer=image&class=${imageSizes.LARGE}`
      : `${src}?optimizer=image&class=${imageSizes.EXTRA_LARGE}`;
  } else if (isValidDataUrl(src)) {
    return src;
  } else {
    return null;
  }
};
</script>
