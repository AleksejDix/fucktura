<template>
  <div notranslate ref="">
    <canvas ref="canvas" />
  </div>
</template>

<script setup lang="ts">
import Chart, {
  type ChartConfiguration,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
} from 'chart.js/auto';
import type { _DeepPartialObject } from 'chart.js/dist/types/utils';
import type { LineChartDataElement } from './datasets';
import GlobalChartOptions from './globalOptions';

const props = defineProps({
  labels: { type: Array as PropType<string[]>, required: true },
  dataSets: {
    type: Array as PropType<ChartDataset<'line', LineChartDataElement[]>[]>,
    required: true,
  },
  options: { type: Object as PropType<ChartOptions<'line'>>, required: true },
});
const skipped = (ctx: any, value: any) => (ctx.p0.skip || ctx.p1.skip ? value : undefined);
const canvas = ref();

onMounted(async () => {
  const data: ChartData<'line', LineChartDataElement[]> = {
    labels: props.labels || [],
    datasets: [...props.dataSets],
  };

  const config: ChartConfiguration<'line', LineChartDataElement[]> = {
    type: 'line',
    data,
    options: {
      ...GlobalChartOptions,
      ...props.options,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      cubicInterpolationMode: 'monotone',
      tension: 1,
      segment: {
        borderColor: (ctx: any) => skipped(ctx, 'rgba(0,0,0,0.4)'),
        borderDash: (ctx: any) => skipped(ctx, [2, 2]),
      },
      spanGaps: true,
    },
  };

  new Chart(canvas.value, config);
});
</script>
