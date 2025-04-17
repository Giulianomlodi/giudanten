import {
  LeaderboardResponse,
  WalletDetailsResponse,
  TradeHistoryResponse,
  WalletDetailsRequest,
  TradeHistoryRequest,
} from "../types/hyperliquid";

// API endpoints
const LEADERBOARD_API =
  "https://stats-data.hyperliquid.xyz/Mainnet/leaderboard";
const INFO_API = "https://api.hyperliquid.xyz/info";

// Rate limiter implementation
class RateLimiter {
  private callsPerSecond: number;
  private lastCallTime: number;

  constructor(callsPerSecond: number) {
    this.callsPerSecond = callsPerSecond;
    this.lastCallTime = 0;
  }

  async wait(): Promise<void> {
    const currentTime = Date.now();
    const timeSinceLast = currentTime - this.lastCallTime;
    const timeToWait = Math.max(0, 1000 / this.callsPerSecond - timeSinceLast);

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    this.lastCallTime = Date.now();
  }
}

// Create rate limiters for each API
const leaderboardLimiter = new RateLimiter(0.1); // 1 request per 10 seconds
const infoLimiter = new RateLimiter(2); // 2 requests per second

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  await leaderboardLimiter.wait();

  try {
    const response = await fetch(LEADERBOARD_API);

    if (!response.ok) {
      throw new Error(`Leaderboard API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}

export async function fetchWalletDetails(
  address: string
): Promise<WalletDetailsResponse> {
  await infoLimiter.wait();

  const requestBody: WalletDetailsRequest = {
    type: "clearinghouseState",
    user: address,
  };

  try {
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Wallet details API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching wallet details for ${address}:`, error);
    throw error;
  }
}

export async function fetchTradeHistory(
  address: string,
  startTime: number = Date.now() - 30 * 24 * 60 * 60 * 1000 // Default to 30 days ago
): Promise<TradeHistoryResponse> {
  await infoLimiter.wait();

  const requestBody: TradeHistoryRequest = {
    type: "userFills",
    user: address,
    startTime,
  };

  try {
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Trade history API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching trade history for ${address}:`, error);
    throw error;
  }
}

// Retry wrapper for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;

      if (retries >= maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay =
        initialDelay * Math.pow(2, retries) * (0.5 + Math.random() * 0.5);
      console.log(`Retrying after ${delay}ms (${retries}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
