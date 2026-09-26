/**
 * Chart configuration helpers, palettes, and formatters
 */

export const CHART_THEME = {
  colors: {
    primary: '#38bdf8',
    secondary: '#818cf8',
    accent: '#06b6d4',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    grid: 'rgba(148, 163, 184, 0.1)',
    text: '#94a3b8',
  },
  tooltipStyle: {
    backgroundColor: '#0f172a',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    color: '#f8fafc',
    fontSize: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
};

export function generateTimeSeriesMock(hours: number = 24, baseValue: number = 50) {
  const points = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now - i * 3600 * 1000);
    const noise = (Math.random() - 0.48) * 15;
    points.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, Math.round(baseValue + noise)),
    });
  }
  return points;
}
