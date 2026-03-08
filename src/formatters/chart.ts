export function numberFormatter(value: number | bigint) {
  return new Intl.NumberFormat('en-EN', {
    notation: 'compact',
    compactDisplay: 'short',
  })
    .format(value)
    .replace('T', 'K');
}
