export const NumberUtils = {
  round(num: number, decimals: number = 2): number {
    const f = Math.pow(10, decimals);
    return Math.round(num * f) / f;
  },
  clamp(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
  }
};
