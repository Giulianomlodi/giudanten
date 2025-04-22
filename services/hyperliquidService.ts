import {
  LeaderboardResponse,
  WalletDetailsResponse,
  TradeHistoryResponse,
  WalletDetailsRequest,
  TradeHistoryRequest
} from "../types/hyperliquid";

// API endpoints
export const LEADERBOARD_API = "https://api.hyperliquid.xyz/info";
export const INFO_API = "https://api.hyperliquid.xyz/info";

// Importazione corretta di Bottleneck
import Bottleneck from 'bottleneck';

// Rate limiters per le API
export const leaderboardLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000 // 1 richiesta al secondo
});

export const infoLimiter = new Bottleneck({
  maxConcurrent: 2,
  minTime: 500 // 2 richieste al secondo
});

// 3. Correzione dell'API di Hyperliquid

// Modifichiamo il file `hyperliquidService.ts` per risolvere il problema con l'API:
export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  // Usa schedule invece di wait
  return leaderboardLimiter.schedule(async () => {
    try {
      console.log("Fetching leaderboard data...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondi timeout
      
      // Modifica qui: rimuovi il parametro window o usa un valore valido
      const response = await fetch(LEADERBOARD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Origin": "https://hyperliquid.xyz",
          "Referer": "https://hyperliquid.xyz/"
        },
        body: JSON.stringify({ 
          type: "leaderboard"
          // Rimosso il parametro window che causava l'errore 422
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Leaderboard API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Verifica del formato dei dati
      if (!data || !data.leaderboardRows || !Array.isArray(data.leaderboardRows)) {
        throw new Error('Invalid leaderboard data format');
      }
      
      console.log(`Fetched ${data.leaderboardRows.length} leaderboard entries`);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Leaderboard API request timed out");
        throw new Error("Leaderboard API request timed out after 30 seconds");
      }
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  });
}

export async function fetchWalletDetails(
  address: string
): Promise<WalletDetailsResponse> {
  // Usa schedule invece di wait
  return infoLimiter.schedule(async () => {
    try {
      console.log(`Fetching wallet details for ${address}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondi timeout
      
      const payload: WalletDetailsRequest = {
        type: "clearinghouseState",
        user: address,
      };

      const response = await fetch(INFO_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Wallet details API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Verifica che i dati siano nel formato atteso
      if (!data || !data.marginSummary) {
        throw new Error(`Invalid wallet details format for ${address}`);
      }
      
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Wallet details API request for ${address} timed out`);
        throw new Error(`Wallet details API request for ${address} timed out after 15 seconds`);
      }
      console.error(`Error fetching wallet details for ${address}:`, error);
      throw error;
    }
  });
}

export async function fetchTradeHistory(
  address: string,
  startTime: number
): Promise<TradeHistoryResponse> {
  // Usa schedule invece di wait
  return infoLimiter.schedule(async () => {
    try {
      console.log(`Fetching trade history for ${address}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondi timeout
      
      const payload: TradeHistoryRequest = {
        type: "userFills",
        user: address,
        startTime: startTime,
      };

      const response = await fetch(INFO_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Trade history API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Verifica che i dati siano nel formato atteso
      if (!data || !data.fills || !Array.isArray(data.fills)) {
        throw new Error(`Invalid trade history format for ${address}`);
      }
      
      console.log(`Fetched ${data.fills.length} trades for ${address}`);
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Trade history API request for ${address} timed out`);
        throw new Error(`Trade history API request for ${address} timed out after 15 seconds`);
      }
      console.error(`Error fetching trade history for ${address}:`, error);
      throw error;
    }
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let retries = 0;
  let lastError: Error;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      retries++;
      
      // Se è un errore di timeout, aggiungi più ritardo
      const isTimeout = error.message && error.message.includes('timed out');
      
      if (retries >= maxRetries) {
        console.error(`Failed after ${maxRetries} retries:`, error);
        throw error;
      }

      // Exponential backoff with jitter
      const delay = initialDelay * Math.pow(2, retries) * (0.5 + Math.random() * 0.5);
      console.log(`Retrying after ${delay}ms (${retries}/${maxRetries}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Rimuovo le righe duplicate
