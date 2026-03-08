import type {
  ForeignersDevelopment,
  MarketStatisticsItem,
  PopulationGrowth,
  PopulationGrowthItem,
  TaxBurden,
  Theming,
} from '@/api/dossiers';
import { i18n } from '@/i18n';
import type { ChartData, ChartDataset, Point } from 'chart.js';
import { formatNumber } from '../../formatters/number';
import { pick } from '../../lib/objects';

export interface LabelledPoint {
  x: string;
  y: number;
}

export type LineChartDataElement = LabelledPoint | Point | number | null;

const translate = (msg: string) => i18n.global.t(msg);

const legends = {
  area: 'Selected Area',
  canton: 'Canton',
  country: 'Switzerland',
} as const;

type Legends = keyof typeof legends;

const sortOrder = ['Selected Area', 'Canton', 'Switzerland'];

export function createComparisonChartDataset(
  stats: MarketStatisticsItem | null | undefined,
  fieldName: string,
  themeColors: Theming = { color1: 'red', color2: 'green', color3: 'blue' },
) {
  if (!stats) return [];

  const datasets = Object.keys(stats)
    .filter(
      (key) => ['averageDays', 'averagePricesPerSqrM'].includes(fieldName) || key !== 'country',
    )
    .map((key) => {
      const data = stats[key]
        .slice()
        .reverse()
        .map((record) => (record[fieldName] > 0 ? Math.round(record[fieldName]) : null));

      return {
        data,
        label: translate(legends[key as Legends]),
        pointStyle: false,
      };
    })
    .sort((a, b) => sortOrder.indexOf(a.label) - sortOrder.indexOf(b.label))
    .map((x, index) => {
      return {
        ...x,
        borderColor: themeColors[`color${index + 1}`],
      };
    });

  return datasets as ChartDataset<'line', LineChartDataElement[]>[];
}

export function createComparisonChartLegends(stats?: MarketStatisticsItem) {
  return (stats?.country || [])
    .slice()
    .reverse()
    .map((record) => `${record.year - 2000} Q${record.quarterNumber}`);
}

export function createTaxBurdenDataset(
  taxBurdenData?: TaxBurden,
  themeColors: Theming = { color1: 'red', color2: 'green', color3: 'blue' },
): ChartDataset<'bar'>[] {
  if (!taxBurdenData) return [];

  const data = pick(taxBurdenData, ['single', 'marriedWithChildren', 'marriedPensioner']);

  const elements = Object.keys(data) as (keyof typeof data)[];

  return elements.map((key, i) => ({
    label: translate(
      (key.charAt(0).toUpperCase() + key.slice(1)).split(/(?=[A-Z])/).join(' '),
    ) as string,
    data: taxBurdenData[key].map((tier) => tier.burden),
    backgroundColor: themeColors[`color${i + 1}`],
    datasets: [],
  }));
}

export function createTaxBurdenLegends(taxBurdenData?: TaxBurden) {
  if (!taxBurdenData) return [];

  const data = pick(taxBurdenData, ['single', 'marriedWithChildren', 'marriedPensioner']);
  const elements = Object.keys(data) as (keyof typeof data)[];

  return elements.map(
    (key, i) =>
      `Income: ${formatNumber(taxBurdenData[key][i].income)} Assets: ${formatNumber(
        taxBurdenData[key][i].assets,
      )}`,
  );
}

export function createForeignersDataset(
  foreignersData?: ForeignersDevelopment,
  themeColors: Theming = { color1: 'red', color2: 'green', color3: 'blue' },
): ChartDataset<'bar'>[] {
  if (!foreignersData) return [];

  const data = pick(foreignersData, ['country', 'canton', 'commune']);

  const elements = Object.keys(data) as (keyof typeof data)[];

  return elements.map((key, i) => ({
    label: translate(key.charAt(0).toUpperCase() + key.slice(1)),
    data: foreignersData[key].map((year: any) => year.foreignersPopulationPercentage.toFixed(2)),
    backgroundColor: themeColors[`color${i + 1}`],
    datasets: [],
  }));
}

export function createForeignersLegends(foreignersData?: ForeignersDevelopment) {
  if (!foreignersData) return [];

  return foreignersData.commune.map((area) => String(area.year));
}

export function createPopulationGrowthDataset(
  populationGrowthData?: PopulationGrowth,
  themeColors: Theming = { color1: 'red', color2: 'green', color3: 'blue' },
): ChartData<'line'>[] {
  if (!populationGrowthData) return [];

  const data = pick(populationGrowthData, ['country', 'canton', 'commune']) as Record<
    string,
    PopulationGrowthItem[]
  >;

  return Object.keys(data).map((key: string, i) => ({
    label: translate(key.charAt(0).toUpperCase() + key.slice(1)),
    data: data[key]
      .slice(1, data[key].length - 1)
      .map((year) => year.relativeChangeRate.toFixed(2)),
    backgroundColor: themeColors[`color${i + 1}`],
    datasets: [],
  }));
}

export function createPopulationGrowthLegends(populationGrowthData?: PopulationGrowth) {
  if (!populationGrowthData) return [];

  return populationGrowthData.commune
    .map((area) => area.year)
    .slice(1, populationGrowthData.commune.length - 1);
}
