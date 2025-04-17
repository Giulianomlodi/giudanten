import { WalletModel, TradeModel, WalletPosition } from "../types/hyperliquid";

// Calculate ROI score (25% weight)
export function calculateRoiScore(roiMonth: number): number {
  // score_roi = (roi_month / 0.1) * 25 (capped at 25)
  const score = (roiMonth / 0.1) * 25;
  return Math.min(score, 25);
}

// Calculate win rate score (15% weight)
export function calculateWinRateScore(
  trades: TradeModel[],
  timeWindow: number = 30
): number {
  // Filter trades by time window
  const now = new Date();
  const startDate = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
  const filteredTrades = trades.filter((t) => t.timestamp >= startDate);

  if (filteredTrades.length === 0) {
    return 0;
  }

  const winningTrades = filteredTrades.filter((t) => t.closed_pnl > 0).length;
  const winRate = (winningTrades / filteredTrades.length) * 100;

  // min(win_rate / 100 * 15, 15)
  return Math.min((winRate / 100) * 15, 15);
}

// Calculate average PnL per trade score (10% weight)
export function calculateAvgPnlScore(
  trades: TradeModel[],
  timeWindow: number = 30
): number {
  // Filter trades by time window
  const now = new Date();
  const startDate = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
  const filteredTrades = trades.filter((t) => t.timestamp >= startDate);

  if (filteredTrades.length === 0) {
    return 0;
  }

  // Calculate average PnL percentage
  let totalPnlPct = 0;

  for (const trade of filteredTrades) {
    const pnlPct = (trade.closed_pnl / trade.trade_value_usd) * 100;
    totalPnlPct += pnlPct;
  }

  const avgPnlPct = totalPnlPct / filteredTrades.length;

  // min(avg_pnl_pct / 2, 10)
  return Math.min(avgPnlPct / 2, 10);
}

// Calculate average leverage score (10% weight)
export function calculateLeverageScore(positions: WalletPosition[]): number {
  if (!positions || positions.length === 0) {
    return 10; // Default to full score if no positions
  }

  let totalPositionValue = 0;
  let weightedLeverage = 0;

  for (const position of positions) {
    const positionValue = Math.abs(position.position_value);
    totalPositionValue += positionValue;
    weightedLeverage += positionValue * position.leverage;
  }

  if (totalPositionValue === 0) {
    return 10;
  }

  const avgLeverage = weightedLeverage / totalPositionValue;

  // 10 - (max(0, avg_leverage - 10) * 0.5)
  return 10 - Math.max(0, avgLeverage - 10) * 0.5;
}

// Calculate drawdown score (15% weight)
export function calculateDrawdownScore(
  trades: TradeModel[],
  timeWindow: number = 30
): number {
  // Filter trades by time window
  const now = new Date();
  const startDate = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
  const filteredTrades = trades.filter((t) => t.timestamp >= startDate);

  if (filteredTrades.length === 0) {
    return 15; // Default to full score if no trades
  }

  // Sort trades by timestamp
  const sortedTrades = [...filteredTrades].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Build equity curve
  const initialEquity = 10000; // Arbitrary starting point
  const equityCurve = [initialEquity];

  for (const trade of sortedTrades) {
    const lastEquity = equityCurve[equityCurve.length - 1];
    const pnlImpact = (trade.closed_pnl / trade.trade_value_usd) * lastEquity;
    equityCurve.push(lastEquity + pnlImpact);
  }

  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let peak = equityCurve[0];

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = ((peak - value) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // 15 - min(max_drawdown_pct * 0.6, 15)
  return 15 - Math.min(maxDrawdown * 0.6, 15);
}

// Calculate consistency score (10% weight)
export function calculateConsistencyScore(
  trades: TradeModel[],
  timeWindow: number = 30
): number {
  // Filter trades by time window
  const now = new Date();
  const startDate = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
  const filteredTrades = trades.filter((t) => t.timestamp >= startDate);

  if (filteredTrades.length < 5) {
    return 5; // Middle score for insufficient data
  }

  // Calculate daily PnL
  const dailyPnl: Record<string, number> = {};

  for (const trade of filteredTrades) {
    const day = trade.timestamp.toISOString().split("T")[0];
    if (!dailyPnl[day]) {
      dailyPnl[day] = 0;
    }
    dailyPnl[day] += trade.closed_pnl;
  }

  const pnlValues = Object.values(dailyPnl);

  if (pnlValues.length <= 1) {
    return 5; // Middle score for insufficient data
  }

  // Calculate standard deviation
  const mean = pnlValues.reduce((sum, val) => sum + val, 0) / pnlValues.length;
  const squaredDiffs = pnlValues.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / pnlValues.length;
  const stdDev = Math.sqrt(variance);

  // Calculate coefficient of variation (lower is more consistent)
  const cv = stdDev / Math.abs(mean || 1); // Avoid division by zero

  // Convert to score (0-10)
  const consistencyScore = Math.max(0, Math.min(10, 10 - cv * 5));
  return consistencyScore;
}

// Calculate trade frequency score (5% weight)
export function calculateFrequencyScore(
  trades: TradeModel[],
  timeWindow: number = 30
): number {
  // Filter trades by time window
  const now = new Date();
  const startDate = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
  const filteredTrades = trades.filter((t) => t.timestamp >= startDate);

  // Calculate trades per week
  const tradesPerWeek = filteredTrades.length / (timeWindow / 7);

  // Scaled score based on trades per week (optimal: 10-30 trades/week)
  if (tradesPerWeek < 5) {
    return (tradesPerWeek / 5) * 2.5; // Low activity (0-2.5)
  } else if (tradesPerWeek < 10) {
    return 2.5 + ((tradesPerWeek - 5) / 5) * 2.5; // Building up (2.5-5)
  } else if (tradesPerWeek <= 30) {
    return 5; // Optimal range (5)
  } else if (tradesPerWeek <= 50) {
    return 5 - ((tradesPerWeek - 30) / 20) * 2.5; // Too active (5-2.5)
  } else {
    return 2.5 - Math.min(2.5, ((tradesPerWeek - 50) / 50) * 2.5); // Excessive (2.5-0)
  }
}

// Calculate post-loss behavior score (5% weight)
export function calculatePostLossScore(
  trades: TradeModel[],
  timeWindow: number = 30
): number {
  // Filter trades by time window
  const now = new Date();
  const startDate = new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000);
  const filteredTrades = trades.filter((t) => t.timestamp >= startDate);

  if (filteredTrades.length < 5) {
    return 2.5; // Middle score for insufficient data
  }

  // Sort trades by timestamp
  const sortedTrades = [...filteredTrades].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const recoveryRatios: number[] = [];
  let currentLoss: TradeModel | null = null;

  for (const trade of sortedTrades) {
    if (trade.closed_pnl < 0) {
      currentLoss = trade;
    } else if (currentLoss !== null) {
      // Found a trade after a loss
      const lossSize = Math.abs(currentLoss.closed_pnl);
      if (lossSize > 0) {
        const recoveryRatio = trade.closed_pnl / lossSize;
        recoveryRatios.push(Math.min(recoveryRatio, 3)); // Cap at 3x
      }
      currentLoss = null;
    }
  }

  if (recoveryRatios.length === 0) {
    return 2.5; // Middle score for no recovery patterns
  }

  const avgRecovery =
    recoveryRatios.reduce((sum, val) => sum + val, 0) / recoveryRatios.length;

  // Score based on average recovery (healthy range: 1.0-2.0)
  if (avgRecovery < 0.5) {
    return Math.max(0, avgRecovery * 5); // Poor recovery
  } else if (avgRecovery <= 2.0) {
    return Math.min(5, 2.5 + (avgRecovery - 0.5) * 2.5); // Good recovery
  } else {
    return Math.max(0, 5 - (avgRecovery - 2) * 2.5); // Overcompensation penalty
  }
}

