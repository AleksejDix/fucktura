<template>
  <DSheet :title="$t('Positions')">
    <div class="space-y-2">
      <div
        v-for="(pos, i) in positions"
        :key="pos.id"
        class="grid grid-cols-[1fr_120px_50px_60px_80px_24px] gap-2 items-end text-[9pt]"
      >
        <DField
          v-model="pos.description"
          variant="box"
          :label="i === 0 ? $t('Description') : undefined"
          @save="save"
        />
        <DField
          v-model="pos.code"
          variant="box"
          mono
          :label="i === 0 ? $t('Product code') : undefined"
          @save="save"
        />
        <DField
          v-model="pos.unit"
          variant="box"
          align="center"
          placeholder="h"
          :label="i === 0 ? $t('Unit') : undefined"
          @save="save"
        />
        <DField
          :model-value="pos.defaultVatRate ?? ''"
          variant="box"
          mono
          align="right"
          type="number"
          step="0.1"
          :placeholder="$t('auto')"
          :label="i === 0 ? $t('VAT %') : undefined"
          @save="(v) => updateVat(pos, v)"
        />
        <DField
          :model-value="pos.defaultPrice"
          variant="box"
          mono
          align="right"
          type="number"
          step="0.01"
          :label="i === 0 ? $t('Default price') : undefined"
          @save="(v) => updatePrice(pos, v)"
        />
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
  </DSheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { nanoid } from 'nanoid';
import type { Position } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { useConfirmStore } from '@/stores/confirm';
import DSheet from '@/components/DSheet.vue';
import DField from '@/components/DField.vue';

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
