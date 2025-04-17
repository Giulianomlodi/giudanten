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
  const wallets: Partial<WalletModel>[] = [];

  for (const row of leaderboardResponse.leaderboardRows) {
    const wallet: Partial<WalletModel> = {
      _id: row.ethAddress,
      lastUpdated: new Date(),
      accountValue: parseFloat(row.accountValue),
      displayName: row.displayName,
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
    for (const [timeWindow, metrics] of row.windowPerformances) {
      const windowKey = timeWindow as "day" | "week" | "month" | "allTime";

      if (wallet.stats) {
        wallet.stats[`roi_${windowKey}`] = parseFloat(metrics.roi);
        wallet.stats[`pnl_${windowKey}`] = parseFloat(metrics.pnl);
        wallet.stats[`volume_${windowKey}`] = parseFloat(metrics.vlm);
      }
    }

    wallets.push(wallet);
  }

  return wallets;
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
