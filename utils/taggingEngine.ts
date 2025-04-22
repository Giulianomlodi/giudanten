import { WalletModel, TradeModel, WalletPosition } from "../types/hyperliquid";

// Funzione helper per validare gli input
function validateTradesInput(trades: TradeModel[] | undefined): TradeModel[] {
  return Array.isArray(trades) ? trades.filter(trade => trade && trade.timestamp) : [];
}

// Funzione helper per esecuzione sicura
function safeExecute<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn();
  } catch (error) {
    console.error("Error in tagging engine:", error);
    return defaultValue;
  }
}

/**
 * Evaluates the profit orientation of a trader based on their trade history
 */
export function evaluateProfitOrientation(trades: TradeModel[]): string | null {
  let longProfit = 0;
  let shortProfit = 0;
  let longCount = 0;
  let shortCount = 0;
  
  for (const trade of trades) {
    if (!trade || typeof trade.closed_pnl !== 'number' || !trade.side) continue;
    if (trade.side === 'long') {
      longProfit += trade.closed_pnl;
      longCount++;
    }
    if (trade.side === 'short') {
      shortProfit += trade.closed_pnl;
      shortCount++;
    }
  }
  
  const total = Math.abs(longProfit) + Math.abs(shortProfit);
  if (total === 0) return null;
  
  const longRatio = longProfit / total;
  const longCountRatio = longCount / (longCount + shortCount);
  
  // Consider both profit ratio and trade count ratio
  if (longRatio > 0.65 && longCountRatio > 0.5) return 'profitable_long';
  if (longRatio < 0.35 && longCountRatio < 0.5) return 'profitable_short';
  
  // Check for specialized cases
  if (longRatio > 0.65 && longCountRatio < 0.5) return 'efficient_long';
  if (longRatio < 0.35 && longCountRatio > 0.5) return 'efficient_short';
  
  return 'balanced_trader';
}

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
    if (!trade.coin || !trade.side) continue;
    
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
  const validTrades = validateTradesInput(trades);
  if (validTrades.length === 0) {
    return {
      dayTrader: false,
      nightTrader: false,
      trader24h: true,
      peakHours: [],
    };
  }

  // Inizializza contatori
  const hourCounts = Array(24).fill(0);
  let dayOpenCloseCount = 0;
  let nightTradeCount = 0;
  
  // Calcola tutto in un'unica iterazione
  for (const trade of validTrades) {
    const hour = trade.timestamp.getUTCHours();
    hourCounts[hour]++;
    
    if (hour >= 20 || hour < 8) {
      nightTradeCount++;
    }
    
    if (trade.closed_pnl !== 0) {
      dayOpenCloseCount++;
    }
  }
  
  // Ottimizzazione: precalcola le somme per finestre scorrevoli
  // Questo riduce la complessità da O(24*12) a O(24)
  const windowSums6h = Array(24).fill(0);
  const windowSums12h = Array(24).fill(0);
  
  // Calcola la somma iniziale per la prima finestra
  for (let i = 0; i < 6; i++) {
    windowSums6h[0] += hourCounts[i];
  }
  for (let i = 0; i < 12; i++) {
    windowSums12h[0] += hourCounts[i];
  }
  
  // Calcola le somme per le finestre successive in modo efficiente
  for (let i = 1; i < 24; i++) {
    // Per finestra 6h: aggiungi nuovo valore, rimuovi quello che esce
    windowSums6h[i] = windowSums6h[i-1] - hourCounts[(i-1) % 24] + hourCounts[(i+5) % 24];
    
    // Per finestra 12h: aggiungi nuovo valore, rimuovi quello che esce
    windowSums12h[i] = windowSums12h[i-1] - hourCounts[(i-1) % 24] + hourCounts[(i+11) % 24];
  }
  
  // Trova il massimo
  let maxTradeCount = 0;
  let peakStartHour = 0;
  let max12hCount = 0;
  
  for (let i = 0; i < 24; i++) {
    if (windowSums6h[i] > maxTradeCount) {
      maxTradeCount = windowSums6h[i];
      peakStartHour = i;
    }
    max12hCount = Math.max(max12hCount, windowSums12h[i]);
  }
  
  // Genera peak hours
  const peakHours = Array.from({length: 6}, (_, i) => (peakStartHour + i) % 24);
  
  // Calcola i rapporti
  const nightTradeRatio = nightTradeCount / validTrades.length;
  const concentration12h = max12hCount / validTrades.length;
  const dayTraderRatio = dayOpenCloseCount / validTrades.length;
  
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
  if (!peakHours || peakHours.length === 0) {
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
  const offsetFromNoon = avgHour - 12;
  // Round to nearest whole timezone
  const timezone = Math.round(offsetFromNoon);

  // Limita il timezone a valori realistici (-12 a +14)
  const boundedTimezone = Math.max(-12, Math.min(14, timezone));
  
  let utcZone =
    boundedTimezone >= 0 ? `UTC_plus_${boundedTimezone}` : `UTC_minus_${Math.abs(boundedTimezone)}`;

  // Mappa più precisa dei continenti in base ai fusi orari
  let continent = "unknown";
  
  if (boundedTimezone >= -1 && boundedTimezone <= 3) {
    continent = "europe";
  } else if (boundedTimezone >= 5 && boundedTimezone <= 9) {
    continent = "asia";
  } else if (boundedTimezone >= 8 && boundedTimezone <= 12) {
    continent = "oceania";
  } else if (boundedTimezone >= -8 && boundedTimezone <= -4) {
    continent = "north_america";
  } else if (boundedTimezone >= -5 && boundedTimezone <= -3) {
    continent = "south_america";
  } else if (boundedTimezone >= 0 && boundedTimezone <= 4) {
    // Controllo aggiuntivo per l'Africa
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
  // Validazione input
  const validTrades = validateTradesInput(trades);
  
  // Crea una copia superficiale del wallet e una copia profonda solo dei tags
  const result = { 
    ...wallet,
    tags: { ...(wallet.tags || {}) }
  };
  
  const positions = result.positions || [];
  
  // Evaluate profit orientation and add as a tag
  const orientationTag = evaluateProfitOrientation(validTrades);
  if (orientationTag) {
    result.tags.profit_orientation = orientationTag;
  }

  // Calculate trade duration metrics
  const avgTradeDuration = calculateAvgTradeDuration(validTrades);

  // Assign style tag
  if (avgTradeDuration < 1) {
    result.tags.style = "scalper";
  } else if (avgTradeDuration <= 24) {
    result.tags.style = "swing";
  } else {
    // Calcola il win rate solo per i trade long
    const longTrades = validTrades.filter((t) => t.type === "long");
    const longWinRate =
      longTrades.length > 0
        ? longTrades.filter((t) => t.closed_pnl > 0).length / longTrades.length
        : 0;

    result.tags.style = longWinRate > 0.65 ? "trend_follower" : "range_trader";
  }

  // Calcola le metriche di posizionamento
  if (positions.length > 0) {
    // Calcola tutte le metriche in un'unica iterazione
    let totalPositionValue = 0;
    let totalLeverage = 0;
    const assetDistribution: Record<string, number> = {};
    let longValue = 0;
    let shortValue = 0;
    
    // Prima iterazione: calcola i totali
    for (const p of positions) {
      const posValue = Math.abs(p.position_value || 0);
      totalPositionValue += posValue;
      totalLeverage += (p.leverage || 0);
      
      // Accumula per asset
      const coin = p.coin;
      if (!assetDistribution[coin]) {
        assetDistribution[coin] = 0;
      }
      assetDistribution[coin] += posValue;
      
      // Accumula per direzione
      if (p.size > 0) {
        longValue += (p.position_value || 0);
      } else if (p.size < 0) {
        shortValue += Math.abs(p.position_value || 0);
      }
    }
    
    // Evita divisione per zero
    if (totalPositionValue > 0) {
      // Calcola le percentuali per ogni asset
      for (const coin in assetDistribution) {
        assetDistribution[coin] = (assetDistribution[coin] / totalPositionValue) * 100;
      }
      
      // Calcola le dimensioni delle posizioni
      const positionSizes = positions.map(
        (p) => (Math.abs(p.position_value || 0) / totalPositionValue) * 100
      );

      let positionSizeVariation = 0;
      if (positionSizes.length > 1) {
        const mean = positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;
        const squaredDiffs = positionSizes.map((size) => Math.pow(size - mean, 2));
        const variance = squaredDiffs.reduce((sum, sqDiff) => sum + sqDiff, 0) / squaredDiffs.length;
        positionSizeVariation = Math.sqrt(variance);
      }

      const maxPositionSize = positionSizes.length > 0 ? Math.max(...positionSizes) : 0;
      const avgLeverage = positions.length > 0 ? totalLeverage / positions.length : 0;

      // Assign behavior tag
      if (positionSizeVariation < 20 && maxPositionSize < 30) {
        result.tags.behavior = "disciplined";
      } else if (avgLeverage > 15 || maxPositionSize > 30) {
        result.tags.behavior = "aggressive";
      } else {
        result.tags.behavior = "balanced";
      }

      // Trading frequency tag - calcola in base ai dati disponibili
      const daysOfData = validTrades.length > 0 ? 
        (Math.max(...validTrades.map(t => t.timestamp.getTime())) - 
         Math.min(...validTrades.map(t => t.timestamp.getTime()))) / (1000 * 60 * 60 * 24) : 30;
      
      const tradesPerWeek = daysOfData > 0 ? (validTrades.length / daysOfData) * 7 : 0;
      
      if (tradesPerWeek < 5) {
        result.tags.behavior = result.tags.behavior === "disciplined" ? "disciplined_inactive" : "inactive";
      } else if (tradesPerWeek > 50) {
        result.tags.behavior = result.tags.behavior === "aggressive" ? "hyperactive_aggressive" : "hyperactive";
      }
      
      // Asset focus
      if (assetDistribution["BTC"] && assetDistribution["BTC"] > 70) {
        result.tags.asset_focus = "btc_focused";
      } else if (assetDistribution["ETH"] && assetDistribution["ETH"] > 70) {
        result.tags.asset_focus = "eth_focused";
      } else if (
        (!assetDistribution["BTC"] || assetDistribution["BTC"] < 30) &&
        (!assetDistribution["ETH"] || assetDistribution["ETH"] < 30)
      ) {
        result.tags.asset_focus = "altcoin_hunter";
      } else {
        result.tags.asset_focus = "diversified";
      }
      
      // Directional bias
      const totalValue = longValue + shortValue;

      if (totalValue > 0) {
        const longPercent = (longValue / totalValue) * 100;
        const shortPercent = (shortValue / totalValue) * 100;

        if (longPercent > 65) {
          result.tags.directional_bias = "long_dominant";
        } else if (shortPercent > 65) {
          result.tags.directional_bias = "short_dominant";
        } else {
          result.tags.directional_bias = "balanced_positioning";
        }

        result.tags.direction_percent = `long_${Math.round(longPercent)}_short_${Math.round(shortPercent)}`;
      }
    }
  }

  // Time pattern analysis
  const timePatterns = calculateTimePattern(validTrades);

  if (timePatterns.dayTrader) {
    result.tags.time_pattern = "day_trader";
  } else if (timePatterns.nightTrader) {
    result.tags.time_pattern = "night_trader";
  } else if (timePatterns.trader24h) {
    result.tags.time_pattern = "24h_operator";
  } else {
    result.tags.time_pattern = "regular_hours";
  }

  // Add market session analysis
  const sessionTags = analyzeMarketSessions(validTrades);
  if (sessionTags.length > 0) {
    result.tags.market_sessions = sessionTags.join(',');
  }

  // Timezone and region estimation
  const { utcZone, continent } = estimateTimeZone(timePatterns.peakHours);
  result.tags.utc_zone = utcZone;
  result.tags.continent = continent;

  return result;
}

/**
 * Analyzes trade timing patterns to identify market session preferences
 */
function analyzeMarketSessions(trades: TradeModel[]): string[] {
  const validTrades = validateTradesInput(trades);
  if (validTrades.length === 0) return [];
  
  // Usa un oggetto per contare le sessioni
  const sessions = { asia: 0, europe: 0, us: 0 };
  const total = validTrades.length;
  
  for (const trade of validTrades) {
    const hour = trade.timestamp.getUTCHours();
    
    // Assegna a una sessione in un'unica valutazione
    if (hour < 8) sessions.asia++;
    else if (hour < 16) sessions.europe++;
    else sessions.us++;
  }
  
  // Calcola le percentuali una sola volta
  const percentages = {
    asia: sessions.asia / total,
    europe: sessions.europe / total,
    us: sessions.us / total
  };
  
  // Genera i tag in base alle percentuali
  const sessionTags: string[] = [];
  
  // Sessioni dominanti (>60%)
  if (percentages.asia > 0.6) sessionTags.push('asia_session_dominant');
  if (percentages.europe > 0.6) sessionTags.push('europe_session_dominant');
  if (percentages.us > 0.6) sessionTags.push('us_session_dominant');
  
  // Sessioni preferite (>40%)
  if (sessionTags.length === 0) {
    if (percentages.asia > 0.4) sessionTags.push('asia_session_preferred');
    if (percentages.europe > 0.4) sessionTags.push('europe_session_preferred');
    if (percentages.us > 0.4) sessionTags.push('us_session_preferred');
  }
  
  // Trader multi-sessione
  if (sessionTags.length === 0) {
    sessionTags.push('multi_session_trader');
  }
  
  return sessionTags;
}
