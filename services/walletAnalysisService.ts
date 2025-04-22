import { TradeModel, WalletModel } from "@/types/hyperliquid";
import { assignBehaviorTags, evaluateProfitOrientation } from "@/utils/taggingEngine";
import { calculateTotalScore } from "@/utils/scoringEngine";
import { qualifyWallet } from "@/utils/qualificationFilter";
import { updateWalletWithCopyMode } from "@/utils/copyModeAssignment";
import { withRetry } from "@/services/hyperliquidService";

/**
 * Comprehensive wallet analysis service that processes wallet data
 * and returns enriched wallet information
 */
export async function analyzeWallet(
  walletData: WalletModel,
  trades: TradeModel[]
): Promise<WalletModel> {
  try {
    // Validazione input
    if (!walletData || !walletData._id) {
      throw new Error("Invalid wallet data provided");
    }
    
    // Assicurati che trades sia un array valido
    const validTrades = Array.isArray(trades) ? trades : [];
    
    // Crea una copia del wallet per evitare modifiche dirette all'oggetto originale
    const workingWallet = { ...walletData };
    
    // Step 1: Assign orientation tags
    const orientationTag = evaluateProfitOrientation(validTrades);
    if (orientationTag) {
      // Inizializza l'oggetto tags se non esiste
      if (!workingWallet.tags) {
        workingWallet.tags = {};
      }
      // Aggiungi il tag di orientamento
      workingWallet.tags.profit_orientation = orientationTag;
    }
    
    // Step 2: Assign advanced behavioral tags
    // Aggiorna i tag con quelli avanzati
    const updatedTags = assignBehaviorTags(workingWallet, validTrades);
    workingWallet.tags = { ...(workingWallet.tags || {}), ...updatedTags };
    
    // Step 3: Calculate performance scores
    const scoredWallet = calculateTotalScore(workingWallet, validTrades);
    
    // Step 4: Qualify wallet
    const qualification = qualifyWallet(scoredWallet, validTrades);
    scoredWallet.qualified = qualification.qualified;
    scoredWallet.qualification_reason = qualification.reason;
    
    // Step 5: Assign copy mode
    const finalWallet = updateWalletWithCopyMode(scoredWallet);
    
    return finalWallet;
  } catch (error) {
    console.error(`Error analyzing wallet ${walletData?._id || 'unknown'}:`, error);
    // Aggiungi un flag per indicare che l'analisi è fallita
    return {
      ...walletData,
      analysisError: true,
      analysisErrorMessage: error instanceof Error ? error.message : 'Unknown error'
    } as WalletModel;
  }
}

/**
 * Batch process multiple wallets with controlled concurrency
 * @param wallets Array of wallet models to analyze
 * @param tradesByWallet Record of trades indexed by wallet ID
 * @param concurrencyLimit Maximum number of wallets to process in parallel (default: 5)
 */
export async function batchAnalyzeWallets(
  wallets: WalletModel[],
  tradesByWallet: Record<string, TradeModel[]>,
  concurrencyLimit = 5
): Promise<WalletModel[]> {
  try {
    // Validazione input
    if (!Array.isArray(wallets)) {
      console.error("Invalid wallets array provided");
      return [];
    }
    
    const results: WalletModel[] = [];
    
    // Elabora i wallet in gruppi per controllare la concorrenza
    for (let i = 0; i < wallets.length; i += concurrencyLimit) {
      const batch = wallets.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(wallet => 
        // Utilizziamo withRetry per rendere più robusta l'analisi
        withRetry(() => analyzeWallet(wallet, tradesByWallet[wallet._id] || []))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  } catch (error) {
    console.error("Error in batch wallet analysis:", error);
    return wallets; // Restituisci i wallet originali in caso di errore
  }
}