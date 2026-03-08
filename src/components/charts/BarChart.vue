<template>
  <div notranslate>
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import Chart, {
  type ChartConfiguration,
  type ChartDataset,
  type ChartOptions,
} from 'chart.js/auto';
import type { ChartData } from 'chart.js/auto';
import GlobalChartOptions from './globalOptions';

const props = defineProps({
  labels: { type: Array as PropType<string[]>, required: true },
  dataSets: {
    type: Array as PropType<ChartDataset<'bar'>[]>,
    required: true,
  },
  options: { type: Object as PropType<ChartOptions<'bar'>>, required: true },
});

const canvas = ref();

onMounted(async () => {
  const data: ChartData<'bar'> = {
    labels: props.labels,
    datasets: [...props.dataSets],
  };

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data,
    options: { ...GlobalChartOptions, ...props.options },
  };

  new Chart(canvas.value, config);
});
</script>
