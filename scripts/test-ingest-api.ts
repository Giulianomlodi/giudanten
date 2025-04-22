import fetch from 'node-fetch';
import { connectToDatabase, getCollectionNames } from '../lib/mongodb';

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

// Test della connessione al database
async function testDatabaseConnection() {
  printTitle("Test della connessione al database");
  
  try {
    console.log("Connessione al database...");
    const { db } = await connectToDatabase();
    console.log("Connessione riuscita");
    
    const collections = getCollectionNames();
    console.log("Collezioni configurate:", collections);
    
    // Verifica che le collezioni esistano
    const collectionsList = await db.listCollections().toArray();
    const collectionNames = collectionsList.map(c => c.name);
    console.log("Collezioni esistenti:", collectionNames);
    
    // Verifica la collezione WALLETS
    const walletsExists = collectionNames.includes(collections.WALLETS);
    printResult("Collezione WALLETS", walletsExists);
    
    if (walletsExists) {
      const count = await db.collection(collections.WALLETS).countDocuments();
      console.log(`Numero di documenti nella collezione WALLETS: ${count}`);
    }
    
    return printResult("Connessione al database", true, "Database accessibile e collezioni verificate");
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("Connessione al database", false, error.message);
  }
}

// Test dell'API di ingestione
async function testIngestAPI() {
  printTitle("Test dell'API di ingestione");
  
  try {
    console.log("Effettuo richiesta all'API di ingestione...");
    const startTime = Date.now();
    
    const response = await fetch("http://localhost:3000/api/ingest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ force: true }),
    });
    
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Tempo di risposta: ${responseTime} secondi`);
    
    // Leggi il corpo della risposta UNA SOLA VOLTA e salvalo in una variabile
    const responseBody = await response.text();
    
    try {
      // Prova a parsare come JSON
      const jsonData = JSON.parse(responseBody);
      
      if (response.ok) {
        console.log("Risposta:", jsonData);
        printResult("API di ingestione", true, `${jsonData.count || 0} wallet elaborati`);
        return true;
      } else {
        console.log("Dettagli errore:", jsonData);
        printResult("API di ingestione", false, jsonData.error || "Errore sconosciuto");
        return false;
      }
    } catch (parseError) {
      // Se non è JSON valido, mostra il testo
      console.log("Errore completo:", responseBody);
      printResult("API di ingestione", false, responseBody);
      return false;
    }
  } catch (error) {
    console.error("Errore durante il test dell'API:", error);
    printResult("API di ingestione", false, error.message);
    return false;
  }
}

// Test del database dopo l'ingestione
async function testDatabaseAfterIngest() {
  printTitle("Verifica del database dopo l'ingestione");
  
  try {
    const { db } = await connectToDatabase();
    const collections = getCollectionNames();
    
    // Verifica la collezione WALLETS
    const count = await db.collection(collections.WALLETS).countDocuments();
    console.log(`Numero di documenti nella collezione WALLETS: ${count}`);
    
    if (count === 0) {
      return printResult("Database dopo ingestione", false, "Nessun wallet trovato nel database");
    }
    
    // Recupera un campione di wallet
    const sampleWallets = await db.collection(collections.WALLETS)
      .find({})
      .limit(1)
      .toArray();
    
    if (sampleWallets.length === 0) {
      return printResult("Campione wallet", false, "Impossibile recuperare un wallet di esempio");
    }
    
    const sampleWallet = sampleWallets[0];
    console.log("Esempio di wallet nel database:", JSON.stringify(sampleWallet, null, 2));
    
    // Verifica i campi essenziali
    const hasEssentialFields = 
      sampleWallet._id !== undefined && 
      sampleWallet.accountValue !== undefined && 
      sampleWallet.stats !== undefined;
    
    if (!hasEssentialFields) {
      return printResult("Struttura wallet", false, "Campi essenziali mancanti nei wallet");
    }
    
    return printResult("Database dopo ingestione", true, `${count} wallet trovati nel database`);
  } catch (error) {
    console.error("Errore completo:", error);
    return printResult("Database dopo ingestione", false, error.message);
  }
}

// Funzione principale
async function runTests() {
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.magenta}   TEST DELL'API DI INGESTIONE                    ${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
  
  // Test della connessione al database
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log(`${colors.red}❌ Test interrotto: impossibile connettersi al database${colors.reset}`);
    return;
  }
  
  // Test dell'API di ingestione
  const ingestSuccess = await testIngestAPI();
  
  if (ingestSuccess) {
    // Verifica il database dopo l'ingestione
    await testDatabaseAfterIngest();
  }
  
  console.log(`\n${colors.magenta}==================================================${colors.reset}`);
  console.log(`${colors.yellow}Suggerimenti per risolvere problemi di ingestione:${colors.reset}`);
  console.log(`${colors.yellow}1. Verifica che il server Next.js sia in esecuzione${colors.reset}`);
  console.log(`${colors.yellow}2. Controlla i log del server per errori dettagliati${colors.reset}`);
  console.log(`${colors.yellow}3. Verifica che MongoDB sia accessibile${colors.reset}`);
  console.log(`${colors.yellow}4. Controlla che le API di Hyperliquid siano raggiungibili${colors.reset}`);
  console.log(`${colors.yellow}5. Verifica la struttura dei dati restituiti dalle API${colors.reset}`);
  console.log(`${colors.magenta}==================================================${colors.reset}`);
}

// Esegui i test
runTests().catch(error => {
  console.error(`${colors.red}Errore durante l'esecuzione dei test:${colors.reset}`, error);
});