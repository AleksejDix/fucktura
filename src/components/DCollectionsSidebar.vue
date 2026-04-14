<template>
  <aside class="bg-gray-50 border-r border-gray-200 text-[11px] text-gray-700 overflow-y-auto py-2 select-none">
    <nav class="space-y-0.5">
      <DCollectionItem v-for="v in smartViews" :key="v.id" :view="v" />
    </nav>

    <p class="mt-4 px-3 text-[10px] text-gray-400 uppercase tracking-wide">{{ $t('Types') }}</p>
    <nav class="mt-1 space-y-0.5">
      <DCollectionItem v-for="v in typeViews" :key="v.id" :view="v" />
    </nav>

    <template v-if="store.senders.length > 1">
      <p class="mt-4 px-3 text-[10px] text-gray-400 uppercase tracking-wide">{{ $t('Senders') }}</p>
      <nav class="mt-1 space-y-0.5">
        <DCollectionItem v-for="v in senderViews" :key="v.id" :view="v" />
      </nav>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ViewId } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import DCollectionItem from './DCollectionItem.vue';

const { t } = useI18n();
const store = useDocumentsStore();

interface ViewDef {
  id: ViewId;
  label: string;
  icon: string;
  danger?: boolean;
}

const smartViews = computed<ViewDef[]>(() => [
  { id: 'all', label: t('All documents'), icon: '📋' },
  { id: 'drafts', label: t('draft'), icon: '✏️' },
  { id: 'overdue', label: t('Overdue'), icon: '⏰', danger: true },
  { id: 'unpaid', label: t('Unpaid'), icon: '💰' },
]);

const typeViews = computed<ViewDef[]>(() => [
  { id: 'type:invoice', label: t('Rechnungen'), icon: '🧾' },
  { id: 'type:offerte', label: t('Offerten'), icon: '📝' },
  { id: 'type:mahnung', label: t('Mahnungen'), icon: '⚠️' },
  { id: 'type:quittung', label: t('Quittungen'), icon: '🪪' },
]);

const senderViews = computed<ViewDef[]>(() =>
  store.senders.map((s) => ({ id: `sender:${s.key}`, label: s.company, icon: '🏢' })),
);
</script>
