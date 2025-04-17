/**
 * Collection of helper utilities for the wallet analyzer
 */

/**
 * Safely formats a number as a percentage string
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) return "0.00%";
  return `${value.toFixed(2)}%`;
}

/**
 * Safely formats a number as a currency string
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Converts a Date object to a formatted date string
 */
export function formatDate(date: Date | undefined | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Safely calculate average of an array of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

/**
 * Safely calculate median of an array of numbers
 */
export function calculateMedian(numbers: number[]): number {
  if (!numbers.length) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

/**
 * Calculate standard deviation of an array of numbers
 */
export function calculateStandardDeviation(numbers: number[]): number {
  if (numbers.length < 2) return 0;

  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map((num) => {
    const diff = num - avg;
    return diff * diff;
  });

  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Estimate maximum drawdown from an array of cumulative returns
 */
export function estimateDrawdown(cumulativeReturns: number[]): number {
  if (cumulativeReturns.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = cumulativeReturns[0];

  for (const value of cumulativeReturns) {
    if (value > peak) {
      peak = value;
    }

    const drawdown = ((peak - value) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown;
}

/**
 * Calculate Sharpe ratio (return / volatility)
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate = 0
): number {
  if (returns.length < 2) return 0;

  const avgReturn = calculateAverage(returns);
  const stdDev = calculateStandardDeviation(returns);

  if (stdDev === 0) return 0;

  return (avgReturn - riskFreeRate) / stdDev;
}

/**
 * Identify post-loss behavior by analyzing consecutive trades
 * Returns: recovery rate (percentage of losses followed by profitable trades)
 */
export function analyzePostLossBehavior(
  trades: Array<{ pnl_pct: number }>
): number {
  let losses = 0;
  let recoveries = 0;

  for (let i = 0; i < trades.length - 1; i++) {
    if (trades[i].pnl_pct < 0) {
      losses++;
      if (trades[i + 1].pnl_pct > 0) {
        recoveries++;
      }
    }
  }

  return losses > 0 ? (recoveries / losses) * 100 : 100;
}

/**
 * Create a unique cache-busting query parameter based on the current time
 */
export function createCacheBuster(): string {
  return `cb=${Date.now()}`;
}

/**
 * Sleep function to pause execution
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
