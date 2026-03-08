import { numberFormatter } from '@/formatters/chart';
import type { ChartOptions } from 'chart.js';

export const optionsChartsCommuneTaxBurden: ChartOptions<'bar'> = {
  scales: {
    x: {
      grid: {
        display: true,
      },
      border: {
        display: false,
      },
      ticks: {
        align: 'inner',
        maxRotation: 90,
        minRotation: 90,
        autoSkip: false,
      },
    },
    y: {
      border: {
        display: false,
      },
      position: 'right',
      ticks: {
        callback(value) {
          return numberFormatter(Number(value));
        },
        maxRotation: 0,
        minRotation: 0,
        autoSkip: false,
      },
    },
  },
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'start',
    },
  },
};

export const optionsBarChart: ChartOptions<'bar'> = {
  scales: {
    x: {
      grid: {
        display: true,
      },
      border: {
        display: false,
      },
      ticks: {
        align: 'center',
        maxRotation: 0,
        minRotation: 0,
        autoSkip: false,
      },
    },
    y: {
      border: {
        display: false,
      },
      position: 'right',
      ticks: {
        callback(value) {
          return numberFormatter(Number(value));
        },
        maxRotation: 0,
        minRotation: 0,
        autoSkip: false,
      },
    },
  },
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      align: 'start',
    },
  },
};
