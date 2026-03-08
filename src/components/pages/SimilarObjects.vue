<template>
  <PageTemplate v-if="global.data?.similarObjects.length" :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2 contenteditable="false">{{ $t('Similar objects') }}</h2>
        <p contenteditable="false">{{ $t('Other homes with comparable properties') }}</p>
      </header>
      <div class="grid overflow-hidden grid-cols-2 gap-x-8 gap-y-12">
        <template
          v-for="(similarObject, key) in global.data.similarObjects!.slice(0, 3)"
          :key="key"
        >
          <div class="aspect-video relative">
            <div class="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">{{ similarObject.address }}</div>
            <div class="absolute h-8 w-8 bg-secondary flex items-center justify-center">
              <p class="text-white">{{ key + 1 }}</p>
            </div>
          </div>
          <div>
            <div>
              <div class="text-primary font-bold pb-2">
                {{ similarObject.address }}
              </div>
              <DTable
                variant="horizontal"
                :columns="columns"
                class="w-full mb-4"
                :data="buildingInfo(similarObject)"
              >
                <template #col-price="{ price }">
                  <CellPrice :price="price" />
                </template>
                <template #col-pricePerSquareMeter="{ pricePerSquareMeter }">
                  <CellPricePerSquareMeter :price-per-square-meter="pricePerSquareMeter" />
                </template>

                <template #col-livingArea="{ livingArea }">
                  <CellLivingArea :living-area="livingArea" />
                </template>
                <template #col-address="{ address }">
                  <CellAddress :address="address" />
                </template>
                <template #col-listedDayCount="{ listedDayCount }">
                  <CellMarketListedDayCount :listed-day-count="listedDayCount" />
                </template>
                <template #col-isActive="{ isActive }">
                  <CellMarketStatus :is-active="isActive" />
                </template>
              </DTable>
            </div>
          </div>
        </template>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import type { SimilarObject } from '@/api/dossiers';
import { useGlobalStore } from '@/stores/global';
import DTable from '../DTable.vue';
import type { Columns } from '../DTable.vue';
import PageTemplate from '../PageTemplate.vue';
import CellAddress from '../cells/CellAddress.vue';
import CellLivingArea from '../cells/CellLivingArea.vue';
import CellMarketListedDayCount from '../cells/CellMarketListedDayCount.vue';
import CellMarketStatus from '../cells/CellMarketStatus.vue';
import CellPrice from '../cells/CellPrice.vue';
import CellPricePerSquareMeter from '../cells/CellPricePerSquareMeter.vue';
import { useI18n } from 'vue-i18n';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
const { t } = useI18n();

const columns: Columns = {
  livingArea: t('Living area'),
  price: t('Price'),
  pricePerSquareMeter: t('Price / m2'),
  listedDayCount: t('Listed'),
  isActive: t('Ad status'),
};

function buildingInfo(similarObject: SimilarObject) {
  return [
    {
      livingArea: similarObject.livingArea,
      price: similarObject.price,
      pricePerSquareMeter: similarObject.pricePerSqrMeter,
      listedDayCount: similarObject.daysOnMarket,
      isActive: similarObject.onMarket,
    },
  ];
}
</script>
