import type { ChartOptions } from 'chart.js';

const formatCash = (n: number) => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K';
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M';
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T';
};

export const optionsChartsPageThree: ChartOptions<'line'> = {
  scales: {
    x: {
      grid: {
        display: true,
      },
      ticks: {
        align: 'inner',
        maxRotation: 90,
        minRotation: 90,
        autoSkip: false,
        labelOffset: 5,
      },
      border: {
        display: true,
      },
    },
    y: {
      border: {
        display: false,
      },
      grid: {
        display: false,
      },
      position: 'right',
      ticks: {
        callback(value) {
          return formatCash(Number(value));
        },
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      align: 'start',
    },
  },
  maintainAspectRatio: false,
};

export const optionsChartsPageFour: ChartOptions<'line'> = {
  scales: {
    x: {
      grid: {
        display: true,
      },
      ticks: {
        align: 'inner',
        maxRotation: 90,
        minRotation: 90,
        autoSkip: false,
      },
      border: {
        display: true,
      },
    },
    y: {
      grid: {
        display: false,
      },
      position: 'right',
      border: {
        display: false,
      },
      ticks: {
        callback(value) {
          return formatCash(Number(value));
        },
        maxRotation: 0,
        minRotation: 0,
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom',
      align: 'start',
    },
  },
  maintainAspectRatio: false,
};

export const optionsChartsPageSixOne: ChartOptions<'line'> = {
  ...optionsChartsPageFour,
  scales: {
    x: {
      ...optionsChartsPageFour.scales?.x,
    },
    y: {
      ...{ ...optionsChartsPageFour.scales?.y, suggestedMax: 300 },
    },
  },
};
