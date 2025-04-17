import { WalletModel, CopyModeAssignment } from "../types/hyperliquid";

/**
 * Assigns a copy mode to a wallet based on its score
 *
 * Conservative: Score >= 85, max leverage 10x, max position 2.5%
 * Standard: Score >= 75, max leverage 15x, max position 5%
 * Aggressive: Score < 75, max leverage 25x, max position 10%
 */
export function assignCopyMode(wallet: WalletModel): CopyModeAssignment {
  const score = wallet.score?.total || 0;
  let mode: string;
  let limits: { max_leverage: number; max_position_pct: number };

  if (score >= 85) {
    mode = "conservative";
    limits = { max_leverage: 10, max_position_pct: 2.5 };
  } else if (score >= 75) {
    mode = "standard";
    limits = { max_leverage: 15, max_position_pct: 5 };
  } else {
    mode = "aggressive";
    limits = { max_leverage: 25, max_position_pct: 10 };
  }

  return {
    wallet: wallet._id,
    score: score,
    assigned_mode: mode,
    limits: limits,
  };
}

/**
 * Updates a wallet with copy mode information
 */
export function updateWalletWithCopyMode(wallet: WalletModel): WalletModel {
  const { assigned_mode, limits } = assignCopyMode(wallet);

  return {
    ...wallet,
    copy_mode: assigned_mode,
    limits: limits,
  };
}

/**
 * Assigns copy modes to multiple wallets
 */
export function assignCopyModes(wallets: WalletModel[]): WalletModel[] {
  return wallets.map(updateWalletWithCopyMode);
}
