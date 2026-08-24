<template>
  <div class="pt-[var(--norm-addr-offset)]">
    <div class="w-[var(--norm-addr-w)]">
      <DClientPicker
        :doc-number="doc.number"
        :has-client="!!recipient.company || !!recipient.name"
      />
      <address
        v-if="recipient.company || recipient.name"
        class="not-italic text-[9pt] leading-relaxed"
      >
        <DInline
          v-model="recipient.company"
          tag="div"
          @update:model-value="(v) => update({ 'recipient.company': v })"
        />
        <DInline
          v-model="recipient.name"
          tag="div"
          @update:model-value="(v) => update({ 'recipient.name': v })"
        />
        <DInline
          v-model="recipient.street"
          tag="div"
          @update:model-value="(v) => update({ 'recipient.street': v })"
        />
        <div>
          <DInline
            v-model="recipient.zip"
            tag="span"
            class="font-mono"
            @update:model-value="(v) => update({ 'recipient.zip': v })"
          />
          {{ ' ' }}
          <DInline
            v-model="recipient.city"
            tag="span"
            @update:model-value="(v) => update({ 'recipient.city': v })"
          />
        </div>
        <DInline
          v-if="recipient.country"
          v-model="recipient.country"
          tag="div"
          @update:model-value="(v) => update({ 'recipient.country': v })"
        />
        <DInline
          v-if="recipient.uid"
          v-model="recipient.uid"
          tag="div"
          class="text-gray-500 font-mono"
          @update:model-value="(v) => update({ 'recipient.uid': v })"
        />
      </address>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Document, DocumentPatch } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import DClientPicker from './DClientPicker.vue';
import DInline from './DInline.vue';

const props = defineProps<{ doc: Document }>();

const store = useDocumentsStore();
const recipient = computed(() => props.doc.recipient);

function update(changes: DocumentPatch) {
  if (!props.doc.number) return;
  store.updateDocument(props.doc.number, changes);
}
</script>
