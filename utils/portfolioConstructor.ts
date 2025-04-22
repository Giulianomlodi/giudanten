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
        // Per market_sessions, dividiamo la stringa in tag individuali
        if (key === "market_sessions" && value.includes(',')) {
          tagArray.push(...value.split(','));
        } else {
          tagArray.push(value);
        }
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
  // Limitiamo il numero di wallet per migliorare le performance
  const maxWallets = 25;
  
  // Step 1: Get top wallets by score
  const topWallets = [...qualifiedWallets]
    .filter((w) => w.qualified)
    .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
    .slice(0, maxWallets);

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

  // Step 2: Calculate correlation matrix - ottimizzato
  const walletIds = topWallets.map((w) => w._id);
  
  // Ottimizzazione: calcoliamo la matrice di correlazione solo se abbiamo abbastanza wallet
  const correlationMatrix = walletIds.length > 1 
    ? calculateWalletCorrelations(walletIds, tradesByWallet)
    : {};

  // Step 3: Apply greedy algorithm with constraints
  const selectedWallets: WalletModel[] = [];
  const styleCounts: Record<string, number> = {};
  const regionCounts: Record<string, number> = {};
  const directionalBiasCounts: Record<string, number> = {};
  const timePatternCounts: Record<string, number> = {};

  // Ottimizzazione: limitiamo il numero di categorie da considerare
  const categories = ["style", "region", "directional_bias", "time_pattern"];
  
  // Ottimizzazione: selezioniamo direttamente i wallet migliori se ne abbiamo pochi
  if (topWallets.length <= 10) {
    // Se abbiamo pochi wallet, li includiamo tutti
    selectedWallets.push(...topWallets);
  } else {
    // First, ensure we have at least one wallet from each category
    for (const category of categories) {
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

      // Ottimizzazione: limitiamo il numero di valori per categoria
      const categoryEntries = Object.entries(categoryValues).slice(0, 5);
      
      for (const [catValue, wallets] of categoryEntries) {
        if (wallets.length === 0) continue;

        // Find highest scoring wallet in this category
        const bestWallet = wallets.reduce((best, current) =>
          (current.score?.total || 0) > (best.score?.total || 0)
            ? current
            : best
        );

        selectedWallets.push(bestWallet);

        // Update category counts
        if (category === "style") {
          styleCounts[catValue] = (styleCounts[catValue] || 0) + 1;
        } else if (category === "region") {
          regionCounts[catValue] = (regionCounts[catValue] || 0) + 1;
        } else if (category === "directional_bias") {
          directionalBiasCounts[catValue] =
            (directionalBiasCounts[catValue] || 0) + 1;
        } else if (category === "time_pattern") {
          timePatternCounts[catValue] = (timePatternCounts[catValue] || 0) + 1;
        }

        // Break after finding one wallet for this category
        break;
      }
    }

    // Then, add more wallets with low correlation to existing ones
    const maxWalletsInPortfolio = 15; // Limitiamo il numero massimo di wallet
    
    while (
      selectedWallets.length < maxWalletsInPortfolio &&
      selectedWallets.length < topWallets.length
    ) {
      const availableWallets = topWallets.filter(
        (w) => !selectedWallets.some((sw) => sw._id === w._id)
      );

      if (availableWallets.length === 0) {
        break;
      }

      // Find wallet with lowest average correlation to selected wallets
      let bestWallet: WalletModel | null = null;
      let lowestAvgCorrelation = 1;

      for (const wallet of availableWallets) {
        if (selectedWallets.length === 0) {
          // If no wallets selected yet, pick highest scoring one
          bestWallet = availableWallets.reduce((best, current) =>
            (current.score?.total || 0) > (best.score?.total || 0)
              ? current
              : best
          );
          break;
        }

        let totalCorrelation = 0;
        let correlationCount = 0;

        for (const selectedWallet of selectedWallets) {
          const correlation =
            correlationMatrix[wallet._id]?.[selectedWallet._id] || 0;
          totalCorrelation += Math.abs(correlation);
          correlationCount++;
        }

        const avgCorrelation =
          correlationCount > 0 ? totalCorrelation / correlationCount : 1;

        if (avgCorrelation < lowestAvgCorrelation) {
          lowestAvgCorrelation = avgCorrelation;
          bestWallet = wallet;
        }
      }

      if (bestWallet) {
        selectedWallets.push(bestWallet);

        // Update category counts
        const style = bestWallet.tags?.style;
        if (typeof style === "string" && style) {
          styleCounts[style] = (styleCounts[style] || 0) + 1;
        }

        const region = bestWallet.tags?.region;
        if (typeof region === "string" && region) {
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        }
      } else {
        break;
      }
    }
  }

  // Step 4: Calculate weights
  const totalScore = selectedWallets.reduce(
    (sum, w) => sum + (w.score?.total || 0),
    0
  );

  const portfolioWallets = selectedWallets.map((wallet) => {
    const weight = totalScore > 0 ? (wallet.score?.total || 0) / totalScore : 0;

    return {
      ...formatPortfolioEntry(wallet),
      weight: parseFloat(weight.toFixed(4)),
    };
  });

  // Step 5: Create portfolio object
  return {
    created_at: new Date(),
    wallets: portfolioWallets,
    meta: {
      style_distribution: styleCounts,
      region_distribution: regionCounts,
    },
  };
}

