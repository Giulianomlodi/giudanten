const https = require('https');
const http = require('http');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

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
function printTitle(title) {
  console.log(`\n${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

// Funzione per stampare un risultato
function printResult(test, passed, details) {
  const icon = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${icon} ${test}${colors.reset}${details ? `: ${details}` : ''}`);
  return passed;
}

// Test di connettività a Internet
function testInternetConnectivity() {
  return new Promise((resolve) => {
    printTitle("Test di connettività a Internet");
    
    const req = https.get('https://www.google.com', (res) => {
      printResult("Connessione a Internet", res.statusCode === 200, `Status: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (error) => {
      printResult("Connessione a Internet", false, error.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Test di connettività alle API Hyperliquid
function testHyperliquidConnectivity() {
  return new Promise((resolve) => {
    printTitle("Test di connettività alle API Hyperliquid");
    
    const options = {
      hostname: 'api.hyperliquid.xyz',
      path: '/info',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200;
        printResult("API Hyperliquid", success, `Status: ${res.statusCode}`);
        resolve(success);
      });
    });
    
    req.on('error', (error) => {
      printResult("API Hyperliquid", false, error.message);
      resolve(false);
    });
    
    req.write(JSON.stringify({ type: "metaAndAssetCtxs" }));
    req.end();
  });
}

// Test di connettività a MongoDB
function testMongoDBConnectivity() {
  return new Promise(async (resolve) => {
    printTitle("Test di connettività a MongoDB");
    
    // Aggiornato per usare 127.0.0.1 invece di localhost e il nome del database corretto
    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/giudanten";
    
    if (!MONGODB_URI) {
      printResult("MongoDB URI", false, "URI non trovato nelle variabili d'ambiente");
      resolve(false);
      return;
    }
    
    printResult("MongoDB URI", true, "URI trovato nelle variabili d'ambiente");
    
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
      
      printResult("Connessione MongoDB", true, `Connesso a ${db.databaseName}, collezioni: ${collectionNames}`);
      resolve(true);
    } catch (error) {
      printResult("Connessione MongoDB", false, error.message);
      resolve(false);
    } finally {
      if (client) {
        await client.close();
      }
    }
  });
}

// Test di connettività al server locale
function testLocalServerConnectivity() {
  return new Promise((resolve) => {
    printTitle("Test di connettività al server locale");
    
    // Modifica da 3004 a 3000
    const req = http.get('http://localhost:3000', (res) => {
      printResult("Server locale", res.statusCode !== 404, `Status: ${res.statusCode}`);
      resolve(res.statusCode !== 404);
    });
    
    req.on('error', (error) => {
      printResult("Server locale", false, error.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Funzione principale
async function runConnectivityTests() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   TEST DI CONNETTIVITÀ DEL PROGETTO              ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  const internetConnected = await testInternetConnectivity();
  
  if (!internetConnected) {
    console.log(`${colors.red}❌ Test interrotto: nessuna connessione a Internet${colors.reset}`);
    return;
  }
  
  const results = {
    hyperliquid: await testHyperliquidConnectivity(),
    mongodb: await testMongoDBConnectivity(),
    localServer: await testLocalServerConnectivity()
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
    console.log(`${colors.green}✅ TUTTI I TEST DI CONNETTIVITÀ SONO STATI SUPERATI!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ ALCUNI TEST DI CONNETTIVITÀ NON SONO STATI SUPERATI.${colors.reset}`);
    console.log(`${colors.yellow}Controlla i dettagli sopra per risolvere i problemi.${colors.reset}`);
  }
  console.log(`${colors.magenta}==================================================${colors.reset}`);
}

// Esegui i test
runConnectivityTests().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione dei test:${colors.reset}`, error);
});