import { WalletModel, TradeModel, WalletPosition } from "../types/hyperliquid";

/**
 * Calculates the average trade duration in hours
 */
function calculateAvgTradeDuration(trades: TradeModel[]): number {
  if (trades.length < 2) {
    return 0;
  }

  // Group trades by coin and side to estimate trade durations
  const tradeGroups: Record<string, TradeModel[]> = {};

  for (const trade of trades) {
    const key = `${trade.coin}_${trade.side}`;
    if (!tradeGroups[key]) {
      tradeGroups[key] = [];
    }
    tradeGroups[key].push(trade);
  }

  // Calculate durations for each group
  let totalDuration = 0;
  let pairCount = 0;

  for (const group of Object.values(tradeGroups)) {
    // Sort by timestamp
    group.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Calculate durations between consecutive trades
    for (let i = 1; i < group.length; i++) {
      const duration =
        (group[i].timestamp.getTime() - group[i - 1].timestamp.getTime()) /
        (1000 * 60 * 60); // in hours
      totalDuration += duration;
      pairCount++;
    }
  }

  return pairCount > 0 ? totalDuration / pairCount : 0;
}

/**
 * Calculates the time pattern of trades
 */
function calculateTimePattern(trades: TradeModel[]): {
  dayTrader: boolean;
  nightTrader: boolean;
  trader24h: boolean;
  peakHours: number[];
} {
  if (trades.length === 0) {
    return {
      dayTrader: false,
      nightTrader: false,
      trader24h: true,
      peakHours: [],
    };
  }

  // Count trades by hour (0-23)
  const hourCounts = Array(24).fill(0);
  let dayOpenCloseCount = 0;

  for (const trade of trades) {
    const hour = trade.timestamp.getUTCHours();
    hourCounts[hour]++;

    // Check if trade was opened and closed within same day
    // This is an approximation since we don't have exact open/close timestamps
    if (trade.closed_pnl !== 0) {
      dayOpenCloseCount++;
    }
  }

  // Find peak hours (6-hour window with highest activity)
  let maxTradeCount = 0;
  let peakStartHour = 0;

  for (let i = 0; i < 24; i++) {
    let windowCount = 0;
    for (let j = 0; j < 6; j++) {
      windowCount += hourCounts[(i + j) % 24];
    }

    if (windowCount > maxTradeCount) {
      maxTradeCount = windowCount;
      peakStartHour = i;
    }
  }

  // Generate peak hours array
  const peakHours = [];
  for (let i = 0; i < 6; i++) {
    peakHours.push((peakStartHour + i) % 24);
  }

  // Calculate night trading ratio (UTC 20:00-08:00)
  let nightTradeCount = 0;
  for (let hour = 20; hour < 24; hour++) {
    nightTradeCount += hourCounts[hour];
  }
  for (let hour = 0; hour < 8; hour++) {
    nightTradeCount += hourCounts[hour];
  }

  const nightTradeRatio = nightTradeCount / trades.length;

  // Calculate concentration in any 12-hour window
  let max12hCount = 0;
  for (let i = 0; i < 24; i++) {
    let windowCount = 0;
    for (let j = 0; j < 12; j++) {
      windowCount += hourCounts[(i + j) % 24];
    }
    max12hCount = Math.max(max12hCount, windowCount);
  }

  const concentration12h = max12hCount / trades.length;

  // Determine patterns
  const dayTraderRatio = dayOpenCloseCount / trades.length;

  return {
    dayTrader: dayTraderRatio > 0.9,
    nightTrader: nightTradeRatio > 0.6,
    trader24h: concentration12h < 0.6,
    peakHours,
  };
}

/**
 * Estimates trader's timezone and region based on trading patterns
 */
function estimateTimeZone(peakHours: number[]): {
  utcZone: string;
  continent: string;
} {
  if (peakHours.length === 0) {
    return { utcZone: "UTC_plus_0", continent: "unknown" };
  }

  // Calculate average peak hour (considering circular nature of hours)
  let sumSin = 0;
  let sumCos = 0;

  for (const hour of peakHours) {
    // Convert hour to radians (0h = 0, 24h = 2π)
    const angle = (hour / 24) * 2 * Math.PI;
    sumSin += Math.sin(angle);
    sumCos += Math.cos(angle);
  }

  // Calculate average angle
  const avgAngle = Math.atan2(sumSin, sumCos);

  // Convert back to hours (0-24)
  let avgHour = (avgAngle / (2 * Math.PI)) * 24;
  if (avgHour < 0) avgHour += 24;

  // Typical trading hours are usually 9am-5pm
  // So if avgHour is 12 (noon), that suggests UTC+0
  // We'll estimate timezone by how far avgHour is from noon
  const offsetFromNoon = avgHour - 12;
  // Round to nearest whole timezone
  const timezone = Math.round(offsetFromNoon);

  let utcZone =
    timezone >= 0 ? `UTC_plus_${timezone}` : `UTC_minus_${Math.abs(timezone)}`;

  // Estimate continent based on timezone
  let continent = "unknown";

  if (timezone >= 0 && timezone <= 3) {
    continent = "europe";
  } else if (timezone >= 5 && timezone <= 9) {
    continent = "asia";
  } else if (timezone >= 8 && timezone <= 12) {
    continent = "oceania";
  } else if (timezone >= -8 && timezone <= -4) {
    continent = "north_america";
  } else if (timezone >= -5 && timezone <= -3) {
    continent = "south_america";
  } else if (timezone >= 0 && timezone <= 4) {
    // Alternative assignment for Africa
    continent = "africa";
  }

  return { utcZone, continent };
}

