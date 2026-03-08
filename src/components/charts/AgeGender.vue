<template>
  <div notranslate ref="ageGenderChartRef"></div>
</template>

<script setup lang="ts">
import type {
  AgeAndGenderDistribution,
  AgeAndGenderDistributionItem,
  Theming,
} from '@/api/dossiers';
import Chart from 'chart.js/auto';
import GlobalChartOptions from './globalOptions';

const cantonData = ref<any>({});
const countryData = ref<any>({});

const ageGenderChartRef = ref<HTMLElement>();

const props = defineProps({
  data: {
    type: Object as PropType<AgeAndGenderDistribution>,
    required: true,
  },
  themeColors: {
    type: Object as PropType<Theming>,
    required: true,
  },
});

onMounted(async () => {
  const canvas = document.createElement('canvas');
  ageGenderChartRef.value?.appendChild(canvas);
  cantonData.value = generateComparerData(props.data.canton);
  countryData.value = generateComparerData(props.data.country);

  new Chart(canvas, chartOptions.value as any);
});

const labels = ref<string[]>(props.data.commune.map((commune) => commune.ageRange).reverse());

const chartOptions = computed(() => ({
  data: {
    labels: labels.value,
    datasets: [
      {
        label: 'canton_women',
        type: 'scatter',
        data: cantonData.value.female,
        showLine: true,
        borderColor: props.themeColors.color2,
        lineTension: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false,
      },
      {
        label: 'canton_men',
        type: 'scatter',
        data: cantonData.value.male,
        showLine: true,
        borderColor: props.themeColors.color2,
        lineTension: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false,
      },
      {
        label: 'country_women',
        type: 'scatter',
        data: countryData.value.female,
        showLine: true,
        borderColor: props.themeColors.color1,
        lineTension: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false,
      },
      {
        label: 'country_men',
        type: 'scatter',
        data: countryData.value.male,
        showLine: true,
        borderColor: props.themeColors.color1,
        lineTension: 0,
        pointHitRadius: 0,
        pointRadius: 0,
        borderWidth: 1.5,
        fill: false,
      },
      {
        type: 'bar',
        label: 'Women',
        stack: 'stack_0',
        yAxisID: 'y2',
        backgroundColor: props.themeColors.color3,
        borderColor: props.themeColors.color3,
        borderWidth: 1,
        barPercentage: 1.0,
        hoverBackgroundColor: props.themeColors.color3,
        hoverBorderColor: props.themeColors.color3,
        data: props.data.commune.map((commune) => commune.femaleRelativeRate * -1).reverse(),
      },
      {
        type: 'bar',
        label: 'Men',
        stack: 'stack_0',
        yAxisID: 'y2',
        order: 0,
        backgroundColor: props.themeColors.color3,
        borderColor: props.themeColors.color3,
        hoverBackgroundColor: props.themeColors.color3,
        hoverBorderColor: props.themeColors.color3,
        borderWidth: 1,
        barPercentage: 1.0,
        data: props.data.commune.map((commune) => commune.maleRelativeRate).reverse(),
      },
    ],
  },
  options: {
    ...GlobalChartOptions,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    indexAxis: 'y',
    responsive: true,
    hover: {
      mode: 'point',
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        min: -6,
        max: 6,
        beginAtZero: true,
        ticks: {
          stepSize: 2,
          callback: (v: number) => {
            return v < 0 ? `${-v}%` : `${v}%`;
          },
          align: 'inner',
        },
        grid: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        position: 'left',
        offset: false,
        min: 0,
        max: 21,
        reverse: true,
        display: false,
      },
      y2: {
        beginAtZero: true,
        position: 'right',
      },
    },
  },
}));

function generateComparerData(dataset: AgeAndGenderDistributionItem[]) {
  const comparerDataMale: Record<string, number>[] = [];
  const comparerDataFemale: Record<string, number>[] = [];
  // 20.5 is the bottom start of reversed y axis ({ x = 0, y = 20.5 } is 0,0 coordinate)
  for (let i = 0, j = 21; i < dataset.length; i++, j--) {
    const { femaleRelativeRate, maleRelativeRate } = dataset[i];
    comparerDataFemale.push(
      {
        x: Number(femaleRelativeRate.toFixed(2)) * -1,
        y: j,
      },
      {
        x: Number(femaleRelativeRate.toFixed(2)) * -1,
        y: j - 1,
      },
    );
    comparerDataMale.push(
      {
        x: Number(maleRelativeRate.toFixed(2)),
        y: j,
      },
      {
        x: Number(maleRelativeRate.toFixed(2)),
        y: j - 1,
      },
    );
  }

  return { female: comparerDataFemale, male: comparerDataMale };
}
</script>
