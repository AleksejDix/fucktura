<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2 contenteditable="false">Microlocation - Public transportation - Education</h2>
        <p contenteditable="false">Distance to schools, shops, restaurants, bus stops and more</p>
      </header>
      <div class="grid gap-y-8 gap-x-12">
        <div>
          <DList class="w-full" :title="$t('Schools')" :list="schoolData" />
        </div>
        <div>
          <DList class="w-full" :title="$t('Connections')" :list="transportData" />
        </div>
        <div>
          <DList class="w-full" :title="$t('Shopping')" :list="shoppingData" />
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { formatDistance } from '@/formatters/number';
import { useGlobalStore } from '@/stores/global';
import DList from '../DList.vue';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const { t } = useI18n();
const global = useGlobalStore();

const schoolData = ref([
  {
    category: t('Daycare'),
    value: formatDistance(global.data?.categories.Daycare?.pois[0].distance),
  },
  {
    category: t('Kindergarten'),
    value: formatDistance(global.data?.categories.Kindergarten?.pois[0].distance),
  },
  {
    category: t('Primary school'),
    value: formatDistance(global.data?.categories.PrimarySchool?.pois[0].distance),
  },
  {
    category: t('Secondary school'),
    value: formatDistance(global.data?.categories.SecondarySchool?.pois[0].distance),
  },
  {
    category: t('High school'),
    value: formatDistance(global.data?.categories.HighSchool?.pois[0].distance),
  },
]);

const transportData = ref([
  {
    category: t('Bus / tram stop'),
    value: formatDistance(global.data?.categories.BusTramStop?.pois[0].distance),
  },
  {
    category: t('Train station'),
    value: formatDistance(global.data?.categories.TrainStation?.pois[0].distance),
  },
  {
    category: t('Freeway'),
    value: formatDistance(global.data?.categories.MotorwayAccess?.pois[0].distance),
  },
  {
    category: t('Regional Airport'),
    value: formatDistance(global.data?.categories.RegionalAirport?.pois[0].distance),
  },
  {
    category: t('International Airport'),
    value: formatDistance(global.data?.categories.NationalAirport?.pois[0].distance),
  },
]);

const shoppingData = ref([
  {
    category: t('Shopping'),
    value: formatDistance(global.data?.categories.Shopping?.pois[0].distance),
  },
  {
    category: t('Service Shops'),
    value: formatDistance(global.data?.categories.Services?.pois[0].distance),
  },
  {
    category: t('Restaurant / Coffee'),
    value: formatDistance(global.data?.categories.Gastronomy?.pois[0].distance),
  },
]);
</script>