// Calculate ROI trend score (5% weight)
export function calculateRoiTrendScore(
  roiDay: number,
  roiMonth: number
): number {
  // min(5, max(0, (roi_day * 30 - roi_month) / 2))
  return Math.min(5, Math.max(0, (roiDay * 30 - roiMonth) / 2));
}

// Calculate total wallet score
export function calculateTotalScore(
  wallet: WalletModel,
  trades: TradeModel[]
): WalletModel {
  // Ensure stats are available
  if (!wallet.stats) {
    wallet.stats = {
      roi_day: 0,
      roi_week: 0,
      roi_month: 0,
      roi_allTime: 0,
      pnl_day: 0,
      pnl_week: 0,
      pnl_month: 0,
      pnl_allTime: 0,
      volume_day: 0,
      volume_week: 0,
      volume_month: 0,
      volume_allTime: 0,
    };
  }

  // Calculate win rate if not available
  if (!wallet.stats.win_rate) {
    const winningTrades = trades.filter((t) => t.closed_pnl > 0).length;
    wallet.stats.win_rate =
      trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  }

  // Calculate total trades if not available
  if (!wallet.stats.total_trades) {
    wallet.stats.total_trades = trades.length;
  }

  // Calculate component scores
  const roiScore = calculateRoiScore(wallet.stats.roi_month);
  const winRateScore = calculateWinRateScore(trades);
  const pnlPerTradeScore = calculateAvgPnlScore(trades);
  const leverageScore = calculateLeverageScore(wallet.positions || []);
  const drawdownScore = calculateDrawdownScore(trades);
  const consistencyScore = calculateConsistencyScore(trades);
  const frequencyScore = calculateFrequencyScore(trades);
  const postLossScore = calculatePostLossScore(trades);
  const roiTrendScore = calculateRoiTrendScore(
    wallet.stats.roi_day,
    wallet.stats.roi_month
  );

  // Calculate total score
  const totalScore = Math.round(
    roiScore +
      winRateScore +
      pnlPerTradeScore +
      leverageScore +
      drawdownScore +
      consistencyScore +
      frequencyScore +
      postLossScore +
      roiTrendScore
  );

  // Update wallet with score components
  wallet.score = {
    total: totalScore,
    components: {
      roi_30d: Math.round(roiScore),
      win_rate: Math.round(winRateScore),
      pnl_per_trade: Math.round(pnlPerTradeScore),
      leverage_avg: Math.round(leverageScore),
      drawdown: Math.round(drawdownScore),
      consistency: Math.round(consistencyScore),
      frequency: Math.round(frequencyScore),
      post_loss: Math.round(postLossScore),
      roi_trend: Math.round(roiTrendScore),
    },
  };

  return wallet;
}
