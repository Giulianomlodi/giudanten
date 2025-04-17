// URL constants
export const HYPERDASH_LEADERBOARD = "https://hyperdash.info/top-traders";
export const WALLET_DETAIL_BASE = "https://hyperdash.info/trader/";
export const TOP_WALLETS_TO_SCRAPE = 30;

// Scoring weights
export const SCORING_WEIGHTS = {
  ROI_30D: 0.25, // 25%
  WIN_RATE: 0.15, // 15%
  AVG_PNL_PER_TRADE: 0.1, // 10%
  AVG_LEVERAGE: 0.1, // 10%
  ESTIMATED_DRAWDOWN: 0.15, // 15%
  TRADING_CONSISTENCY: 0.1, // 10%
  TRADE_FREQUENCY: 0.05, // 5%
  POST_LOSS_BEHAVIOR: 0.05, // 5%
  ROI_TREND: 0.05, // 5%
};

// Qualification criteria
export const QUALIFICATION_CRITERIA = {
  MIN_TOTAL_TRADES: 30,
  MIN_ROI_30D: 5, // 5%
  MIN_WIN_RATE: 55, // 55%
  MAX_DRAWDOWN: 25, // 25%
  MIN_SCORE: 75, // Minimum score 75/100
};

// Copy mode thresholds
export const COPY_MODE_THRESHOLDS = {
  CONSERVATIVE: {
    MIN_SCORE: 85,
    MAX_LEVERAGE: 10,
    MAX_POSITION_SIZE: 2.5, // 2.5%
  },
  STANDARD: {
    MIN_SCORE: 75,
    MAX_LEVERAGE: 15,
    MAX_POSITION_SIZE: 5, // 5%
  },
  AGGRESSIVE: {
    MIN_SCORE: 70,
    MAX_LEVERAGE: 25,
    MAX_POSITION_SIZE: 10, // 10%
  },
};

// Portfolio settings
export const PORTFOLIO_SETTINGS = {
  MAX_WALLETS: 10,
};

// Automation schedule (in milliseconds)
export const AUTOMATION_SCHEDULE = {
  SCRAPING: 12 * 60 * 60 * 1000, // Every 12 hours
  SCORING: 24 * 60 * 60 * 1000, // Every 24 hours
  PORTFOLIO: 24 * 60 * 60 * 1000, // Every 24 hours
};
