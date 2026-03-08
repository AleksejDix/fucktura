<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-8">
      <header>
        <h2>
          <span notranslate>{{ communeName }},</span> Canton
          <span notranslate>{{ cantonName }} (2/2)</span>
        </h2>
        <p>
          Nr. communes in canton:
          <span notranslate>&nbsp;{{ nrCommunesInCanton }}</span>
        </p>
      </header>
      <div class="grid grid-cols-2 gap-12">
        <div>
          <div class="grid gap-6">
            <article class="grid gap-2">
              <header>
                <h3>Population growth (%)</h3>
                <p>
                  Source:
                  <span>{{ $t('BFS') }}</span>
                  <span notranslate>&nbsp;{{ global.data?.commune.populationGrowth.year }}</span>
                </p>
              </header>
              <div>
                <BarChart
                  v-if="populationGrowthData.data.length"
                  class="aspect-[4/3]"
                  :data-sets="populationGrowthData.data || []"
                  :labels="populationGrowthData.labels"
                  :options="optionsChartsCommuneTaxBurden"
                />
              </div>
            </article>
            <article class="grid gap-2">
              <header>
                <h3>Foreigners (%)</h3>
                <p>
                  Source:
                  <span>{{ $t('BFS') }}</span>
                  <span notranslate
                    >&nbsp;{{ global.data?.commune.foreignersDevelopment.year }}</span
                  >
                </p>
              </header>
              <div>
                <BarChart
                  class="aspect-[4/3]"
                  v-if="foreignersData.data.length"
                  :data-sets="foreignersData.data || []"
                  :labels="foreignersData.labels"
                  :options="optionsChartsCommuneTaxBurden"
                />
              </div>
            </article>
          </div>
        </div>
        <div class="order-first">
          <article class="grid gap-4">
            <header>
              <h3>{{ $t('Population share') }}</h3>
              <p>
                Source:
                <span>{{ $t('BFS') }}</span>
                <span notranslate
                  >&nbsp;{{ global.data?.commune.ageAndGenderDistribution.year }}</span
                >
              </p>
            </header>

            <div class="">
              <div class="flex justify-between">
                <div class="ml-[3mm] font-bold text-xs">{{ $t('Age') }}</div>
                <div class="w-full flex justify-center font-bold">{{ $t('Women') }}</div>
                <div class="w-full flex justify-center font-bold">{{ $t('Men') }}</div>
              </div>
              <AgeGenderChart
                class="aspect-[100/130]"
                v-if="global.data?.commune.ageAndGenderDistribution.country.length"
                :data="global.data?.commune.ageAndGenderDistribution"
                :theme-colors="global.data?.theming"
              />
              <div class="flex gap-3 pt-2">
                <div class="flex items-center gap-2">
                  <span class="h-3 w-8 inline-block bg-primary" />
                  <p>{{ $t('Switzerland') }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="h-3 w-8 inline-block bg-secondary" />
                  <p>{{ $t('Canton') }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex">
                    <div class="w-8 h-3 bg-tertiary"></div>
                  </div>
                  <p>{{ $t('Commune') }}</p>
                </div>
              </div>
            </div>

            <DList :list="populationShareInfo" />
          </article>
        </div>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores/global';
import type { ChartDataset } from 'chart.js';
import DList from '../DList.vue';
import PageTemplate from '../PageTemplate.vue';
import AgeGenderChart from '../charts/AgeGender.vue';
import BarChart from '../charts/BarChart.vue';
import { optionsChartsCommuneTaxBurden } from '../charts/BarChartOptions';
import {
  createForeignersDataset,
  createForeignersLegends,
  createPopulationGrowthDataset,
  createPopulationGrowthLegends,
} from '../charts/datasets';

defineProps({ pageIndex: { type: Number, default: 0 } });

const { t } = useI18n();
const global = useGlobalStore();

const communeName = ref(global.data?.commune.taxRate.communeName);
const cantonName = ref(global.data?.commune.taxRate.cantonName);
const nrCommunesInCanton = ref(global.data?.commune.taxRate.numberOfCommunesInCanton);

const foreignersData = ref({ data: [] as ChartDataset<'bar'>[], labels: [] as string[] });
const populationGrowthData = ref<any>({ data: [], labels: [] });

onMounted(() => {
  generateForeignersChartData();
  generatePopulationGrowthChartData();
});

const communeMaleShare = global.data?.commune.ageAndGenderDistribution.commune.reduce(
  (acc, curr) => acc + curr.maleRelativeRate,
  0,
);

const communeFemaleShare = global.data?.commune.ageAndGenderDistribution.commune.reduce(
  (acc, curr) => acc + curr.femaleRelativeRate,
  0,
);

const populationShareInfo = ref([
  {
    category: t('Female'),
    value: Math.round(communeFemaleShare || 0) + '%',
    categoryIcon: 'fa-venus',
  },
  {
    category: t('Male'),
    value: Math.round(communeMaleShare || 0) + '%',
    categoryIcon: 'fa-mars',
  },
]);

function generateForeignersChartData() {
  foreignersData.value.data = createForeignersDataset(
    global.data?.commune.foreignersDevelopment,
    global.data?.theming,
  );
  foreignersData.value.labels = createForeignersLegends(global.data?.commune.foreignersDevelopment);
}

function generatePopulationGrowthChartData() {
  populationGrowthData.value.data = createPopulationGrowthDataset(
    global.data?.commune.populationGrowth,
    global.data?.theming,
  );
  populationGrowthData.value.labels = createPopulationGrowthLegends(
    global.data?.commune.populationGrowth,
  );
}
</script>