/**
 * Calculates tag distributions for a portfolio
 */
export function calculateTagDistributions(wallets: WalletModel[]): {
  style_distribution: Record<string, number>;
  region_distribution: Record<string, number>;
  directional_bias_distribution: Record<string, number>;
  time_pattern_distribution: Record<string, number>;
  profit_orientation_distribution: Record<string, number>;
  market_sessions_distribution: Record<string, number>;
} {
  const styleDistribution: Record<string, number> = {};
  const regionDistribution: Record<string, number> = {};
  const directionalBiasDistribution: Record<string, number> = {};
  const timePatternDistribution: Record<string, number> = {};
  const profitOrientationDistribution: Record<string, number> = {};
  const marketSessionsDistribution: Record<string, number> = {};

  for (const wallet of wallets) {
    if (wallet.tags) {
      // Add to style distribution
      if (wallet.tags.style) {
        styleDistribution[wallet.tags.style] = (styleDistribution[wallet.tags.style] || 0) + 1;
      }
      
      // Add to region distribution
      if (wallet.tags.continent) {
        regionDistribution[wallet.tags.continent] = (regionDistribution[wallet.tags.continent] || 0) + 1;
      }
      
      // Add to directional bias distribution
      if (wallet.tags.directional_bias) {
        directionalBiasDistribution[wallet.tags.directional_bias] = 
          (directionalBiasDistribution[wallet.tags.directional_bias] || 0) + 1;
      }
      
      // Add to time pattern distribution
      if (wallet.tags.time_pattern) {
        timePatternDistribution[wallet.tags.time_pattern] = 
          (timePatternDistribution[wallet.tags.time_pattern] || 0) + 1;
      }
      
      // Add to profit orientation distribution
      if (wallet.tags.profit_orientation) {
        profitOrientationDistribution[wallet.tags.profit_orientation] = 
          (profitOrientationDistribution[wallet.tags.profit_orientation] || 0) + 1;
      }
      
      // Add to market sessions distribution
      if (wallet.tags.market_sessions) {
        const sessions = wallet.tags.market_sessions.split(',');
        for (const session of sessions) {
          marketSessionsDistribution[session] = (marketSessionsDistribution[session] || 0) + 1;
        }
      }
    }
  }

  return {
    style_distribution: styleDistribution,
    region_distribution: regionDistribution,
    directional_bias_distribution: directionalBiasDistribution,
    time_pattern_distribution: timePatternDistribution,
    profit_orientation_distribution: profitOrientationDistribution,
    market_sessions_distribution: marketSessionsDistribution
  };
}

// Rinomina la seconda implementazione di constructPortfolio a constructPortfolioV2
export function constructPortfolioV2(
  // Mantieni gli stessi parametri della funzione originale
  wallets: WalletModel[],
  options: PortfolioOptions = {}
): PortfolioModel {
  // Mantieni la stessa implementazione
  // ...
}
