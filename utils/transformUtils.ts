import {
  LeaderboardResponse,
  WalletDetailsResponse,
  TradeHistoryResponse,
  WalletModel,
  WalletPosition,
  TradeModel,
} from "../types/hyperliquid";

export function transformLeaderboardData(
  leaderboardResponse: LeaderboardResponse
): Partial<WalletModel>[] {
  // Verifica che i dati siano validi
  if (!leaderboardResponse || !leaderboardResponse.leaderboardRows) {
    console.error('Invalid leaderboard data format:', leaderboardResponse);
    return [];
  }

  try {
    const wallets: Partial<WalletModel>[] = [];

    for (const row of leaderboardResponse.leaderboardRows) {
      // Verifica che i campi essenziali esistano
      if (!row.ethAddress) {
        console.warn('Skipping leaderboard row without ethAddress:', row);
        continue;
      }

      try {
        const wallet: Partial<WalletModel> = {
          _id: row.ethAddress,
          lastUpdated: new Date(),
          accountValue: parseFloat(row.accountValue || '0'),
          displayName: row.displayName || null,
          stats: {
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
          },
        };

        // Process window performances
        if (row.windowPerformances && Array.isArray(row.windowPerformances)) {
          for (const [timeWindow, metrics] of row.windowPerformances) {
            if (!timeWindow || !metrics) continue;
            
            const windowKey = timeWindow as "day" | "week" | "month" | "allTime";

            if (wallet.stats) {
              try {
                wallet.stats[`roi_${windowKey}`] = parseFloat(metrics.roi || '0');
                wallet.stats[`pnl_${windowKey}`] = parseFloat(metrics.pnl || '0');
                wallet.stats[`volume_${windowKey}`] = parseFloat(metrics.vlm || '0');
              } catch (parseError) {
                console.warn(`Error parsing metrics for ${row.ethAddress}, window ${timeWindow}:`, parseError);
                // Continua con i valori predefiniti
              }
            }
          }
        }

        wallets.push(wallet);
      } catch (rowError) {
        console.error(`Error processing leaderboard row for ${row.ethAddress}:`, rowError);
        // Continua con la prossima riga
      }
    }

    console.log(`Successfully transformed ${wallets.length} wallets from leaderboard data`);
    return wallets;
  } catch (error) {
    console.error('Error transforming leaderboard data:', error);
    return [];
  }
}

export function transformWalletDetails(
  walletDetails: WalletDetailsResponse,
  walletId: string
): Partial<WalletModel> {
  // Extract margin summary
  const marginSummary = walletDetails.marginSummary;
  const accountValue = parseFloat(marginSummary.accountValue);

  // Extract positions
  const positions: WalletPosition[] = [];

  for (const assetPosition of walletDetails.assetPositions) {
    const positionData = assetPosition.position;
    const size = parseFloat(positionData.szi);

    const leverageInfo = positionData.leverage;
    const leverageValue = leverageInfo.value;

    const position: WalletPosition = {
      coin: positionData.coin,
      size: size,
      leverage: leverageValue,
      entry_price: parseFloat(positionData.entryPx),
      position_value: parseFloat(positionData.positionValue),
      unrealized_pnl: parseFloat(positionData.unrealizedPnl),
      roi: parseFloat(positionData.returnOnEquity),
      margin_used: parseFloat(positionData.marginUsed),
    };

    positions.push(position);
  }

  return {
    _id: walletId,
    lastUpdated: new Date(walletDetails.time),
    accountValue: accountValue,
    withdrawable: parseFloat(walletDetails.withdrawable),
    positions: positions,
  };
}

export function transformTradeHistory(
  tradeHistory: TradeHistoryResponse,
  walletId: string
): TradeModel[] {
  const trades: TradeModel[] = [];

  for (const fill of tradeHistory.fills) {
    const side = fill.side;
    const tradeType = side === "B" ? "long" : "short";
    const size = fill.sz;
    const price = fill.px;

    const trade: TradeModel = {
      wallet: walletId,
      coin: fill.coin,
      side: side,
      size: size,
      price: price,
      timestamp: new Date(fill.time),
      leverage: fill.leverage,
      closed_pnl: fill.closedPnl,
      type: tradeType,
      trade_value_usd: size * price,
    };

    trades.push(trade);
  }

  return trades;
}

// Funzione di fallback per gestire formati di dati alternativi
export function transformAlternativeLeaderboardFormat(data: any): Partial<WalletModel>[] {
  // Verifica che i dati siano validi
  if (!data || !data.leaderboard || !Array.isArray(data.leaderboard)) {
    console.error('Invalid alternative leaderboard data format:', data);
    return [];
  }
  
  try {
    return data.leaderboard.map((entry: any) => {
      // Verifica che l'entry sia valida
      if (!entry || !entry.address) {
        console.warn('Invalid leaderboard entry:', entry);
        return null;
      }
      
      return {
        _id: entry.address,
        displayName: entry.displayName || `Wallet_${entry.address.substring(0, 6)}`,
        accountValue: entry.accountValue || 0,
        lastUpdated: new Date(),
        stats: {
          pnl: entry.pnl || 0,
          volume: entry.volume || 0,
          // Altri campi statistici
        }
      };
    }).filter(Boolean); // Rimuovi gli elementi null
  } catch (error) {
    console.error('Error transforming alternative leaderboard data:', error);
    return [];
  }
}
