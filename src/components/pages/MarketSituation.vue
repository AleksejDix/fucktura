<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2 class="text-black" contenteditable="false">{{ $t('Market situation') }}</h2>
        <p contenteditable="false">{{ $t('Objects that came onto the market in the last 2 years') }}</p>
      </header>

      <div class="grid grid-cols-3 grid-rows-3 gap-y-2">
        <div class="box col-span-2">
          <div class="grid gap-y-2">
            <h3 class="text-primary">{{ $t('Medium number of days on market') }}</h3>
            <LineChart
              v-if="mediumNumberOfDaysOnMarketData.data.length"
              class="h-[60mm]"
              :data-sets="mediumNumberOfDaysOnMarketData.data"
              :labels="mediumNumberOfDaysOnMarketData.labels"
              :options="optionsChartsPageFour"
            />
          </div>
        </div>
        <DataBox
          :title="$t('Average days on market')"
          :average="mediumDaysAverage"
          :compare-quarter="mediumDaysCompareQuarter"
          :year-max="mediumDaysYearMax"
          :change="mediumDaysChange"
        />

        <!-- <div class="border border-red-500">
        <p class="font-semibold text-primary text-xs">Since last year</p>
        <p notranslate class="font-semibold text-primary text-xl text-[#1EB37C] pb-[5mm]">+0.9%</p>
        <p class="font-semibold text-primary text-xs">In the last 3 years</p>
        <p notranslate class="mb-[5mm] font-semibold text-primary text-xl text-[#FF0739]">-0.2%</p>
      </div> -->
        <div class="box col-span-2">
          <div class="grid gap-y-2">
            <h3 class="text-primary">{{ $t('Total offers') }}</h3>
            <LineChart
              v-if="totalOffersData.data.length"
              class="h-[60mm]"
              :data-sets="totalOffersData.data"
              :labels="totalOffersData.labels"
              :options="optionsChartsPageFour"
            />
          </div>
        </div>
        <DataBox
          :title="$t('Average offers')"
          :average="totalOffersAverage"
          :compare-quarter="totalOffersCompareQuarter"
          :year-max="totalOffersYearMax"
          :change="totalOffersChange"
        />
        <div class="box col-span-2">
          <div class="grid gap-y-2">
            <h3 class="text-primary">{{ $t('Amount of transactions') }}</h3>
            <LineChart
              v-if="amountOfTransactionsData.data.length"
              class="h-[60mm]"
              :data-sets="amountOfTransactionsData.data"
              :labels="amountOfTransactionsData.labels"
              :options="optionsChartsPageFour"
            />
          </div>
        </div>
        <DataBox
          :title="$t('Average transactions')"
          :average="transactionsAverage"
          :compare-quarter="transactionsCompareQuarter"
          :year-max="transactionsYearMax"
          :change="transactionsChange"
        />
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { useKpi } from '@/composables/kpi';
import { useGlobalStore } from '@/stores/global';
import type { ChartDataset } from 'chart.js';
import DataBox from '@/components/market-radar/DataBox.vue';
import PageTemplate from '../PageTemplate.vue';
import LineChart from '../charts/LineChart.vue';
import { optionsChartsPageFour } from '../charts/LinechartOptions';
import {
  type LineChartDataElement,
  createComparisonChartDataset,
  createComparisonChartLegends,
} from '../charts/datasets';

defineProps({ pageIndex: { type: Number, default: 0 } });

const global = useGlobalStore();

interface CustomChartSettings {
  data: ChartDataset<'line', LineChartDataElement[]>[];
  labels: string[];
}

const mediumNumberOfDaysOnMarketData = ref<CustomChartSettings>({ data: [], labels: [] });
const totalOffersData = ref<CustomChartSettings>({ data: [], labels: [] });
const amountOfTransactionsData = ref<CustomChartSettings>({ data: [], labels: [] });

const {
  mediumDaysCompareQuarter,
  mediumDaysYearMax,
  mediumDaysChange,
  mediumDaysAverage,
  totalOffersAverage,
  totalOffersYearMax,
  totalOffersCompareQuarter,
  totalOffersChange,
  transactionsAverage,
  transactionsCompareQuarter,
  transactionsYearMax,
  transactionsChange,
} = useKpi();

onMounted(() => {
  generateMediumNumberOfDaysOnMarketChartData();
  generateTotalOffersData();
  generateAmountOfTransactionsData();
});

function generateMediumNumberOfDaysOnMarketChartData() {
  mediumNumberOfDaysOnMarketData.value.data = createComparisonChartDataset(
    global.data?.statistics?.market?.mediumDays,
    'averageDays',
    global.data?.theming,
  );
  mediumNumberOfDaysOnMarketData.value.labels = createComparisonChartLegends(
    global.data?.statistics?.market?.mediumDays,
  );
}

function generateTotalOffersData() {
  totalOffersData.value.data = createComparisonChartDataset(
    global.data?.statistics?.market?.totalOffers,
    'count',
    global.data?.theming,
  );
  totalOffersData.value.labels = createComparisonChartLegends(
    global.data?.statistics?.market?.totalOffers,
  );
}

function generateAmountOfTransactionsData() {
  amountOfTransactionsData.value.data = createComparisonChartDataset(
    global.data?.statistics?.market?.transactionAmount,
    'count',
    global.data?.theming,
  );
  amountOfTransactionsData.value.labels = createComparisonChartLegends(
    global.data?.statistics?.market?.transactionAmount,
  );
}
</script>
