<template>
  <section class="grid gap-y-8">
    <slot></slot>
    <ul class="grid grid-cols-2 gap-x-12 gap-y-8 relative">
      <li v-for="image in images" :key="image.id">
        <GalleryImage :image="image" />
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import { useGalleryStore } from '@/stores/gallery';
import GalleryImage from '@/components/GalleryImage.vue';

const props = defineProps({
  galleryPageIndex: {
    type: Number,
    default: 0,
  },
});

const gallery = useGalleryStore();

const images = computed(() => {
  return gallery.images.slice(
    props.galleryPageIndex * gallery.imagesPerPage,
    (props.galleryPageIndex + 1) * gallery.imagesPerPage,
  );
});
</script>

<style scoped>
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0);
  transition: all 0.5s ease-in;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
</style>
