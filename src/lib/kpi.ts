export function calculateQuarterDiff(stats: any[] | null | undefined, fieldName: string) {
  if (!stats || stats.length < 2) return 0;

  const maxYear = stats[0].year;
  const quarter = stats[0].quarterNumber;
  const previousYear = stats.find((x) => x.year === maxYear - 1 && x.quarterNumber === quarter);
  const currentYear = stats.find((x) => x.year === maxYear && x.quarterNumber === quarter);
  if (!currentYear || !previousYear) return null;
  const diff = (currentYear[fieldName] / previousYear[fieldName] - 1) * 100;
  return diff;
}

export function calculateAverageValue(stats: any[] | null | undefined, fieldName: string) {
  if (!stats || stats.length < 2) return 0;

  const sum = stats.reduce((acc, item) => acc + item[fieldName], 0);
  return sum / stats.length;
}

export function calculateChartOffset(stats: any, fieldName: string) {
  let totalMin = 0;
  let totalMax = 0;
  Object.keys(stats).forEach((key: string) => {
    const values = stats[key]
      .map((x: any) => x[fieldName])
      .map((x: any) => (x === undefined ? 0 : x));
    let min = Math.min(...values) - 100;
    let max = Math.max(...values) + 100;
    max = Math.ceil(max / 100) * 100;
    min = Math.floor(min / 100) * 100;
    if (min < 0) {
      min = 0;
    }
    if (!totalMin) {
      totalMin = min;
    }
    if (min < totalMin) {
      totalMin = min;
    }
    if (max > totalMax) {
      totalMax = max;
    }
  });
  return { min: totalMin, max: totalMax };
}
