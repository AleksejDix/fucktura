<template>
  <PageTemplate
    :page-index="pageIndex"
    class="mb-[20mm]"
    :data-testid="`${$options.__name}-${pageIndex}`"
  >
    <template v-if="modeStore.isEditMode" #side-controls>
      <div class="flex items-center print:hidden z-10 absolute right-[-16px] top-[24px]">
        <button
          type="button"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-[11px] rounded-sm"
          @click="addImage"
        >
          <Plus :size="16" />
        </button>
      </div>
    </template>
    <GalleryBundle :gallery-page-index="galleryPageIndex">
      <header v-if="galleryPageIndex === 0">
        <h2 class="text-black" contenteditable="false">{{ $t('More pictures') }}</h2>
        <p contenteditable="false">{{ $t('Here you can see different photos of the property') }}</p>
      </header>
    </GalleryBundle>
  </PageTemplate>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import { useGalleryStore } from '@/stores/gallery';
import { useModeStore } from '@/stores/mode';
import GalleryBundle from '@/components/GalleryBundle.vue';
import { useFileDialog } from '@vueuse/core';
import PageTemplate from '../PageTemplate.vue';

defineProps({
  pageIndex: { type: Number, default: 0 },
  galleryPageIndex: { type: Number, default: 0 },
});

const modeStore = useModeStore();
const galleryStore = useGalleryStore();
const { files, open, reset } = useFileDialog();

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

watch(
  () => files.value,
  async () => {
    if (files.value && files.value[0] !== null) {
      const image = await fileToBase64(files.value[0]);
      galleryStore.addImage(image);
    }
  },
);

function addImage() {
  reset();
  open();
}
</script>
