<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header v-if="ratingStore.rating.view !== undefined">
        <div>
          <h2 class="text-black flex justify-between">
            <span contenteditable="false">Microlocation - View</span>
            <RatingScore v-model:rating="ratingStore.rating.view" />
          </h2>
        </div>
        <p contenteditable="false">
          Views of mountains and lakes as well as daylight and cloud cover.
        </p>
      </header>
      <div>
        <image-with-placeholder
          class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm] pb-[5mm]"
          :src="global.data?.property.imageSrcView"
          alt=""
        />
        <microlocation-legends />
        <div class="flex justify-between py-[1cm]">
          <DList
            v-for="(item, index) in items"
            class="w-full pr-[6.7mm]"
            :key="index"
            :list="item.list"
          />
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useI18N } from '@/composables/localization';
import { useGlobalStore } from '@/stores/global';
import { useRatingStore } from '@/stores/rating';
import RatingScore from '@/components/RatingScore.vue';
import { roundToStep } from '../../functions/roundToStep';
import DList from '../DList.vue';
import MicrolocationLegends from '../MicrolocationLegends.vue';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();
const ratingStore = useRatingStore();

const { translate } = useI18N();

const items = ref([
  {
    list: [
      {
        category: translate('Daylight summer'),
        value: roundToStep(global.data?.neighborhood.view.list.summerSunshineDailyHours)
          ? `${roundToStep(global.data?.neighborhood.view.list.summerSunshineDailyHours)}h`
          : 'Data not available',
      },
      {
        category: translate('Visible mountains'),
        value: global.data?.neighborhood.view.list.visibleMountainsPeaksCount
          ? `${global.data?.neighborhood.view.list.visibleMountainsPeaksCount}`
          : 'Data not available',
      },
      {
        category: translate('Slope'),
        value: roundToStep(global.data?.neighborhood.view.list.slopePercent)
          ? `${roundToStep(global.data?.neighborhood.view.list.slopePercent)}°`
          : 'Data not available',
      },
    ],
  },
  {
    list: [
      {
        category: translate('Daylight winter'),
        value: roundToStep(global.data?.neighborhood.view.list.winterSunshineDailyHours)
          ? `${roundToStep(global.data?.neighborhood.view.list.winterSunshineDailyHours)}h`
          : 'Data not available',
      },
      {
        category: translate('Lake View'),
        value: translate(global.data?.neighborhood.view.list.lakeViewType || ''),
      },
      {
        category: translate('Average cloud coverage'),
        value: roundToStep(global.data?.neighborhood.view.list.averageCloudCoveragePercent)
          ? `${roundToStep(global.data?.neighborhood.view.list.averageCloudCoveragePercent)}%`
          : 'Data not available',
      },
    ],
  },
]);
</script>
