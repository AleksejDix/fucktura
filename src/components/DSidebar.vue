<template>
  <aside class="bg-white border-r border-gray-200 flex flex-col overflow-hidden">
    <header class="border-b border-gray-200 px-3 py-2 space-y-2">
      <input
        v-model="store.quickSearch"
        type="search"
        :placeholder="$t('Quick search')"
        class="w-full text-[11px] px-2 py-1 bg-gray-100 border border-gray-200 focus:outline-none focus:border-gray-400 focus:bg-white"
      />
      <div v-if="store.statusPillsForView.length > 0" class="flex flex-wrap gap-1">
        <button
          type="button"
          @click="store.activeStatusPill = null"
          class="text-[10px] px-2 py-0.5 rounded-sm transition-colors"
          :class="
            !store.activeStatusPill
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          {{ $t('Any status') }}
        </button>
        <button
          v-for="s in store.statusPillsForView"
          :key="s"
          type="button"
          @click="store.activeStatusPill = s"
          class="text-[10px] px-2 py-0.5 rounded-sm transition-colors"
          :class="
            store.activeStatusPill === s
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
        >
          {{ $t(s) }}
        </button>
      </div>
    </header>
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="doc in store.filteredDocuments"
        :key="doc.number"
        @click="store.setActive(doc.number === store.activeDocumentNumber ? null : doc.number)"
        class="px-3 py-2.5 cursor-pointer border-b border-gray-100 transition-colors"
        :class="
          doc.number === store.activeDocumentNumber ? 'bg-black text-white' : 'hover:bg-gray-50'
        "
      >
        <div class="flex items-baseline justify-between text-[12px]">
          <span
            class="flex items-center gap-1.5 font-medium truncate"
            :class="
              doc.number === store.activeDocumentNumber
                ? 'text-white'
                : store.isOverdue(doc)
                  ? 'text-red-600'
                  : 'text-gray-900'
            "
          >
            <span
              class="shrink-0 w-1.5 h-1.5 inline-block"
              :class="
                doc.number === store.activeDocumentNumber
                  ? 'bg-white'
                  : store.isOverdue(doc)
                    ? 'bg-red-500'
                    : dotClass[doc.type]
              "
            />
            {{ doc.recipient.company || doc.recipient.name || $t('No client') }}
          </span>
          <span
            class="shrink-0 ml-2 text-[11px]"
            :class="
              doc.number === store.activeDocumentNumber
                ? 'text-gray-400'
                : store.isOverdue(doc)
                  ? 'text-red-400'
                  : 'text-gray-400'
            "
            >{{ formatDate(dueDateField(doc) || doc.meta.date) }}</span
          >
        </div>
        <div
          class="text-[11px] truncate mt-0.5 pl-[12px]"
          :class="doc.number === store.activeDocumentNumber ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ doc.number }} · {{ doc.subtitle || '—' }}
        </div>
      </div>

      <p
        v-if="store.filteredDocuments.length === 0"
        class="px-3 py-8 text-xs text-gray-300 text-center"
      >
        {{ $t('No documents') }}
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Document } from '@/fs/types';
import { DOC_TYPE_DOT_CLASS as dotClass } from '@/lib/documents';
import { useDocumentsStore } from '@/stores/documents';
import { useDate } from '@/composables/useDate';

const store = useDocumentsStore();
const { formatDate } = useDate();

function dueDateField(doc: Document): string | null {
  if (doc.type === 'invoice') return doc.meta.dueDate ?? null;
  if (doc.type === 'offerte') return doc.meta.validUntil ?? null;
  if (doc.type === 'mahnung') return doc.meta.overdueSince ?? null;
  return null;
}
</script>
