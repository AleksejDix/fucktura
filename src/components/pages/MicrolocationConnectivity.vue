<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header v-if="ratingStore.rating.connectivity !== undefined">
        <h2 class="flex justify-between">
          <span contenteditable="false"> Microlocation - Connectivity </span>
          <RatingScore v-model:rating="ratingStore.rating.connectivity"></RatingScore>
        </h2>
        <p contenteditable="false">Train and bus stations, motorway entrances and airports</p>
      </header>
      <div class="grid gap-y-4">
        <image-with-placeholder
          class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm]"
          :src="imageSrc"
          alt="Map with Microlocation - Connectivity"
        />
        <microlocation-legends class="mb-[5mm]" />
        <div class="grid grid-cols-2 gap-y-8 gap-x-12">
          <DList v-for="item in items" :key="item.title" :title="item.title" :list="item.list">
            <template #list-category="{ category }">
              <span notranslate> {{ category }}</span>
            </template>
            <template #suffix>
              <i class="fa-solid fa-location-pin" :style="{ color: '#' + item.color }" />
            </template>
          </DList>
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { formatDistance } from '@/formatters/number';
import { useGlobalStore } from '@/stores/global';
import { useRatingStore } from '@/stores/rating';
import RatingScore from '@/components/RatingScore.vue';
import DList from '../DList.vue';
import MicrolocationLegends from '../MicrolocationLegends.vue';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const { t } = useI18n();
const global = useGlobalStore();
const ratingStore = useRatingStore();

const CATEGORY_CONFIG = [
  {
    listCategoryType: 2,
    color: '4169e1',
  },
  {
    listCategoryType: 1,
    color: 'F4CCCC',
  },
  {
    listCategoryType: 5,
    color: 'AEAEA3',
  },
];

const items = [
  {
    title: t('Bus/Tram'),
    color: CATEGORY_CONFIG[0].color,
    list: global.data?.categories.BusTramStop.pois.map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('Train'),
    color: CATEGORY_CONFIG[1].color,
    list: global.data?.categories.TrainStation.pois.map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('Freeway'),
    color: CATEGORY_CONFIG[2].color,
    list: global.data?.categories.MotorwayAccess.pois.map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
];

const imageSrc = 'https://placehold.co/718x297?text=Map';
</script>
