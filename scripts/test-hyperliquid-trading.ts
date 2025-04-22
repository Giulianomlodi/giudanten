import fetch from 'node-fetch';

// Costanti
const EXCHANGE_API = "https://api.hyperliquid.xyz/exchange";
const INFO_API = "https://api.hyperliquid.xyz/info";

// Colori per l'output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};

// Funzione per stampare un titolo
function printTitle(title: string) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// Funzione per stampare un risultato
function printResult(test: string, passed: boolean, details?: string) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${icon} ${test}${colors.reset}${details ? `: ${details}` : ''}`);
  return passed;
}

// Test dell'API di Market Data
async function testMarketDataAPI() {
  printTitle("Test dell'API Market Data");
  
  try {
    console.log("Effettuo richiesta all'API Market Data...");
    
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "allMids" })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      return printResult("API Market Data", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Risposta ricevuta, analizzo il contenuto...");
    
    if (!data) {
      return printResult("API Market Data", false, "Risposta vuota");
    }
    
    if (!Array.isArray(data)) {
      console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
      return printResult("API Market Data", false, "Risposta non è un array");
    }
    
    console.log(`Numero di mercati: ${data.length}`);
    
    if (data.length > 0) {
      const firstMarket = data[0];
      console.log("Primo mercato:", JSON.stringify(firstMarket, null, 2));
      
      // Verifica i campi essenziali
      const hasEssentialFields = 
        firstMarket.coin !== undefined && 
        firstMarket.mid !== undefined;
      
      if (!hasEssentialFields) {
        return printResult("API Market Data", false, "Campi essenziali mancanti nella risposta");
      }
    }
    
    return printResult("API Market Data", true, `Ricevuti dati per ${data.length} mercati`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("API Market Data", false, error.message);
  }
}

// Test dell'API di Order Book
async function testOrderBookAPI() {
  printTitle("Test dell'API Order Book");
  
  try {
    // Prima otteniamo un simbolo valido
    console.log("Ottengo un simbolo valido...");
    
    const marketsResponse = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "metaAndAssetCtxs" })
    });
    
    if (!marketsResponse.ok) {
      return printResult("API Order Book", false, "Impossibile ottenere un simbolo di test");
    }
    
    const marketsData = await marketsResponse.json();
    if (!marketsData.universe || marketsData.universe.length === 0) {
      return printResult("API Order Book", false, "Nessun simbolo disponibile per il test");
    }
    
    const testSymbol = marketsData.universe[0].name;
    console.log(`Simbolo di test: ${testSymbol}`);
    
    console.log("Effettuo richiesta all'API Order Book...");
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        type: "l2Book",
        coin: testSymbol
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      return printResult("API Order Book", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Risposta ricevuta, analizzo il contenuto...");
    
    if (!data) {
      return printResult("API Order Book", false, "Risposta vuota");
    }
    
    if (!data.coin || !data.levels || !Array.isArray(data.levels.asks) || !Array.isArray(data.levels.bids)) {
      console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
      return printResult("API Order Book", false, "Struttura dell'order book non valida");
    }
    
    console.log(`Order book per ${data.coin}:`);
    console.log(`- Asks: ${data.levels.asks.length}`);
    console.log(`- Bids: ${data.levels.bids.length}`);
    
    return printResult("API Order Book", true, `Order book ricevuto per ${testSymbol}`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("API Order Book", false, error.message);
  }
}

// Test dell'API di Funding Rates
async function testFundingRatesAPI() {
  printTitle("Test dell'API Funding Rates");
  
  try {
    console.log("Effettuo richiesta all'API Funding Rates...");
    
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "fundingHistory" })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      return printResult("API Funding Rates", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Risposta ricevuta, analizzo il contenuto...");
    
    if (!data) {
      return printResult("API Funding Rates", false, "Risposta vuota");
    }
    
    if (!Array.isArray(data)) {
      console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
      return printResult("API Funding Rates", false, "Risposta non è un array");
    }
    
    console.log(`Numero di funding rates: ${data.length}`);
    
    if (data.length > 0) {
      const firstRate = data[0];
      console.log("Primo funding rate:", JSON.stringify(firstRate, null, 2));
      
      // Verifica i campi essenziali
      const hasEssentialFields = 
        firstRate.coin !== undefined && 
        firstRate.fundingRate !== undefined && 
        firstRate.time !== undefined;
      
      if (!hasEssentialFields) {
        return printResult("API Funding Rates", false, "Campi essenziali mancanti nella risposta");
      }
    }
    
    return printResult("API Funding Rates", true, `Ricevuti ${data.length} funding rates`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("API Funding Rates", false, error.message);
  }
}

// Test dell'API di Recent Trades
async function testRecentTradesAPI() {
  printTitle("Test dell'API Recent Trades");
  
  try {
    // Prima otteniamo un simbolo valido
    console.log("Ottengo un simbolo valido...");
    
    const marketsResponse = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "metaAndAssetCtxs" })
    });
    
    if (!marketsResponse.ok) {
      return printResult("API Recent Trades", false, "Impossibile ottenere un simbolo di test");
    }
    
    const marketsData = await marketsResponse.json();
    if (!marketsData.universe || marketsData.universe.length === 0) {
      return printResult("API Recent Trades", false, "Nessun simbolo disponibile per il test");
    }
    
    const testSymbol = marketsData.universe[0].name;
    console.log(`Simbolo di test: ${testSymbol}`);
    
    console.log("Effettuo richiesta all'API Recent Trades...");
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        type: "recentTrades",
        coin: testSymbol
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      return printResult("API Recent Trades", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Risposta ricevuta, analizzo il contenuto...");
    
    if (!data) {
      return printResult("API Recent Trades", false, "Risposta vuota");
    }
    
    if (!Array.isArray(data)) {
      console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
      return printResult("API Recent Trades", false, "Risposta non è un array");
    }
    
    console.log(`Numero di trade recenti: ${data.length}`);
    
    if (data.length > 0) {
      const firstTrade = data[0];
      console.log("Primo trade:", JSON.stringify(firstTrade, null, 2));
      
      // Verifica i campi essenziali
      const hasEssentialFields = 
        firstTrade.coin !== undefined && 
        firstTrade.side !== undefined && 
        firstTrade.px !== undefined &&
        firstTrade.sz !== undefined &&
        firstTrade.time !== undefined;
      
      if (!hasEssentialFields) {
        return printResult("API Recent Trades", false, "Campi essenziali mancanti nella risposta");
      }
    }
    
    return printResult("API Recent Trades", true, `Ricevuti ${data.length} trade recenti per ${testSymbol}`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("API Recent Trades", false, error.message);
  }
}

// Funzione principale
async function runTests() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   TEST DELLE API DI TRADING HYPERLIQUID          ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  const results = {
    marketData: await testMarketDataAPI(),
    orderBook: await testOrderBookAPI(),
    fundingRates: await testFundingRatesAPI(),
    recentTrades: await testRecentTradesAPI()
  };
  
  // Riepilogo
  printTitle("RIEPILOGO DEI TEST");
  
  let allPassed = true;
  for (const [test, result] of Object.entries(results)) {
    const passed = !!result;
    allPassed = allPassed && passed;
    
    const testName = test
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    
    printResult(testName, passed);
  }
  
  console.log(`\n${colors.magenta}==================================================${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}✅ TUTTI I TEST DELLE API DI TRADING SONO STATI SUPERATI!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ALCUNI TEST DELLE API DI TRADING NON SONO STATI SUPERATI.${colors.reset}`);
    console.log(`${colors.yellow}Controlla i dettagli sopra per risolvere i problemi.${colors.reset}`);
  }
  console.log(`${colors.magenta}==================================================${colors.reset}`);
}

// Esegui i test
runTests().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione dei test:${colors.reset}`, error);
});