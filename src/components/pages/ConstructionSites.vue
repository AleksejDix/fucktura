<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2 contenteditable="false">{{ $t('Construction sites') }}</h2>
        <p contenteditable="false">{{ $t('List of all existing construction sites in the area') }}</p>
      </header>
      <div class="grid gap-y-4">
        <div>
          <image-with-placeholder
            class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm]"
            :src="imageSrc"
            alt="Map of List of all existing construction sites in the area"
          />
        </div>
        <DTable :columns="columns" :data="items">
          <template #col-id="{ id }">
            <CellId :id="id" />
          </template>
          <template #col-distance="{ distance }">
            <CellConstructionDistance :distance="distance" />
          </template>
          <template #col-address="{ address }">
            <CellAddress :address="address" />
          </template>
          <template #col-title="{ title }">
            <CellConstructionTitle :title="title" />
          </template>
          <template #col-status="{ status }">
            <CellConstractionStatus :status="status" />
          </template>
          <template #col-startDate="{ startDate }">
            <CellConstractionStartDate :date="startDate" />
          </template>
          <template #col-created="{ created }">
            <CellConstractionCreatedDate :date="created" />
          </template>
          <template #col-level="{ level }">
            <CellConstractionLevel :level="level" />
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
import PageTemplate from '../PageTemplate.vue';
import CellAddress from '../cells/CellAddress.vue';
import CellConstractionCreatedDate from '../cells/CellConstractionCreatedDate.vue';
import CellConstractionLevel from '../cells/CellConstractionLevel.vue';
import CellConstractionStartDate from '../cells/CellConstractionStartDate.vue';
import CellConstractionStatus from '../cells/CellConstractionStatus.vue';
import CellConstructionDistance from '../cells/CellConstructionDistance.vue';
import CellConstructionTitle from '../cells/CellConstructionTitle.vue';
import CellId from '../cells/CellId.vue';
import { useI18n } from 'vue-i18n';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
const { t } = useI18n();

const columns: Columns = {
  id: {
    text: '№',
    type: 'number',
  },
  distance: {
    text: t('Distance'),
    type: 'number',
  },
  address: t('Address'),
  title: t('Title'),
  level: {
    text: t('Level'),
    type: 'number',
  },
  status: t('Status'),
  created: {
    text: t('Created'),
    type: 'number',
  },
  startDate: {
    text: t('Start date'),
    type: 'number',
  },
};

const items = global.data?.constructionSites.map((site, i) => ({
  id: i + 1,
  distance: site.distance,
  address: site.address,
  title: site.title,
  status: site.status,
  level: site.levelCount,
  created: site.created,
  startDate: site.startDate,
}));

const imageSrc = 'https://placehold.co/718x297?text=Map';
</script>
