// API Response Types
export interface LeaderboardResponse {
  leaderboardRows: LeaderboardRow[];
}

export interface LeaderboardRow {
  ethAddress: string;
  accountValue: string;
  windowPerformances: [string, WindowPerformance][];
  prize: number;
  displayName: string | null;
}

export interface WindowPerformance {
  pnl: string;
  roi: string;
  vlm: string;
}

export interface WalletDetailsResponse {
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  crossMaintenanceMarginUsed: string;
  withdrawable: string;
  assetPositions: AssetPosition[];
  time: number;
}

export interface MarginSummary {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
}

export interface AssetPosition {
  type: string;
  position: Position;
}

export interface Position {
  coin: string;
  szi: string;
  leverage: {
    type: string;
    value: number;
  };
  entryPx: string;
  positionValue: string;
  unrealizedPnl: string;
  returnOnEquity: string;
  liquidationPx: string;
  marginUsed: string;
  maxLeverage: number;
  cumFunding: {
    allTime: string;
    sinceOpen: string;
    sinceChange: string;
  };
}

export interface TradeHistoryResponse {
  fills: Trade[];
}

export interface Trade {
  coin: string;
  px: number;
  sz: number;
  side: "B" | "S"; // Buy or Sell
  time: number;
  leverage: number;
  closedPnl: number;
}

// Database Models
export interface WalletModel {
  _id: string; // ETH address
  lastUpdated: Date;
  accountValue: number;
  displayName?: string | null;
  withdrawable?: number;
  stats: {
    roi_day: number;
    roi_week: number;
    roi_month: number;
    roi_allTime: number;
    pnl_day: number;
    pnl_week: number;
    pnl_month: number;
    pnl_allTime: number;
    volume_day: number;
    volume_week: number;
    volume_month: number;
    volume_allTime: number;
    total_trades?: number;
    win_rate?: number;
  };
  score?: {
    total: number;
    components: {
      roi_30d: number;
      win_rate: number;
      pnl_per_trade: number;
      leverage_avg: number;
      drawdown: number;
      consistency: number;
      frequency: number;
      post_loss: number;
      roi_trend: number;
    };
  };
  tags?: {
    style?: string;
    behavior?: string;
    time_pattern?: string;
    utc_zone?: string;
    continent?: string;
    asset_focus?: string;
    directional_bias?: string;
    direction_percent?: string;
  };
  positions?: WalletPosition[];
  qualified?: boolean;
  copy_mode?: string;
  limits?: {
    max_leverage: number;
    max_position_pct: number;
  };
}

export interface WalletPosition {
  coin: string;
  size: number;
  leverage: number;
  entry_price: number;
  position_value: number;
  unrealized_pnl: number;
  roi: number;
  margin_used: number;
}

export interface TradeModel {
  _id?: string;
  wallet: string;
  coin: string;
  side: string;
  size: number;
  price: number;
  timestamp: Date;
  leverage: number;
  closed_pnl: number;
  type: string;
  trade_value_usd: number;
}

export interface PortfolioModel {
  _id?: string;
  created_at: Date;
  wallets: PortfolioWallet[];
  meta: {
    style_distribution: Record<string, number>;
    region_distribution: Record<string, number>;
    directional_bias_distribution?: Record<string, number>;
    time_pattern_distribution?: Record<string, number>;
  };
}

export interface PortfolioWallet {
  wallet: string;
  score: number;
  tags: string[];
  copy_mode: string;
}

// Request Types
export interface WalletDetailsRequest {
  type: "clearinghouseState";
  user: string;
}

export interface TradeHistoryRequest {
  type: "userFills";
  user: string;
  startTime: number;
}

// Qualification Types
export interface QualificationResult {
  wallet: string;
  score: number;
  qualified: boolean;
  reason: string | string[];
}

// Copy Mode Types
export interface CopyModeAssignment {
  wallet: string;
  score: number;
  assigned_mode: string;
  limits: {
    max_leverage: number;
    max_position_pct: number;
  };
}
