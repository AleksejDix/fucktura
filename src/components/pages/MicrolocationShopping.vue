<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header v-if="ratingStore.rating.services !== undefined">
        <h2 class="flex justify-between">
          <span contenteditable="false"> Microlocation - Shopping </span>
          <RatingScore v-model:rating="ratingStore.rating.services"></RatingScore>
        </h2>
        <p contenteditable="false">Shopping, restaurants and other services.</p>
      </header>
      <div class="grid gap-y-4">
        <img
          class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm]"
          :src="imageSrc"
          alt=""
        />
        <microlocation-legends class="mb-[5mm]" />
        <div class="grid grid-cols-2 gap-y-8 gap-x-12">
          <DList v-for="item in items" :key="item.title" :title="item.title" :list="item.list">
            <template #list-category="{ category }">
              <span notranslate> {{ category }}</span>
            </template>
            <template #suffix>
              <MapPin :size="14" :style="{ color: '#' + item.color }" />
            </template>
          </DList>
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { MapPin } from 'lucide-vue-next';
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

const categoryConfig = [
  {
    listCategoryType: 12,
    color: '4169e1',
  },
  {
    listCategoryType: 14,
    color: 'F4CCCC',
  },
  {
    listCategoryType: 13,
    color: 'AEAEA3',
  },
];

const items = [
  {
    title: t('Shopping'),
    color: categoryConfig[0].color,
    list: global.data?.categories.Shopping.pois.map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('Restaurants & Cafés'),
    color: categoryConfig[1].color,
    list: global.data?.categories.Gastronomy.pois.map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('Services'),
    color: categoryConfig[2].color,
    list: global.data?.categories.Services.pois.map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
];

const imageSrc = 'https://placehold.co/718x297?text=Map';
</script>
