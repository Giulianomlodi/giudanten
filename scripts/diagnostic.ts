import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Carica le variabili d'ambiente
dotenv.config();

// Costanti
const LEADERBOARD_API = "https://api.hyperliquid.xyz/info";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:3000/hyperliquid";
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Colori per l'output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
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

// Test di connettività alle API Hyperliquid
async function testHyperliquidAPI() {
  printTitle("Test di connettività alle API Hyperliquid");
  
  try {
    const response = await fetch(LEADERBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "metaAndAssetCtxs" })
    });
    
    if (!response.ok) {
      return printResult("API Hyperliquid base", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return printResult("API Hyperliquid base", true, `Risposta ricevuta correttamente`);
  } catch (error) {
    return printResult("API Hyperliquid base", false, error.message);
  }
}

// Test dell'API Leaderboard
async function testLeaderboardAPI() {
  try {
    const response = await fetch(LEADERBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "leaderboard" })
    });
    
    if (!response.ok) {
      return printResult("API Leaderboard", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data || !data.leaderboardRows || !Array.isArray(data.leaderboardRows)) {
      return printResult("API Leaderboard", false, "Formato dati non valido");
    }
    
    return printResult("API Leaderboard", true, `Ricevute ${data.leaderboardRows.length} righe`);
  } catch (error) {
    return printResult("API Leaderboard", false, error.message);
  }
}

