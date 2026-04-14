<template>
  <div
    class="w-[210mm] mx-auto py-8 px-[26mm] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] print:shadow-none my-4"
  >
    <p class="text-[14pt] font-bold text-gray-900 mb-6">{{ $t('Positions') }}</p>

    <div class="space-y-2">
      <div
        v-for="(pos, i) in positions"
        :key="pos.id"
        class="grid grid-cols-[1fr_120px_50px_60px_80px_24px] gap-2 items-end text-[9pt]"
      >
        <div>
          <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{
            $t('Description')
          }}</label>
          <input
            v-model="pos.description"
            @blur="save"
            class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 focus:outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{
            $t('Product code')
          }}</label>
          <input
            v-model="pos.code"
            @blur="save"
            class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 font-mono focus:outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{
            $t('Unit')
          }}</label>
          <input
            v-model="pos.unit"
            @blur="save"
            placeholder="h"
            class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 text-center focus:outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{
            $t('VAT %')
          }}</label>
          <input
            :value="pos.defaultVatRate ?? ''"
            :placeholder="$t('auto')"
            @blur="updateVat(pos, ($event.target as HTMLInputElement).value)"
            type="number"
            step="0.1"
            class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 font-mono text-right focus:outline-none focus:border-gray-900"
          />
        </div>
        <div>
          <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{
            $t('Default price')
          }}</label>
          <input
            :value="pos.defaultPrice"
            @blur="updatePrice(pos, ($event.target as HTMLInputElement).value)"
            type="number"
            step="0.01"
            class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 font-mono text-right focus:outline-none focus:border-gray-900"
          />
        </div>
        <button @click="deletePosition(pos.id)" class="text-gray-300 hover:text-red-500 pb-1.5">
          &times;
        </button>
      </div>
    </div>

    <button
      @click="addPosition"
      class="mt-6 px-4 py-2 text-[9pt] bg-black text-white hover:bg-gray-800 transition-colors"
    >
      + {{ $t('Add position') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { nanoid } from 'nanoid';
import type { Position } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { useConfirmStore } from '@/stores/confirm';

const documentsStore = useDocumentsStore();
const confirmStore = useConfirmStore();
const { t } = useI18n();
const positions = ref<Position[]>([]);

function reload() {
  positions.value = documentsStore.positions.map((p) => ({ ...p }));
}

onMounted(reload);

async function save() {
  await documentsStore.savePositions(JSON.parse(JSON.stringify(positions.value)));
}

async function addPosition() {
  positions.value.push({ id: nanoid(8), description: '', code: '', unit: 'h', defaultPrice: 0 });
  await save();
}

function updatePrice(pos: Position, value: string) {
  pos.defaultPrice = parseFloat(value) || 0;
  save();
}

function updateVat(pos: Position, value: string) {
  const trimmed = value.trim();
  if (trimmed === '') {
    delete pos.defaultVatRate;
  } else {
    pos.defaultVatRate = parseFloat(trimmed) || 0;
  }
  save();
}

async function deletePosition(id: string) {
  const target = positions.value.find((p) => p.id === id);
  const label = target?.description || id;
  const ok = await confirmStore.ask({
    message: t('Delete position confirm', { name: label }),
    confirmLabel: t('Delete'),
    destructive: true,
  });
  if (!ok) return;
  positions.value = positions.value.filter((p) => p.id !== id);
  await save();
}
</script>