/**
 * Assigns behavior tags to a wallet based on its trading behavior
 */
export function assignBehaviorTags(
  wallet: WalletModel,
  trades: TradeModel[]
): WalletModel {
  const positions = wallet.positions || [];

  // Create the tags object if it doesn't exist
  if (!wallet.tags) {
    wallet.tags = {};
  }

  // Calculate trade duration metrics
  const avgTradeDuration = calculateAvgTradeDuration(trades);

  // Assign style tag
  if (avgTradeDuration < 1) {
    wallet.tags.style = "scalper";
  } else if (avgTradeDuration <= 24) {
    wallet.tags.style = "swing";
  } else {
    // Approximation for trend follower
    // Ideally we'd check win rates in trending markets, but we don't have market context
    const longTrades = trades.filter((t) => t.type === "long");
    const longWinRate =
      longTrades.length > 0
        ? longTrades.filter((t) => t.closed_pnl > 0).length / longTrades.length
        : 0;

    if (longWinRate > 0.65) {
      wallet.tags.style = "trend_follower";
    } else {
      wallet.tags.style = "range_trader";
    }
  }

  // Calculate position sizing metrics
  if (positions.length > 0) {
    const totalPositionValue = positions.reduce(
      (sum, p) => sum + Math.abs(p.position_value),
      0
    );
    const positionSizes = positions.map(
      (p) => (Math.abs(p.position_value) / totalPositionValue) * 100
    );

    let positionSizeVariation = 0;
    if (positionSizes.length > 1) {
      const mean =
        positionSizes.reduce((sum, size) => sum + size, 0) /
        positionSizes.length;
      const squaredDiffs = positionSizes.map((size) =>
        Math.pow(size - mean, 2)
      );
      const variance =
        squaredDiffs.reduce((sum, sqDiff) => sum + sqDiff, 0) /
        squaredDiffs.length;
      positionSizeVariation = Math.sqrt(variance);
    }

    const maxPositionSize = Math.max(...positionSizes);
    const avgLeverage =
      positions.reduce((sum, p) => sum + p.leverage, 0) / positions.length;

    // Assign behavior tag
    if (positionSizeVariation < 20 && maxPositionSize < 30) {
      wallet.tags.behavior = "disciplined";
    } else if (avgLeverage > 15 || maxPositionSize > 30) {
      wallet.tags.behavior = "aggressive";
    } else {
      wallet.tags.behavior = "balanced";
    }

    // Trading frequency tag
    const tradesPerWeek = trades.length / (30 / 7); // Assuming 30 days of trade data
    if (tradesPerWeek < 5) {
      wallet.tags.behavior =
        wallet.tags.behavior === "disciplined"
          ? "disciplined_inactive"
          : "inactive";
    } else if (tradesPerWeek > 50) {
      wallet.tags.behavior =
        wallet.tags.behavior === "aggressive"
          ? "hyperactive_aggressive"
          : "hyperactive";
    }
  }

  // Time pattern analysis
  const timePatterns = calculateTimePattern(trades);

  if (timePatterns.dayTrader) {
    wallet.tags.time_pattern = "day_trader";
  } else if (timePatterns.nightTrader) {
    wallet.tags.time_pattern = "night_trader";
  } else if (timePatterns.trader24h) {
    wallet.tags.time_pattern = "24h_operator";
  } else {
    wallet.tags.time_pattern = "regular_hours";
  }

  // Timezone and region estimation
  const { utcZone, continent } = estimateTimeZone(timePatterns.peakHours);
  wallet.tags.utc_zone = utcZone;
  wallet.tags.continent = continent;

  // Asset focus
  if (positions.length > 0) {
    const totalPositionValue = positions.reduce(
      (sum, p) => sum + Math.abs(p.position_value),
      0
    );
    const assetDistribution: Record<string, number> = {};

    for (const position of positions) {
      const coin = position.coin;
      if (!assetDistribution[coin]) {
        assetDistribution[coin] = 0;
      }
      assetDistribution[coin] +=
        (Math.abs(position.position_value) / totalPositionValue) * 100;
    }

    if (assetDistribution["BTC"] && assetDistribution["BTC"] > 70) {
      wallet.tags.asset_focus = "btc_focused";
    } else if (assetDistribution["ETH"] && assetDistribution["ETH"] > 70) {
      wallet.tags.asset_focus = "eth_focused";
    } else if (
      (!assetDistribution["BTC"] || assetDistribution["BTC"] < 30) &&
      (!assetDistribution["ETH"] || assetDistribution["ETH"] < 30)
    ) {
      wallet.tags.asset_focus = "altcoin_hunter";
    } else {
      wallet.tags.asset_focus = "diversified";
    }
  }

  // Directional bias
  const longValue = positions
    .filter((p) => p.size > 0)
    .reduce((sum, p) => sum + p.position_value, 0);

  const shortValue = positions
    .filter((p) => p.size < 0)
    .reduce((sum, p) => sum + Math.abs(p.position_value), 0);

  const totalValue = longValue + shortValue;

  if (totalValue > 0) {
    const longPercent = (longValue / totalValue) * 100;
    const shortPercent = (shortValue / totalValue) * 100;

    if (longPercent > 65) {
      wallet.tags.directional_bias = "long_dominant";
    } else if (shortPercent > 65) {
      wallet.tags.directional_bias = "short_dominant";
    } else {
      wallet.tags.directional_bias = "balanced_positioning";
    }

    wallet.tags.direction_percent = `long_${Math.round(
      longPercent
    )}_short_${Math.round(shortPercent)}`;
  }

  return wallet;
}
