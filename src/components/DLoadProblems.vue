<template>
  <aside
    v-if="store.loadProblems.length > 0 && !store.loadProblemsDismissed"
    class="fixed top-10 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-amber-50 border border-amber-300 shadow-lg text-[11px] text-amber-900 print:hidden"
    role="alert"
  >
    <div class="flex items-start justify-between gap-2 px-3 py-2">
      <p class="font-medium">
        {{ $t('Unreadable files', { count: store.loadProblems.length }) }}
      </p>
      <button
        type="button"
        @click="store.loadProblemsDismissed = true"
        class="shrink-0 underline text-amber-700 hover:text-amber-950"
      >
        {{ $t('Dismiss') }}
      </button>
    </div>
    <ul class="border-t border-amber-200 px-3 py-2 space-y-1 max-h-48 overflow-y-auto">
      <li
        v-for="p in store.loadProblems"
        :key="p.file + p.reason"
        class="flex justify-between gap-2"
      >
        <span class="font-mono truncate">{{ p.file }}</span>
        <span class="shrink-0 text-amber-700">
          {{ p.reason === 'unparseable' ? $t('Invalid JSON') : $t('Unexpected shape') }}
        </span>
      </li>
    </ul>
    <p class="border-t border-amber-200 px-3 py-2 text-amber-700">
      {{ $t('Unreadable files hint') }}
    </p>
  </aside>
</template>

<script setup lang="ts">
import { useDocumentsStore } from '@/stores/documents';

const store = useDocumentsStore();
</script>
