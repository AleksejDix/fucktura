<template>
  <PageTemplate :page-index="pageIndex">
    <section class="grid gap-y-8">
      <header>
        <h2>
          <span notranslate>{{ communeName }},</span> Canton
          <span notranslate>{{ cantonName }} (1/2)</span>
        </h2>
        <p>
          Nr. communes in canton:
          <span notranslate>
            {{ nrCommunesInCanton }}
          </span>
        </p>
      </header>
      <div class="grid gap-y-8">
        <div>
          <article class="grid gap-4">
            <header>
              <h3>{{ $t('Tax rate') }}</h3>
              <p>
                Source:
                <span>{{ $t('BFS') }}</span>
                <span notranslate>&nbsp;{{ taxRateYear }}</span>
              </p>
            </header>
            <div>
              <DTable :columns="columnsTax" :data="itemsTax">
                <template #col-type="{ type }">
                  <CellType :type="type" />
                </template>
                <template #col-commune="{ commune }">
                  <CellPercent :percent="commune" />
                </template>
                <template #col-averageCanton="{ averageCanton }">
                  <CellPercent :percent="averageCanton" />
                </template>
                <template #col-rankCanton="{ rankCanton }">
                  <CellRank :rank="rankCanton" />
                </template>
              </DTable>
            </div>
          </article>
        </div>
        <div>
          <article class="grid gap-4" v-if="taxBurdenAvailable">
            <header>
              <h3>{{ $t('Tax Burden CHF') }}</h3>
              <p>
                Source:
                <span>{{ $t('BFS') }}</span>
                <span notranslate>&nbsp;{{ taxYear }}</span>
              </p>
            </header>
            <div>
              <BarChart
                v-if="taxBurdenData.data.length"
                class="aspect-[3/1]"
                :data-sets="taxBurdenData.data"
                :labels="taxBurdenData.labels"
                :options="optionsBarChart"
              />
            </div>
          </article>
        </div>
        <div>
          <article class="grid gap-4">
            <header>
              <h3>{{ $t('Health Insurance') }}</h3>
              <p>
                Source:
                <span>{{ $t('BAG') }}</span>
                <span notranslate>&nbsp;{{ insuranceYear }}</span>
              </p>
            </header>
            <div>
              <DTable :columns="columnsInsurance" :data="itemsInsurance">
                <template #col-type="{ type }">
                  <CellType :type="type" />
                </template>
                <template #col-child="{ child }">
                  <CellPrice :price="child" />
                </template>
                <template #col-youngAdult="{ youngAdult }">
                  <CellPrice :price="youngAdult" />
                </template>
                <template #col-adult="{ adult }">
                  <CellPrice :price="adult" />
                </template>
              </DTable>
            </div>
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
import DTable from '../DTable.vue';
import type { Columns } from '../DTable.vue';
import PageTemplate from '../PageTemplate.vue';
import CellPercent from '../cells/CellPercent.vue';
import CellPrice from '../cells/CellPrice.vue';
import CellRank from '../cells/CellRank.vue';
import CellType from '../cells/CellType.vue';
import BarChart from '../charts/BarChart.vue';
import { optionsBarChart } from '../charts/BarChartOptions';
import { createTaxBurdenDataset, createTaxBurdenLegends } from '../charts/datasets';

defineProps({ pageIndex: { type: Number, default: 0 } });

const { t } = useI18n();
const global = useGlobalStore();

const communeName = ref(global.data?.commune.taxRate.communeName);
const cantonName = ref(global.data?.commune.taxRate.cantonName);
const nrCommunesInCanton = ref(global.data?.commune.taxRate?.numberOfCommunesInCanton);
const taxYear = ref(global.data?.commune.taxBurden?.year);
const taxRateYear = ref(`20${global.data?.commune.taxRate?.year}`);
const insuranceYear = ref(global.data?.commune.communeAvgMonthlyInsurance?.year);

const taxBurdenData = ref({ data: [] as ChartDataset<'bar'>[], labels: [] as string[] });
const taxBurdenAvailable = computed(() => global.data?.commune?.taxBurden?.single?.length);

onMounted(() => generateTaxBurdenChartData());

const columnsTax: Columns = {
  type: {
    text: t('Type'),
    type: 'string',
  },
  commune: {
    text: 'cantonName',
    type: 'number',
  },
  averageCanton: {
    text: t('Avg. (canton)'),
    type: 'number',
  },
  rankCanton: {
    text: t('Rank (canton)'),
    type: 'number',
  },
};

const itemsTax = [
  {
    type: t('Communal tax rate'),
    commune: global.data?.commune.taxRate.communalTaxRate,
    averageCanton: global.data?.commune.taxRate.avgCantonCommunalTaxRate,
    rankCanton: global.data?.commune.taxRate.communalTaxRateRank,
  },
  {
    type: t('Church tax (Roman Catholic)'),
    commune: global.data?.commune.taxRate.catolicTaxRate,
    averageCanton: global.data?.commune.taxRate.avgCantonCatolicTaxRate,
    rankCanton: global.data?.commune.taxRate.catolicTaxRateRank,
  },
  {
    type: t('Church tax (Protestant)'),
    commune: global.data?.commune.taxRate.protestantTaxRate,
    averageCanton: global.data?.commune.taxRate.avgCantonProtestantTaxRate,
    rankCanton: global.data?.commune.taxRate.protestantTaxRateRank,
  },
];

function generateTaxBurdenChartData() {
  if (!taxBurdenAvailable.value) return;
  taxBurdenData.value.data = createTaxBurdenDataset(
    global.data?.commune.taxBurden,
    global.data?.theming,
  );
  taxBurdenData.value.labels = createTaxBurdenLegends(global.data?.commune.taxBurden);
}

const columnsInsurance: Columns = {
  type: {
    text: t('Type'),
    type: 'string',
  },
  child: {
    text: t('Children'),
    type: 'number',
  },
  youngAdult: {
    text: t('Young Adults'),
    type: 'number',
  },
  adult: {
    text: t('Adults'),
    type: 'number',
  },
};

const itemsInsurance = [
  {
    type: t('Average cost'),
    child: global.data?.commune.communeAvgMonthlyInsurance?.child,
    youngAdult: global.data?.commune.communeAvgMonthlyInsurance?.youngAdult,
    adult: global.data?.commune.communeAvgMonthlyInsurance?.adult,
  },
];
</script>
