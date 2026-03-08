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
      <div
        v-if="global.data?.images.detailImageOne || global.data?.images.detailImageTwo"
        class="grid grid-cols-2 gap-x-12 grid-rows-1"
      >
        <div class="aspect-[3/2] relative">
          <CDNImage class="absolute inset-0" :src="global.data?.images.detailImageOne" />
        </div>
        <div class="aspect-[3/2] relative test">
          <CDNImage class="absolute inset-0" :src="global.data?.images.detailImageTwo" />
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { HouseType } from '@/api/dossiers';
import { useI18N } from '@/composables/localization';
import { useGlobalStore } from '@/stores/global';
import CDNImage from '../CDNImage.vue';
import DList from '../DList.vue';
import type { ListItem } from '../DList.vue';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
const { translate } = useI18N();

const CATEGORY_MARKED_FOR_TRANSLATION = [translate('Building type'), translate('House type'), translate('Zone')];

const buildingInfo = ref([
  {
    category: translate('Building type'),
    value: translate(global.data?.property?.propertyType || ''),
  },
  {
    category: translate('Year of construction'),
    value: global.data?.property?.builtYear,
  },
  {
    category: translate('Renovation year'),
    value: global.data?.property?.renovationYear,
  },
  {
    category: translate('Property area'),
    value: global.data?.property?.propertyArea && `${global.data?.property?.propertyArea} m2`,
  },
]);

if (global.data?.property?.propertyType === 'House') {
  if (global.data?.property?.houseType) {
    buildingInfo.value.splice(1, 0, {
      category: translate('House type'),
      value: translate(HouseType[global.data?.property?.houseType]) || '',
    });
  }
  if (global.data?.property?.cubature) {
    buildingInfo.value.splice(2, 0, {
      category: translate('Cubature'),
      value: global.data?.property?.cubature ? `${global.data?.property?.cubature} m³` : '',
    });
  }
}

const apartmentInfo = ref([
  {
    category: translate('Rooms'),
    value: global.data?.property?.roomCount,
  },
  {
    category: translate('Living Area'),
    value: (global.data?.property?.livingArea || 'N/A') + ' m2',
  },
  {
    category: translate('Bathroom'),
    value: global.data?.property?.bathroomCount,
  },
  {
    category: translate('Garages'),
    value: global.data?.property?.garageCount,
  },
]);

function splitPascalCase(word: string | undefined) {
  if (!word) return '';
  else return (word.match(/($[a-z])|[A-Z][^A-Z]+/g) || []).join(' ');
}

const parcelInfo = ref([
  {
    category: translate('Zone'),
    value: `${translate(splitPascalCase(global.data?.parcel?.zoneGroup))}`,
  },
  {
    category: translate('EGRID'),
    value: global.data?.parcel?.data?.egrid,
  },
  {
    category: translate('Property area'),
    value: `${global.data?.parcel?.data?.area || 'N/A'}${
      global.data?.parcel?.data?.area ? ' m2' : ''
    }`,
  },
]);

const scoreInfo: ListItem[] = [];

if (global.data?.property?.constructionQuality?.value) {
  scoreInfo.push({
    category: translate('Build quality'),
    value: translate(global.data?.property?.constructionQuality?.value),
  });
}
if (global.data?.property?.buildingCondition?.value) {
  scoreInfo.push({
    category: translate('Building condition'),
    value: translate(global.data?.property?.buildingCondition?.value),
  });
}
if (global.data?.property?.microLocation?.value) {
  scoreInfo.push({
    category: translate('Microlocation'),
    value: translate(global.data?.property?.microLocation?.value),
  });
}
</script>
