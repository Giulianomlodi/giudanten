import {
  WalletModel,
  TradeModel,
  QualificationResult,
} from "../types/hyperliquid";
import { calculateDrawdownScore } from "./scoringEngine";

/**
 * Qualifies a wallet based on predefined criteria
 * Criteria:
 * 1. At least 30 total trades
 * 2. ROI (month) ≥ 5%
 * 3. Win rate ≥ 55%
 * 4. Estimated drawdown ≤ 25%
 * 5. Score ≥ 75
 */
export function qualifyWallet(
  wallet: WalletModel,
  trades: TradeModel[]
): QualificationResult {
  const result: QualificationResult = {
    wallet: wallet._id,
    score: wallet.score?.total || 0,
    qualified: false,
    reason: [],
  };

  // Calculate needed metrics if not already available
  const totalTrades = wallet.stats?.total_trades || trades.length;
  const winRate =
    wallet.stats?.win_rate ||
    (trades.length > 0
      ? (trades.filter((t) => t.closed_pnl > 0).length / trades.length) * 100
      : 0);

  // Calculate drawdown
  const drawdownScore = calculateDrawdownScore(trades);
  const estimatedDrawdown = (15 - drawdownScore) / 0.6; // Reverse the score calculation

  // Check each criterion
  const reasons: string[] = [];

  if (totalTrades < 30) {
    reasons.push("Insufficient trade count");
  }

  if ((wallet.stats?.roi_month || 0) < 0.05) {
    reasons.push("30-day ROI below threshold");
  }

  if (winRate < 55) {
    reasons.push("Win rate below threshold");
  }

  if (estimatedDrawdown > 25) {
    reasons.push("Drawdown exceeds threshold");
  }

  if ((wallet.score?.total || 0) < 75) {
    reasons.push("Score below threshold");
  }

  // Qualify if all criteria are met
  if (reasons.length === 0) {
    result.qualified = true;
    result.reason = "All metrics passed";
  } else {
    result.reason = reasons;
  }

  return result;
}

// Apply qualification to multiple wallets
export function qualifyWallets(
  wallets: WalletModel[],
  tradesByWallet: Record<string, TradeModel[]>
): QualificationResult[] {
  return wallets.map((wallet) => {
    const walletTrades = tradesByWallet[wallet._id] || [];
    return qualifyWallet(wallet, walletTrades);
  });
}
