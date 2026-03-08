interface Input {
  [key: string]: any;
}

export function pick<T extends Input, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, item) => ({ ...acc, [item]: obj[item] }), {} as any);
}
