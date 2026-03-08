import { useGlobalStore } from '@/stores/global';
import { computed } from 'vue';
import { calculateAverageValue, calculateQuarterDiff } from '@/lib/kpi';

export function useKpi() {
  const global = useGlobalStore();
  const market = computed(() => global.data?.statistics.market);

  const mediumDaysCompareQuarter = computed(() => market.value?.mediumDays.canton[0].quarterNumber);
  const mediumDaysYearMax = computed(() => market.value?.mediumDays.country[0].year);
  const mediumDaysChange = computed(() =>
    calculateQuarterDiff(market.value?.mediumDays.canton, 'averageDays'),
  );
  const mediumDaysAverage = computed(() =>
    calculateAverageValue(market.value?.mediumDays.canton, 'averageDays'),
  );
  const totalOffersAverage = computed(() =>
    calculateAverageValue(market.value?.totalOffers.canton, 'count'),
  );
  const totalOffersYearMax = computed(() => market.value?.totalOffers.country[0].year);
  const totalOffersCompareQuarter = computed(
    () => market.value?.totalOffers.canton[0].quarterNumber,
  );
  const totalOffersChange = computed(() =>
    calculateQuarterDiff(market.value?.totalOffers.canton, 'count'),
  );
  const transactionsAverage = computed(() =>
    calculateAverageValue(market.value?.transactionAmount.canton, 'count'),
  );
  const transactionsCompareQuarter = computed(
    () => market.value?.transactionAmount.canton[0].quarterNumber,
  );
  const transactionsYearMax = computed(() => market.value?.transactionAmount.country[0].year);
  const transactionsChange = computed(() =>
    calculateQuarterDiff(market.value?.transactionAmount.canton, 'count'),
  );

  return {
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
  };
}
