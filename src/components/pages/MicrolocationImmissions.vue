<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header v-if="ratingStore.rating.immissions !== undefined">
        <h2 class="flex justify-between">
          <span contenteditable="false"> Microlocation - Immissions</span>
          <RatingScore v-model:rating="ratingStore.rating.immissions"></RatingScore>
        </h2>
        <p contenteditable="false">{{ $t('Proximity to cell phone towers') }}</p>
      </header>

      <div class="grid gap-y-4">
        <image-with-placeholder
          class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm]"
          :src="imageSrc"
          alt="Map for Microlocation - Immissions"
        />
        <microlocation-legends class="mb-[5mm]" />
        <DList :title="items.title" :list="items.list">
          <template #list-category="{ category }">
            <span notranslate> {{ category }} </span>
          </template>
        </DList>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const listWithout2G = computed(() =>
  (global.data?.neighborhood.immissions.list || [])
    .map((item) => ({
      addressCoordinates: item.addressCoordinates,
      category: `${item.category
        .split(',')
        .map((x) => x.trim())
        .filter((x) => x !== '2G')}`,
      value: formatDistance(item.distance),
    }))
    .filter((item) => item.category),
);

const items = computed(() => ({
  title: t('Next Mobile Antenna'),
  list: listWithout2G.value.map((x, index) => ({
    category: `${index + 1}) ${x.category}`,
    value: x.value,
  })),
}));

const imageSrc = 'https://placehold.co/718x297?text=Map';
</script>
