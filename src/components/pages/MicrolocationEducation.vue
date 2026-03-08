<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header v-if="ratingStore.rating.education !== undefined">
        <h2 class="flex items-center justify-between">
          <span contenteditable="false"> Microlocation - Education </span>

          <RatingScore v-model:rating="ratingStore.rating.education"></RatingScore>
        </h2>
        <p contenteditable="false" class="max-w-xl">
          Day care centers, kindergartens, elementary, secondary and secondary schools as well as
          universities/colleges
        </p>
      </header>
      <div class="grid gap-y-4">
        <image-with-placeholder
          class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm]"
          :src="imageSrc"
          alt="Map with Microlocation - Education"
        />
        <microlocation-legends class="mb-[5mm]" />
        <div class="grid grid-cols-2 gap-y-8 gap-x-12">
          <DList v-for="item in items" :title="item.title" :key="item.title" :list="item.list">
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

const categoryConfig = [
  {
    listCategoryType: 6,
    color: '4169e1',
  },
  {
    listCategoryType: 7,
    color: 'F4CCCC',
  },
  {
    listCategoryType: 8,
    color: 'AEAEA3',
  },
  {
    listCategoryType: 9,
    color: 'D9D9CC',
  },
  {
    listCategoryType: 10,
    color: 'A2C4C9',
  },
  {
    listCategoryType: 11,
    color: 'FFF2CC',
  },
];

const items = [
  {
    title: t('Daycare'),
    color: categoryConfig[0].color,
    list: global.data?.categories.Daycare.pois.slice(0, 2).map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('Kindergarten'),
    color: categoryConfig[1].color,
    list: global.data?.categories.Kindergarten.pois.slice(0, 2).map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('Primary school'),
    color: categoryConfig[2].color,
    list: global.data?.categories.PrimarySchool.pois.slice(0, 2).map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('Secondary school'),
    color: categoryConfig[3].color,
    list: global.data?.categories.SecondarySchool.pois.slice(0, 2).map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('High school'),
    color: categoryConfig[4].color,
    list: global.data?.categories.HighSchool.pois.slice(0, 2).map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
  {
    title: t('University'),
    color: categoryConfig[5].color,
    list: global.data?.categories.UniversityCollage.pois.slice(0, 2).map((poi, i) => ({
      category: `${i + 1}) ${poi.name}`,
      value: formatDistance(poi.distance),
    })),
  },
];

const imageSrc = 'https://placehold.co/718x297?text=Map';
</script>
