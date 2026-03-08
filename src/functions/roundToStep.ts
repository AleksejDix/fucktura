export function roundToStep(value: number | null | undefined, step = 1.0): number {
  if (value === null || value === undefined) return 0;
  if (isNaN(value)) return 0;
  if (value < step * 2) return value;

  const roundingStep = 1.0 / step;

  const result = Math.round(value * roundingStep) / roundingStep;

  return result;
}
