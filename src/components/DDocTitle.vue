<template>
  <div class="pt-[12mm]">
    <div class="flex justify-between items-baseline">
      <h2 class="text-[14pt] font-bold">
        <slot>{{ title }}</slot>
      </h2>
      <span class="text-[14pt] font-bold">{{ doc.number }}</span>
    </div>
    <DInline
      v-model="doc.subtitle"
      tag="p"
      class="font-bold text-[9pt]"
      @update:model-value="(v) => update({ subtitle: v })"
    />
  </div>
</template>

<script setup lang="ts">
import type { Document, DocumentPatch } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import DInline from './DInline.vue';

const props = defineProps<{ doc: Document; title?: string }>();

const store = useDocumentsStore();

function update(changes: DocumentPatch) {
  if (!props.doc.number) return;
  store.updateDocument(props.doc.number, changes);
}
</script>
