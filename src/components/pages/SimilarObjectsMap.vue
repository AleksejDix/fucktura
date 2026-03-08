<template>
  <PageTemplate v-if="global.data?.similarObjects.length" :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2 class="text-black" contenteditable="false">{{ $t('Similar objects') }}</h2>
        <p contenteditable="false">
          A selection of similar properties in terms of location, size and year of construction
        </p>
      </header>
      <div>
        <img
          class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm] pb-[5mm]"
          :src="imageSrc"
          alt=""
        />
        <DTable :columns="columns" :data="items">
          <template #head-livingArea>
            <span class="max-w-[80px]"
              >{{ (columns.livingArea as Column).text }}<var var-table-living-area></var
            ></span>
          </template>
          <template #col-id="{ id }">
            <CellId :id="id" />
          </template>
          <template #col-price="{ price }">
            <CellPrice class="max-w-[120px]" :price="price" />
          </template>
          <template #col-pricePerSquareMeter="{ pricePerSquareMeter }">
            <CellPricePerSquareMeter
              class="max-w-[120px]"
              :price-per-square-meter="pricePerSquareMeter"
            />
          </template>
          <template #col-livingArea="{ livingArea }">
            <CellLivingArea :living-area="livingArea" />
          </template>
          <template #col-address="{ address }">
            <CellAddress :address="address" />
          </template>
          <template #col-rooms="{ rooms }">
            <CellRooms :rooms="rooms" />
          </template>
          <template #col-listedDayCount="{ listedDayCount }">
            <CellMarketListedDayCount :listed-day-count="listedDayCount" />
          </template>
          <template #col-isActive="{ isActive }">
            <CellMarketStatus :is-active="isActive" />
          </template>
        </DTable>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/global';
import DTable from '../DTable.vue';
import type { Columns } from '../DTable.vue';
import type { Column } from '../DTableHeading.vue';
import PageTemplate from '../PageTemplate.vue';
import CellAddress from '../cells/CellAddress.vue';
import CellId from '../cells/CellId.vue';
import CellLivingArea from '../cells/CellLivingArea.vue';
import CellMarketListedDayCount from '../cells/CellMarketListedDayCount.vue';
import CellMarketStatus from '../cells/CellMarketStatus.vue';
import CellPrice from '../cells/CellPrice.vue';
import CellPricePerSquareMeter from '../cells/CellPricePerSquareMeter.vue';
import CellRooms from '../cells/CellRooms.vue';
import { useI18n } from 'vue-i18n';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
const { t } = useI18n();

const columns: Columns = {
  id: {
    text: '№',
  },
  address: {
    text: t('Address'),
  },
  livingArea: {
    text: t('Living space'),
    type: 'number',
  },
  rooms: {
    text: t('Rooms'),
    type: 'number',
  },
  pricePerSquareMeter: {
    text: t('Price / m2'),
    type: 'number',
  },
  price: {
    text: t('Price'),
    type: 'number',
  },
  listedDayCount: {
    text: t('Listed'),
    type: 'number',
  },
  isActive: {
    text: t('Ad status'),
    type: 'number',
  },
};

const items = (global.data?.similarObjects || []).map((object, i) => ({
  id: i + 1,
  address: object.address,
  livingArea: object.livingArea,
  rooms: object.rooms,
  pricePerSquareMeter: object.pricePerSqrMeter,
  price: object.price,
  listedDayCount: object.daysOnMarket,
  isActive: object.onMarket,
}));

const imageSrc = 'https://placehold.co/718x297?text=Map';
</script>