// Test dell'API Wallet Details
async function testWalletDetailsAPI() {
  try {
    // Usa un indirizzo reale dalla leaderboard
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
    
    const response = await fetch(LEADERBOARD_API, {
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
    
    if (!response.ok) {
      return printResult("API Wallet Details", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data || !data.marginSummary) {
      return printResult("API Wallet Details", false, "Formato dati non valido");
    }
    
    return printResult("API Wallet Details", true, `Dettagli wallet ricevuti per ${testAddress.substring(0, 8)}...`);
  } catch (error) {
    return printResult("API Wallet Details", false, error.message);
  }
}

// Test dell'API Trade History
async function testTradeHistoryAPI() {
  try {
    // Usa un indirizzo reale dalla leaderboard
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
    const startTime = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // 30 giorni fa
    
    const response = await fetch(LEADERBOARD_API, {
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
    
    if (!response.ok) {
      return printResult("API Trade History", false, `${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data || !data.fills || !Array.isArray(data.fills)) {
      return printResult("API Trade History", false, "Formato dati non valido");
    }
    
    return printResult("API Trade History", true, `Ricevuti ${data.fills.length} trade per ${testAddress.substring(0, 8)}...`);
  } catch (error) {
    return printResult("API Trade History", false, error.message);
  }
}

// Test della connessione MongoDB
async function testMongoDBConnection() {
  printTitle("Test della connessione MongoDB");
  
  let client = null;
  try {
    client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    
    await client.connect();
    const db = client.db();
    await db.command({ ping: 1 });
    
    // Verifica le collezioni
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).join(', ');
    
    return printResult("Connessione MongoDB", true, `Connesso a ${db.databaseName}, collezioni: ${collectionNames}`);
  } catch (error) {
    return printResult("Connessione MongoDB", false, error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Verifica la struttura del progetto
function testProjectStructure() {
  printTitle("Verifica della struttura del progetto");
  
  const requiredFolders = ['app', 'components', 'lib', 'services', 'utils', 'types'];
  const requiredFiles = [
    'app/page.tsx',
    'app/layout.tsx',
    'lib/mongodb.ts',
    'services/hyperliquidService.ts',
    'utils/transformUtils.ts',
    'utils/scoringEngine.ts',
    'utils/qualificationFilter.ts',
    'utils/taggingEngine.ts',
    'utils/portfolioConstructor.ts'
  ];
  
  let allPassed = true;
  
  // Verifica cartelle
  for (const folder of requiredFolders) {
    const folderPath = path.join(PROJECT_ROOT, folder);
    const exists = fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();
    allPassed = printResult(`Cartella ${folder}`, exists) && allPassed;
  }
  
  // Verifica file
  for (const file of requiredFiles) {
    const filePath = path.join(PROJECT_ROOT, file);
    const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    allPassed = printResult(`File ${file}`, exists) && allPassed;
  }
  
  // Verifica API routes
  const apiFolder = path.join(PROJECT_ROOT, 'app/api');
  if (fs.existsSync(apiFolder) && fs.statSync(apiFolder).isDirectory()) {
    const apiRoutes = fs.readdirSync(apiFolder);
    printResult("API routes", true, apiRoutes.join(', '));
  } else {
    printResult("API routes", false, "Cartella API non trovata");
    allPassed = false;
  }
  
  return allPassed;
}

// Verifica le dipendenze del progetto
function testDependencies() {
  printTitle("Verifica delle dipendenze del progetto");
  
  try {
    const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const criticalDependencies = [
      'next', 'react', 'react-dom', 'mongodb', 'node-fetch'
    ];
    
    let allPassed = true;
    
    for (const dep of criticalDependencies) {
      const exists = packageJson.dependencies[dep] !== undefined;
      allPassed = printResult(`Dipendenza ${dep}`, exists) && allPassed;
    }
    
    return allPassed;
  } catch (error) {
    printResult("Lettura package.json", false, error.message);
    return false;
  }
}

// Test delle funzioni di trasformazione
async function testTransformFunctions() {
  printTitle("Test delle funzioni di trasformazione");
  
  try {
    // Importa le funzioni di trasformazione
    const { transformLeaderboardData } = await import('../utils/transformUtils');
    
    // Ottieni dati reali dalla leaderboard
    const leaderboardResponse = await fetch(LEADERBOARD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ type: "leaderboard" })
    });
    
    if (!leaderboardResponse.ok) {
      return printResult("Funzione transformLeaderboardData", false, "Impossibile ottenere dati di test");
    }
    
    const leaderboardData = await leaderboardResponse.json();
    
    // Testa la funzione di trasformazione
    try {
      const transformedData = transformLeaderboardData(leaderboardData);
      
      if (!Array.isArray(transformedData)) {
        return printResult("Funzione transformLeaderboardData", false, "Output non è un array");
      }
      
      if (transformedData.length === 0) {
        return printResult("Funzione transformLeaderboardData", false, "Output è un array vuoto");
      }
      
      // Verifica che i dati trasformati abbiano la struttura corretta
      const firstWallet = transformedData[0];
      const hasRequiredFields = 
        firstWallet._id !== undefined && 
        firstWallet.lastUpdated !== undefined && 
        firstWallet.accountValue !== undefined && 
        firstWallet.stats !== undefined;
      
      return printResult(
        "Funzione transformLeaderboardData", 
        hasRequiredFields, 
        `Trasformati ${transformedData.length} wallet`
      );
    } catch (error) {
      return printResult("Funzione transformLeaderboardData", false, error.message);
    }
  } catch (error) {
    return printResult("Import delle funzioni di trasformazione", false, error.message);
  }
}

// Test delle API locali
async function testLocalAPIs() {
  printTitle("Test delle API locali");
  
  // Verifica se il server Next.js è in esecuzione
  try {
    // Modifica da 3004 a 3000
    const response = await fetch('http://localhost:3000');
    if (!response.ok) {
      printResult("Server Next.js", false, `${response.status} ${response.statusText}`);
      console.log(`${colors.yellow}⚠️ Il server Next.js non sembra essere in esecuzione sulla porta 3000.${colors.reset}`);
      console.log(`${colors.yellow}⚠️ Avvia il server con 'npm run dev' prima di eseguire questo test.${colors.reset}`);
      return false;
    }
    
    printResult("Server Next.js", true, "Server in esecuzione");
    
    // Test delle API
    const apis = [
      // Modifica tutte le porte da 3004 a 3000
      { name: "API Ingest", endpoint: "http://localhost:3000/api/ingest" },
      { name: "API Score", endpoint: "http://localhost:3000/api/score" },
      { name: "API Filter", endpoint: "http://localhost:3000/api/filter" },
      { name: "API Tag", endpoint: "http://localhost:3000/api/tag" },
      { name: "API Portfolio", endpoint: "http://localhost:3000/api/portfolio" },
      { name: "API Wallets", endpoint: "http://localhost:3000/api/wallets" },
      { name: "API Refresh", endpoint: "http://localhost:3000/api/refresh" }
    ];
    
    for (const api of apis) {
      try {
        const response = await fetch(api.endpoint);
        printResult(
          api.name, 
          response.status !== 404, 
          `Status: ${response.status} ${response.statusText}`
        );
      } catch (error) {
        printResult(api.name, false, error.message);
      }
    }
    
    return true;
  } catch (error) {
    printResult("Server Next.js", false, error.message);
    return false;
  }
}

// Verifica il file di configurazione MongoDB
function testMongoDBConfig() {
  printTitle("Verifica della configurazione MongoDB");
  
  const mongodbPath = path.join(PROJECT_ROOT, 'lib/mongodb.ts');
  
  try {
    const content = fs.readFileSync(mongodbPath, 'utf8');
    
    const hasConnectFunction = content.includes('export async function connectToDatabase');
    const hasCollectionNames = content.includes('export function getCollectionNames');
    
    printResult("Funzione connectToDatabase", hasConnectFunction);
    printResult("Funzione getCollectionNames", hasCollectionNames);
    
    // Verifica la presenza di MONGODB_URI
    const envPath = path.join(PROJECT_ROOT, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const hasMongoDB_URI = envContent.includes('MONGODB_URI=');
      printResult("Variabile d'ambiente MONGODB_URI", hasMongoDB_URI);
    } else {
      printResult("File .env.local", false, "File non trovato");
    }
    
    return hasConnectFunction && hasCollectionNames;
  } catch (error) {
    printResult("Lettura configurazione MongoDB", false, error.message);
    return false;
  }
}

// Funzione principale
async function runDiagnostic() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   DIAGNOSTICA COMPLETA DEL PROGETTO GIUDANTEN    ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  // Aggiorniamo la definizione dell'oggetto results
  const results: {
    projectStructure: boolean;
    dependencies: boolean;
    mongoConfig: any;
    mongoDBConnection?: boolean;
    transformFunctions?: boolean;
    hyperliquidAPI?: boolean;
    leaderboardAPI?: boolean;
    walletDetailsAPI?: boolean;
    tradeHistoryAPI?: boolean;
    localAPIs?: boolean;
  } = {
    projectStructure: false,
    dependencies: false,
    mongoConfig: null
  };
  
  results.hyperliquidAPI = await testHyperliquidAPI();
  results.leaderboardAPI = await testLeaderboardAPI();
  results.walletDetailsAPI = await testWalletDetailsAPI();
  results.tradeHistoryAPI = await testTradeHistoryAPI();
  results.mongoDBConnection = await testMongoDBConnection();
  results.transformFunctions = await testTransformFunctions();
  
  // Test opzionale delle API locali
  console.log(`\n${colors.yellow}Vuoi testare le API locali? Assicurati che il server Next.js sia in esecuzione (npm run dev).${colors.reset}`);
  console.log(`${colors.yellow}Se il server è in esecuzione, premi Enter per continuare, altrimenti scrivi 'skip'.${colors.reset}`);
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  await new Promise<void>((resolve) => {
    readline.question('', (answer: string) => {
      if (answer.toLowerCase() !== 'skip') {
        testLocalAPIs().then(() => {
          readline.close();
          resolve();
        });
      } else {
        console.log(`${colors.yellow}Test delle API locali saltato.${colors.reset}`);
        readline.close();
        resolve();
      }
    });
  });
  
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
    console.log(`${colors.green}✅ TUTTI I TEST SONO STATI SUPERATI!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ALCUNI TEST NON SONO STATI SUPERATI.${colors.reset}`);
    console.log(`${colors.yellow}Controlla i dettagli sopra per risolvere i problemi.${colors.reset}`);
  }
  console.log(`${colors.magenta}==================================================${colors.reset}`);
}

// Esegui la diagnostica
runDiagnostic().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione della diagnostica:${colors.reset}`, error);
});