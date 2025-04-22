import fetch from 'node-fetch';

// Costanti
const LEADERBOARD_API = "https://api.hyperliquid.xyz/info";
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

// Test dell'API Leaderboard
async function testLeaderboardAPI() {
  printTitle("Test dell'API Leaderboard");
  
  try {
    console.log("Effettuo richiesta all'API Leaderboard...");
    
    const response = await fetch(LEADERBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "leaderboard" })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      return printResult("API Leaderboard", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Risposta ricevuta, analizzo il contenuto...");
    
    if (!data) {
      return printResult("API Leaderboard", false, "Risposta vuota");
    }
    
    if (!data.leaderboardRows) {
      console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
      return printResult("API Leaderboard", false, "Campo leaderboardRows mancante");
    }
    
    if (!Array.isArray(data.leaderboardRows)) {
      return printResult("API Leaderboard", false, "leaderboardRows non è un array");
    }
    
    console.log(`Numero di righe nella leaderboard: ${data.leaderboardRows.length}`);
    
    if (data.leaderboardRows.length > 0) {
      const firstRow = data.leaderboardRows[0];
      console.log("Prima riga della leaderboard:", JSON.stringify(firstRow, null, 2));
      
      // Verifica i campi essenziali
      const hasEssentialFields = 
        firstRow.ethAddress !== undefined && 
        firstRow.accountValue !== undefined && 
        firstRow.windowPerformances !== undefined;
      
      if (!hasEssentialFields) {
        return printResult("API Leaderboard", false, "Campi essenziali mancanti nella risposta");
      }
    }
    
    return printResult("API Leaderboard", true, `Ricevute ${data.leaderboardRows.length} righe`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("API Leaderboard", false, error.message);
  }
}

// Test dell'API Wallet Details
async function testWalletDetailsAPI() {
  printTitle("Test dell'API Wallet Details");
  
  try {
    // Prima otteniamo un indirizzo dalla leaderboard
    console.log("Ottengo un indirizzo dalla leaderboard...");
    
    const leaderboardResponse = await fetch(LEADERBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "leaderboard" })
    });
    
    if (!leaderboardResponse.ok) {
      return printResult("API Wallet Details", false, "Impossibile ottenere un indirizzo di test");
    }
    
    const leaderboardData = await leaderboardResponse.json();
    if (!leaderboardData.leaderboardRows || leaderboardData.leaderboardRows.length === 0) {
      return printResult("API Wallet Details", false, "Nessun indirizzo disponibile per il test");
    }
    
    const testAddress = leaderboardData.leaderboardRows[0].ethAddress;
    console.log(`Indirizzo di test: ${testAddress}`);
    
    console.log("Effettuo richiesta all'API Wallet Details...");
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        type: "clearinghouseState",
        user: testAddress
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      return printResult("API Wallet Details", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Risposta ricevuta, analizzo il contenuto...");
    
    if (!data) {
      return printResult("API Wallet Details", false, "Risposta vuota");
    }
    
    if (!data.marginSummary) {
      console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
      return printResult("API Wallet Details", false, "Campo marginSummary mancante");
    }
    
    console.log("Dettagli del wallet:", JSON.stringify(data.marginSummary, null, 2));
    
    // Verifica i campi essenziali
    const hasEssentialFields = 
      data.marginSummary.accountValue !== undefined && 
      data.marginSummary.totalMarginUsed !== undefined;
    
    if (!hasEssentialFields) {
      return printResult("API Wallet Details", false, "Campi essenziali mancanti nella risposta");
    }
    
    return printResult("API Wallet Details", true, `Dettagli wallet ricevuti per ${testAddress.substring(0, 8)}...`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("API Wallet Details", false, error.message);
  }
}

// Test dell'API Trade History
async function testTradeHistoryAPI() {
  printTitle("Test dell'API Trade History");
  
  try {
    // Prima otteniamo un indirizzo dalla leaderboard
    console.log("Ottengo un indirizzo dalla leaderboard...");
    
    const leaderboardResponse = await fetch(LEADERBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "leaderboard" })
    });
    
    if (!leaderboardResponse.ok) {
      return printResult("API Trade History", false, "Impossibile ottenere un indirizzo di test");
    }
    
    const leaderboardData = await leaderboardResponse.json();
    if (!leaderboardData.leaderboardRows || leaderboardData.leaderboardRows.length === 0) {
      return printResult("API Trade History", false, "Nessun indirizzo disponibile per il test");
    }
    
    const testAddress = leaderboardData.leaderboardRows[0].ethAddress;
    console.log(`Indirizzo di test: ${testAddress}`);
    
    const startTime = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // 30 giorni fa
    console.log(`Data di inizio: ${new Date(startTime * 1000).toISOString()}`);
    
    console.log("Effettuo richiesta all'API Trade History...");
    const response = await fetch(INFO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        type: "userFills",
        user: testAddress,
        startTime: startTime
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      return printResult("API Trade History", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("Risposta ricevuta, analizzo il contenuto...");
    
    if (!data) {
      return printResult("API Trade History", false, "Risposta vuota");
    }
    
    if (!data.fills || !Array.isArray(data.fills)) {
      console.log("Struttura della risposta:", JSON.stringify(data).substring(0, 200) + "...");
      return printResult("API Trade History", false, "Campo fills mancante o non è un array");
    }
    
    console.log(`Numero di trade trovati: ${data.fills.length}`);
    
    if (data.fills.length > 0) {
      const firstTrade = data.fills[0];
      console.log("Primo trade:", JSON.stringify(firstTrade, null, 2));
      
      // Verifica i campi essenziali
      const hasEssentialFields = 
        firstTrade.coin !== undefined && 
        firstTrade.side !== undefined && 
        firstTrade.px !== undefined &&
        firstTrade.sz !== undefined;
      
      if (!hasEssentialFields) {
        return printResult("API Trade History", false, "Campi essenziali mancanti nella risposta");
      }
    }
    
    return printResult("API Trade History", true, `Ricevuti ${data.fills.length} trade per ${testAddress.substring(0, 8)}...`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("API Trade History", false, error.message);
  }
}

// Test di tutte le API di Hyperliquid
async function testAllAPIs() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   TEST DELLE API HYPERLIQUID                     ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  const results = {
    leaderboard: await testLeaderboardAPI(),
    walletDetails: await testWalletDetailsAPI(),
    tradeHistory: await testTradeHistoryAPI()
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
    console.log(`${colors.green}✅ TUTTI I TEST DELLE API SONO STATI SUPERATI!${colors.reset}`);
    console.log(`${colors.green}Le API di Hyperliquid funzionano correttamente.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ALCUNI TEST DELLE API NON SONO STATI SUPERATI.${colors.reset}`);
    console.log(`${colors.yellow}Controlla i dettagli sopra per risolvere i problemi.${colors.reset}`);
  }
  console.log(`${colors.magenta}==================================================${colors.reset}`);
}

// Esegui i test
testAllAPIs().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione dei test:${colors.reset}`, error);
});