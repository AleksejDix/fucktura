<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header v-if="ratingStore.rating.noise !== undefined">
        <h2 class="flex justify-between">
          <span contenteditable="false"> Microlocation - Silence </span>
          <RatingScore v-model:rating="ratingStore.rating.noise"></RatingScore>
        </h2>
        <p contenteditable="false">
          Noise level during the day and at night from the surrounding traffic
        </p>
      </header>
      <div>
        <img
          class="w-full object-cover max-h-[78.58125mm] h-[78.58125mm] pb-[5mm]"
          :src="global.data?.property.imageSrcSilence"
          alt=""
        />
        <microlocation-legends class="mb-[10mm]" />
        <div class="flex justify-between pb-[1cm]">
          <DList
            v-for="item in items"
            class="w-full pr-[6.7mm]"
            :title="item.title"
            :list="item.list"
            :key="item.title"
          />
        </div>
        <div class="w-full h-[78mm] pb-[5mm]">
          <div class="text-primary font-bold pb-2">{{ $t('Decibel scale') }}</div>
          <div class="flex justify-between h-[6mm] text-[8pt] text-gray-600" notranslate>
            <span v-for="(decibelItem, index) in decibelNumberList" :key="index">
              {{ decibelItem }}db
            </span>
          </div>
          <div class="relative text-[7pt]">
            <span
              class="w-full indent-0 absolute h-[4px] rounded bg-gradient-to-r from-[#a4cea1] via-[#eee161] to-[#d52947]"
            ></span>
            <span class="absolute text-gray-600 top-[10px]">{{ $t('Quiet') }}</span>
            <span class="absolute text-gray-600 right-0 top-[10px]">{{ $t('Very loud') }}</span>
            <div class="relative">
              <div
                v-for="(marker, index) in markerConfigList"
                :key="index"
                class="top-0 w-[140px] h-[140px] flex items-center flex-col absolute"
                :style="`left:${marker.posFromLeft}`"
              >
                <span class="w-[4px] h-[4px] rounded-full bg-white border border-gray-600"></span>
                <span
                  class="border border-gray-600"
                  :style="{ height: index % 2 === 0 ? '120px' : '60px' }"
                ></span>
                <span class="font-bold">{{ marker.description }}</span>
                <span class="text-gray-600" notranslate>{{ marker.decibelLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
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

const items = ref([
  {
    title: t('Car'),
    list: [
      {
        category: t('Day'),
        value: global.data?.neighborhood.noise.list.roadDay
          ? `${global.data?.neighborhood.noise.list.roadDay}db`
          : t('Data not available'),
      },
      {
        category: t('Night'),
        value: global.data?.neighborhood.noise.list.roadNight
          ? `${global.data?.neighborhood.noise.list.roadNight}db`
          : t('Data not available'),
      },
    ],
  },
  {
    title: t('Train'),
    list: [
      {
        category: t('Day'),
        value: global.data?.neighborhood.noise.list.railwayDay
          ? `${global.data?.neighborhood.noise.list.railwayDay}db`
          : t('Data not available'),
      },
      {
        category: t('Night'),
        value: global.data?.neighborhood.noise.list.railwayNight
          ? `${global.data?.neighborhood.noise.list.railwayNight}db`
          : t('Data not available'),
      },
    ],
  },
]);

const decibelNumberList = [...Array(11).keys()].map((i) => (i + 1) * 10);
const markerConfigList = [
  {
    posFromLeft: '1%',
    description: t('Rustling leaves'),
    decibelLabel: '20db',
  },
  {
    posFromLeft: '7%',
    description: t('Whispering'),
    decibelLabel: '25db',
  },
  {
    posFromLeft: '18%',
    description: t('Fridge'),
    decibelLabel: '40db',
  },
  {
    posFromLeft: '27%',
    description: t('Rain'),
    decibelLabel: '45db',
  },
  {
    posFromLeft: '39%',
    description: t('Normal conversation'),
    decibelLabel: '60db',
  },
  {
    posFromLeft: '52%',
    description: t('Vacuum cleaner'),
    decibelLabel: '75db',
  },
  {
    posFromLeft: '58%',
    description: t('Mixer'),
    decibelLabel: '80db',
  },
  {
    posFromLeft: '68%',
    description: t('Motorcycle'),
    decibelLabel: '90db',
  },
  {
    posFromLeft: '78%',
    description: t('Ambulance'),
    decibelLabel: '100db',
  },
];
</script>
