<template>
  <aside class="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="doc in sortedDocuments"
        :key="doc.number"
        @click="store.setActive(doc.number === store.activeDocumentNumber ? null : doc.number)"
        class="px-3 py-2.5 cursor-pointer border-b border-gray-100 transition-colors"
        :class="doc.number === store.activeDocumentNumber ? 'bg-black text-white' : 'hover:bg-gray-50'"
      >
        <div class="flex items-baseline justify-between text-[12px]">
          <span class="flex items-center gap-1.5 font-medium truncate" :class="doc.number === store.activeDocumentNumber ? 'text-white' : isOverdue(doc) ? 'text-red-600' : 'text-gray-900'">
            <span class="shrink-0 w-1.5 h-1.5 inline-block" :class="doc.number === store.activeDocumentNumber ? 'bg-white' : isOverdue(doc) ? 'bg-red-500' : dotClass[doc.type]" />
            {{ doc.recipient.company || doc.recipient.name || $t('No client') }}
          </span>
          <span class="shrink-0 ml-2 text-[11px]" :class="doc.number === store.activeDocumentNumber ? 'text-gray-400' : isOverdue(doc) ? 'text-red-400' : 'text-gray-400'">{{ formatDate(dueDateField(doc) || doc.meta.date) }}</span>
        </div>
        <div class="text-[11px] truncate mt-0.5 pl-[12px]" :class="doc.number === store.activeDocumentNumber ? 'text-gray-400' : 'text-gray-500'">{{ doc.number }} · {{ doc.subtitle || '—' }}</div>
      </div>

      <p v-if="store.documents.length === 0" class="px-3 py-8 text-xs text-gray-300 text-center">
        {{ $t('No documents') }}
      </p>
    </div>

  </aside>
</template>

<script setup lang="ts">
import type { Document } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { useDate } from '@/composables/useDate';
import { computed } from 'vue';

const store = useDocumentsStore();
const { formatDate } = useDate();

const sortedDocuments = computed(() =>
  [...store.documents].sort((a, b) => {
    const da = new Date(a.meta.date).getTime();
    const db = new Date(b.meta.date).getTime();
    return db - da;
  }),
);

const dotClass: Record<string, string> = {
  offerte: 'bg-amber-500',
  invoice: 'bg-emerald-500',
  mahnung: 'bg-red-500',
  quittung: 'bg-blue-500',
};

function dueDateField(doc: Document): string | null {
  if (doc.type === 'invoice') return doc.meta.dueDate ?? null;
  if (doc.type === 'offerte') return doc.meta.validUntil ?? null;
  if (doc.type === 'mahnung') return doc.meta.overdueSince ?? null;
  return null;
}

function isOverdue(doc: Document): boolean {
  if (doc.type === 'invoice' && doc.status === 'paid') return false;
  if (doc.type === 'offerte' && (doc.status === 'accepted' || doc.status === 'rejected')) return false;
  const due = dueDateField(doc);
  if (!due) return false;
  const d = new Date(due);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}
</script>
