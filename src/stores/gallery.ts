import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useGlobalStore } from './global';
import { useModeStore } from './mode';
import { usePagesStore } from './pages';

export const useGalleryStore = defineStore('gallery', () => {
  const global = useGlobalStore();
  const pagesStore = usePagesStore();
  const modeStore = useModeStore();

  const imagesPerPage = ref(6);

  const images = ref(
    [...(global.data?.images.gallery || [])]
      // we need to add unique id to all images
      .map((image) => ({
        ...image,
        id: crypto.randomUUID(),
      }))
      // remove images with same src
      .filter(
        (galleryImage, index, a) =>
          a.findIndex(
            (galleryImageToCompare) => galleryImageToCompare.image === galleryImage.image,
          ) === index,
      ),
  );

  const visible = computed(() => images.value.length > 0);

  function removeImage(image: any) {
    const index = images.value.findIndex((i) => i === image);
    images.value.splice(index, 1);
    pagesStore.updateListOfPages();
  }

  function addImage(image: string) {
    images.value.push({
      id: crypto.randomUUID(),
      category: 'Custom',
      classification: 'Custom',
      image,
    });
    pagesStore.updateListOfPages();
  }

  watch(
    () => modeStore.mode,
    () => pagesStore.updateListOfPages(),
  );

  return {
    images,
    visible,
    imagesPerPage,
    removeImage,
    addImage,
  };
});
