<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] bg-black/30 flex items-start justify-center pt-[15vh]"
      @click.self="close"
    >
      <div
        class="w-[560px] max-w-[90vw] bg-white shadow-2xl border border-gray-200 rounded-sm overflow-hidden"
      >
        <input
          ref="inputEl"
          v-model="query"
          :placeholder="$t('Find document…')"
          class="w-full px-4 py-3 text-[12pt] border-b border-gray-200 focus:outline-none"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="choose"
          @keydown.esc.prevent="close"
        />
        <ul class="max-h-[50vh] overflow-y-auto">
          <li
            v-for="(doc, i) in filtered"
            :key="doc.number"
            @click="pick(doc.number)"
            @mouseenter="active = i"
            class="px-4 py-2 text-[10pt] cursor-pointer flex items-baseline justify-between gap-3"
            :class="i === active ? 'bg-gray-900 text-white' : 'hover:bg-gray-50'"
          >
            <span class="flex items-baseline gap-2 min-w-0">
              <span class="shrink-0 w-1.5 h-1.5 inline-block" :class="dotClass[doc.type]" />
              <span
                class="font-mono text-[9pt] shrink-0"
                :class="i === active ? 'text-gray-400' : 'text-gray-500'"
                >{{ doc.number }}</span
              >
              <span class="truncate">{{
                doc.recipient.company || doc.recipient.name || $t('No client')
              }}</span>
            </span>
            <span
              class="shrink-0 text-[9pt]"
              :class="i === active ? 'text-gray-400' : 'text-gray-400'"
              >{{ doc.subtitle || '—' }}</span
            >
          </li>
          <li
            v-if="filtered.length === 0"
            class="px-4 py-6 text-[10pt] text-gray-400 italic text-center"
          >
            {{ $t('No documents') }}
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { DOC_TYPE_DOT_CLASS as dotClass } from '@/lib/documents';
import { documentHaystack } from '@/lib/search';
import { useDocumentsStore } from '@/stores/documents';

const store = useDocumentsStore();
const open = defineModel<boolean>('open', { default: false });
const query = ref('');
const active = ref(0);
const inputEl = ref<HTMLInputElement | null>(null);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  const docs = store.documents;
  if (!q) return docs.slice(0, 20);
  return docs.filter((d) => documentHaystack(d).includes(q)).slice(0, 50);
});

watch(open, async (v) => {
  if (v) {
    query.value = '';
    active.value = 0;
    await nextTick();
    inputEl.value?.focus();
  }
});

function move(delta: number) {
  const n = filtered.value.length;
  if (n === 0) return;
  active.value = (active.value + delta + n) % n;
}

function choose() {
  const doc = filtered.value[active.value];
  if (doc) pick(doc.number);
}

function pick(number: string) {
  store.setActive(number);
  close();
}

function close() {
  open.value = false;
}
</script>
