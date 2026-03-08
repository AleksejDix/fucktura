<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2>{{ $t('Property details') }}</h2>
        <p>{{ $t('Characteristics of the property at a glance') }}</p>
      </header>
      <div class="grid grid-cols-2 gap-x-12 grid-rows-2">
        <div class="box col-span-1 h-64">
          <DList class="w-full mb-4" :list="buildingInfo">
            <template #list-value="{ item }">
              <span class="text-gray-500" v-if="CATEGORY_MARKED_FOR_TRANSLATION.includes(item.category)">
                {{ item.value }}
              </span>
            </template>
          </DList>
          <DList class="w-full mb-4" :list="apartmentInfo" />
          <DList class="w-full mb-4" :list="parcelInfo">
            <template #list-value="{ item }">
              <span class="text-gray-500" v-if="CATEGORY_MARKED_FOR_TRANSLATION.includes(item.category)">
                {{ item.value }}
              </span>
            </template>
          </DList>
        </div>
        <div>
          <DList class="w-full mb-4" :list="scoreInfo">
            <template #list-value="{ value }">
              <span class="text-gray-500" contenteditable="false">
                {{ value }}
              </span>
            </template>
          </DList>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-x-12 grid-rows-1">
        <div class="aspect-[3/2] bg-gray-200 flex items-center justify-center text-gray-400">Detail Image 1</div>
        <div class="aspect-[3/2] bg-gray-200 flex items-center justify-center text-gray-400">Detail Image 2</div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HouseType } from '@/api/dossiers';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores/global';
import DList from '../DList.vue';
import type { ListItem } from '../DList.vue';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
const { t } = useI18n();

const CATEGORY_MARKED_FOR_TRANSLATION = [t('Building type'), t('House type'), t('Zone')];

const buildingInfo = ref([
  {
    category: t('Building type'),
    value: t(global.data?.property?.propertyType || ''),
  },
  {
    category: t('Year of construction'),
    value: global.data?.property?.builtYear,
  },
  {
    category: t('Renovation year'),
    value: global.data?.property?.renovationYear,
  },
  {
    category: t('Property area'),
    value: global.data?.property?.propertyArea && `${global.data?.property?.propertyArea} m2`,
  },
]);

if (global.data?.property?.propertyType === 'House') {
  if (global.data?.property?.houseType) {
    buildingInfo.value.splice(1, 0, {
      category: t('House type'),
      value: t(HouseType[global.data?.property?.houseType]) || '',
    });
  }
  if (global.data?.property?.cubature) {
    buildingInfo.value.splice(2, 0, {
      category: t('Cubature'),
      value: global.data?.property?.cubature ? `${global.data?.property?.cubature} m³` : '',
    });
  }
}

const apartmentInfo = ref([
  {
    category: t('Rooms'),
    value: global.data?.property?.roomCount,
  },
  {
    category: t('Living Area'),
    value: (global.data?.property?.livingArea || 'N/A') + ' m2',
  },
  {
    category: t('Bathroom'),
    value: global.data?.property?.bathroomCount,
  },
  {
    category: t('Garages'),
    value: global.data?.property?.garageCount,
  },
]);

function splitPascalCase(word: string | undefined) {
  if (!word) return '';
  else return (word.match(/($[a-z])|[A-Z][^A-Z]+/g) || []).join(' ');
}

const parcelInfo = ref([
  {
    category: t('Zone'),
    value: `${t(splitPascalCase(global.data?.parcel?.zoneGroup))}`,
  },
  {
    category: t('EGRID'),
    value: global.data?.parcel?.data?.egrid,
  },
  {
    category: t('Property area'),
    value: `${global.data?.parcel?.data?.area || 'N/A'}${
      global.data?.parcel?.data?.area ? ' m2' : ''
    }`,
  },
]);

const scoreInfo: ListItem[] = [];

if (global.data?.property?.constructionQuality?.value) {
  scoreInfo.push({
    category: t('Build quality'),
    value: t(global.data?.property?.constructionQuality?.value),
  });
}
if (global.data?.property?.buildingCondition?.value) {
  scoreInfo.push({
    category: t('Building condition'),
    value: t(global.data?.property?.buildingCondition?.value),
  });
}
if (global.data?.property?.microLocation?.value) {
  scoreInfo.push({
    category: t('Microlocation'),
    value: t(global.data?.property?.microLocation?.value),
  });
}
</script>
