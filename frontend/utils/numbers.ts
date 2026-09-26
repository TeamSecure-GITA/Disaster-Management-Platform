/**
 * Numeric formatting and math calculation utilities
 */

export function formatNumber(num: number, decimals: number = 0): string {
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercentage(val: number, decimals: number = 1): string {
  if (isNaN(val)) return '0%';
  return `${(val * (val <= 1 ? 100 : 1)).toFixed(decimals)}%`;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
