<template>
  <div class="border border-gray-300 p-4">
    <div class="flex items-start justify-between mb-3">
      <p class="text-[10pt] font-bold text-gray-900">
        {{ client.company || client.name || $t('New client') }}
      </p>
      <button @click="deleteClient" class="text-gray-300 hover:text-red-500 text-[9pt]">
        &times;
      </button>
    </div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-[9pt]">
      <DField
        :model-value="client.customerNumber"
        variant="box"
        mono
        readonly
        class="col-span-2"
        :label="$t('Client number')"
      />
      <DField
        v-model="client.company"
        variant="box"
        class="col-span-2"
        :label="$t('Company name')"
        @save="save"
      />
      <DField
        v-model="client.name"
        variant="box"
        class="col-span-2"
        :label="$t('Name')"
        @save="save"
      />
      <DField
        v-model="client.street"
        variant="box"
        class="col-span-2"
        :label="$t('Street')"
        @save="save"
      />
      <DField v-model="client.zip" variant="box" mono :label="$t('ZIP')" @save="save" />
      <DField v-model="client.city" variant="box" :label="$t('City')" @save="save" />
      <DField
        v-model="client.country"
        variant="box"
        class="col-span-2"
        :label="$t('Country')"
        @save="save"
      />
      <DField
        v-model="client.email"
        variant="box"
        class="col-span-2"
        :label="$t('Email')"
        @save="save"
      />
      <DField
        v-model="client.uid"
        variant="box"
        mono
        class="col-span-2"
        :label="$t('UID')"
        placeholder="CHE-123.456.789"
        @save="save"
      />
    </div>

    <div class="mt-4 border-t border-gray-200 pt-4">
      <p class="text-[9pt] font-bold text-gray-900 mb-2">{{ $t('Positions') }}</p>
      <div class="space-y-2">
        <div
          v-for="(cp, i) in client.positions ?? []"
          :key="i"
          class="grid grid-cols-[1fr_80px_24px] gap-2 items-end text-[9pt]"
        >
          <div>
            <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{
              $t('Position')
            }}</label>
            <div class="border border-gray-300 px-2 py-1 text-gray-900">
              {{ positionLabel(cp.positionId) }}
            </div>
          </div>
          <DField
            :model-value="cp.price"
            variant="box"
            mono
            align="right"
            type="number"
            step="0.01"
            :label="i === 0 ? $t('Price') : undefined"
            @save="(v) => updatePositionPrice(i, v)"
          />
          <button @click="removePosition(i)" class="text-gray-300 hover:text-red-500 pb-1">
            &times;
          </button>
        </div>
      </div>
      <div class="relative mt-2">
        <button @click="pickerOpen = !pickerOpen" class="text-[8pt] text-gray-400 hover:text-black">
          + {{ $t('Add position') }}
        </button>
        <ul
          v-if="pickerOpen"
          class="absolute left-0 top-full mt-1 w-80 bg-white border border-gray-300 shadow-lg z-20 max-h-48 overflow-y-auto"
        >
          <li
            v-for="pos in availablePositions"
            :key="pos.id"
            @click="assignPosition(pos)"
            class="px-3 py-2 text-[9pt] cursor-pointer hover:bg-gray-100 border-b border-gray-50 last:border-0 flex justify-between"
          >
            <span
              >{{ pos.description }}
              <span v-if="pos.code" class="text-gray-400">{{ pos.code }}</span></span
            >
            <span class="text-gray-400 font-mono">{{ pos.defaultPrice.toFixed(2) }}</span>
          </li>
          <li
            v-if="availablePositions.length === 0"
            class="px-3 py-2 text-[9pt] text-gray-400 italic"
          >
            {{ $t('All positions assigned') }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Client, Position } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { useConfirmStore } from '@/stores/confirm';
import DField from './DField.vue';

const props = defineProps<{ client: Client }>();

const documentsStore = useDocumentsStore();
const confirmStore = useConfirmStore();
const { t } = useI18n();

const allPositions = computed<Position[]>(() => documentsStore.positions);
const pickerOpen = ref(false);

onMounted(() => document.addEventListener('click', onClickOutside, true));
onUnmounted(() => document.removeEventListener('click', onClickOutside, true));

function onClickOutside(e: MouseEvent) {
  if (pickerOpen.value && !(e.target as Element).closest('.relative')) {
    pickerOpen.value = false;
  }
}

function positionLabel(positionId: string): string {
  const pos = allPositions.value.find((p) => p.id === positionId);
  if (!pos) return '—';
  return pos.code ? `${pos.description} (${pos.code})` : pos.description;
}

const availablePositions = computed<Position[]>(() => {
  const assigned = new Set((props.client.positions ?? []).map((cp) => cp.positionId));
  return allPositions.value.filter((p) => !assigned.has(p.id));
});

function assignPosition(pos: Position) {
  if (!props.client.positions) props.client.positions = [];
  props.client.positions.push({ positionId: pos.id, price: pos.defaultPrice });
  pickerOpen.value = false;
  save();
}

function removePosition(index: number) {
  props.client.positions?.splice(index, 1);
  save();
}

function updatePositionPrice(index: number, value: string) {
  if (!props.client.positions) return;
  props.client.positions[index].price = parseFloat(value) || 0;
  save();
}

async function save() {
  if (!props.client.customerNumber) return;
  await documentsStore.saveClient(JSON.parse(JSON.stringify(props.client)) as Client);
}

async function deleteClient() {
  const label = props.client.company || props.client.name || props.client.customerNumber;
  const ok = await confirmStore.ask({
    message: t('Delete client confirm', { name: label }),
    confirmLabel: t('Delete'),
    destructive: true,
  });
  if (ok) await documentsStore.removeClient(props.client.customerNumber);
}
</script>
