<template>
  <figure class="grid gap-y-2 relative">
    <div class="aspect-[3/2] relative">
      <CDNImage class="absolute inset-0" :src="image.image" />
    </div>
    <figcaption class="w-full flex justify-between" data-localize="auto-approve">
      <span :contenteditable="modeStore.isEditMode">
        {{ translatedCategory(image.category) }}
      </span>
      <button
        type="button"
        class="print:hidden hover:bg-red-100 focus:bg-red-100 focus:outline outline-offset-2 outline-red-400 transition rounded inline-flex items-center gap-1 leading-snug px-1 font-medium text-xs border bg-red-50 border-red-300 text-red-600"
        v-if="modeStore.isEditMode"
        @click="galleryStore.removeImage(image)"
      >
        <Trash2 :size="12" />
        <span> remove </span>
      </button>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { GalleryItem } from '@/api/dossiers';
import { Trash2 } from 'lucide-vue-next';
import { useI18N } from '@/composables/localization';
import { useGalleryStore } from '@/stores/gallery';
import { useModeStore } from '@/stores/mode';
import type { PropType } from 'vue';
import CDNImage from '@/components/CDNImage.vue';

defineProps({
  image: {
    type: Object as PropType<GalleryItem>,
    required: true,
  },
});

const { translate } = useI18N();
const modeStore = useModeStore();
const galleryStore = useGalleryStore();

const translatedCategory = (text: any) => translate(text);
</script>
