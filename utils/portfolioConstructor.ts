import {
  WalletModel,
  TradeModel,
  PortfolioModel,
  PortfolioWallet,
} from "../types/hyperliquid";

/**
 * Calculates correlation between daily PnL of wallets
 */
export function calculateWalletCorrelations(
  walletIds: string[],
  tradesByWallet: Record<string, TradeModel[]>
): Record<string, Record<string, number>> {
  // Group trades by wallet and day
  const dailyPnl: Record<string, Record<string, number>> = {};

  for (const walletId of walletIds) {
    dailyPnl[walletId] = {};
    const walletTrades = tradesByWallet[walletId] || [];

    for (const trade of walletTrades) {
      const day = trade.timestamp.toISOString().split("T")[0];
      if (!dailyPnl[walletId][day]) {
        dailyPnl[walletId][day] = 0;
      }
      dailyPnl[walletId][day] += trade.closed_pnl;
    }
  }

  // Calculate correlations
  const correlations: Record<string, Record<string, number>> = {};

  for (const wallet1 of walletIds) {
    correlations[wallet1] = {};

    for (const wallet2 of walletIds) {
      if (wallet1 === wallet2) {
        correlations[wallet1][wallet2] = 1; // Self-correlation is 1
        continue;
      }

      // Find common days
      const days1 = Object.keys(dailyPnl[wallet1]);
      const days2 = Object.keys(dailyPnl[wallet2]);
      const commonDays = days1.filter((day) => days2.includes(day));

      if (commonDays.length < 5) {
        // Not enough data for meaningful correlation
        correlations[wallet1][wallet2] = 0;
        continue;
      }

      // Calculate correlation
      const values1 = commonDays.map((day) => dailyPnl[wallet1][day]);
      const values2 = commonDays.map((day) => dailyPnl[wallet2][day]);

      const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length;
      const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length;

      let numerator = 0;
      let denom1 = 0;
      let denom2 = 0;

      for (let i = 0; i < commonDays.length; i++) {
        const diff1 = values1[i] - mean1;
        const diff2 = values2[i] - mean2;

        numerator += diff1 * diff2;
        denom1 += diff1 * diff1;
        denom2 += diff2 * diff2;
      }

      const denominator = Math.sqrt(denom1 * denom2);
      const correlation = denominator === 0 ? 0 : numerator / denominator;

      correlations[wallet1][wallet2] = correlation;
    }
  }

  return correlations;
}

/**
 * Formats a wallet for inclusion in a portfolio
 */
function formatPortfolioEntry(wallet: WalletModel): PortfolioWallet {
  // Extract relevant tags as an array
  const tagArray: string[] = [];
  if (wallet.tags) {
    for (const [key, value] of Object.entries(wallet.tags)) {
      if (typeof value === "string" && value !== "") {
        tagArray.push(value);
      }
    }
  }

  return {
    wallet: wallet._id,
    score: wallet.score?.total || 0,
    tags: tagArray,
    copy_mode: wallet.copy_mode || "standard",
  };
}

/**
 * Constructs a portfolio from qualified wallets
 * - Starts with top 25 qualified wallets by score
 * - Applies diversification rules
 * - Selects final 10 wallets optimizing for score and diversity
 */
export function constructPortfolio(
  qualifiedWallets: WalletModel[],
  tradesByWallet: Record<string, TradeModel[]>
): PortfolioModel {
  // Step 1: Get top 25 by score
  const topWallets = [...qualifiedWallets]
    .filter((w) => w.qualified)
    .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
    .slice(0, 25);

  if (topWallets.length === 0) {
    return {
      created_at: new Date(),
      wallets: [],
      meta: {
        style_distribution: {},
        region_distribution: {},
      },
    };
  }

  // Step 2: Calculate correlation matrix
  const walletIds = topWallets.map((w) => w._id);
  const correlationMatrix = calculateWalletCorrelations(
    walletIds,
    tradesByWallet
  );

  // Step 3: Apply greedy algorithm with constraints
  const selectedWallets: WalletModel[] = [];
  const styleCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};
  const directionalBiasCounts: Record<string, number> = {};
  const timePatternCounts: Record<string, number> = {};

  // First, ensure we have at least one wallet from each category
  for (const category of [
    "style",
    "region",
    "directional_bias",
    "time_pattern",
  ]) {
    const availableWallets = topWallets.filter(
      (w) => !selectedWallets.some((sw) => sw._id === w._id)
    );

    if (availableWallets.length === 0) {
      break;
    }

    const categoryValues: Record<string, WalletModel[]> = {};

    for (const wallet of availableWallets) {
      const catValue = wallet.tags?.[category as keyof typeof wallet.tags];

      if (typeof catValue === "string" && catValue) {
        if (!categoryValues[catValue]) {
          categoryValues[catValue] = [];
        }
        categoryValues[catValue].push(wallet);
      }
    }

    for (const [catValue, wallets] of Object.entries(categoryValues)) {
      if (wallets.length === 0) continue;

      // Find highest scoring wallet in this category
      const highestScoring = wallets.reduce(
        (best, current) =>
          (current.score?.total || 0) > (best.score?.total || 0)
            ? current
            : best,
        wallets[0]
      );

      if (!selectedWallets.some((w) => w._id === highestScoring._id)) {
        selectedWallets.push(highestScoring);

        // Update counts
        const style = highestScoring.tags?.style;
        if (style) {
          styleCounts[style] = (styleCounts[style] || 0) + 1;
        }

        const region = highestScoring.tags?.continent;
        if (region) {
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        }

        const bias = highestScoring.tags?.directional_bias;
        if (bias) {
          directionalBiasCounts[bias] = (directionalBiasCounts[bias] || 0) + 1;
        }

        const pattern = highestScoring.tags?.time_pattern;
        if (pattern) {
          timePatternCounts[pattern] = (timePatternCounts[pattern] || 0) + 1;
        }
      }

      if (selectedWallets.length >= 10) {
        break;
      }
    }

    if (selectedWallets.length >= 10) {
      break;
    }
  }

  // Fill remaining slots with highest scoring wallets that maintain diversity
  while (
    selectedWallets.length < 10 &&
    selectedWallets.length < topWallets.length
  ) {
    let bestCandidate: WalletModel | null = null;
    let bestScore = -1;

    for (const wallet of topWallets) {
      if (selectedWallets.some((w) => w._id === wallet._id)) {
        continue;
      }

      // Check constraints
      const style = wallet.tags?.style;
      if (style && (styleCounts[style] || 0) >= 3) {
        continue;
      }

      const region = wallet.tags?.continent;
      if (region && (regionCounts[region] || 0) >= 4) {
        continue;
      }

      // Calculate diversity score
      let diversityScore = (wallet.score?.total || 0) * 0.7;

      // Add correlation penalty
      for (const selected of selectedWallets) {
        const corr = correlationMatrix[wallet._id]?.[selected._id] || 0;
        diversityScore -= corr * 20; // Penalty for correlation
      }

      if (diversityScore > bestScore) {
        bestScore = diversityScore;
        bestCandidate = wallet;
      }
    }

    if (bestCandidate) {
      selectedWallets.push(bestCandidate);

      // Update counts
      const style = bestCandidate.tags?.style;
      if (style) {
        styleCounts[style] = (styleCounts[style] || 0) + 1;
      }

      const region = bestCandidate.tags?.continent;
      if (region) {
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      }

      const bias = bestCandidate.tags?.directional_bias;
      if (bias) {
        directionalBiasCounts[bias] = (directionalBiasCounts[bias] || 0) + 1;
      }

      const pattern = bestCandidate.tags?.time_pattern;
      if (pattern) {
        timePatternCounts[pattern] = (timePatternCounts[pattern] || 0) + 1;
      }
    } else {
      // No more candidates that meet criteria
      break;
    }
  }

  // Format output
  return {
    created_at: new Date(),
    wallets: selectedWallets.map(formatPortfolioEntry),
    meta: {
      style_distribution: styleCounts,
      region_distribution: regionCounts,
      directional_bias_distribution: directionalBiasCounts,
      time_pattern_distribution: timePatternCounts,
    },
  };
}
