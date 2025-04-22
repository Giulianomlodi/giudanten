import { connectToDatabase, closeConnection, getCollectionNames } from '../lib/mongodb';

// Implementazione semplice di colors per evitare dipendenze esterne
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

async function testMongoDBConnection() {
  console.log(`\n${colors.cyan}=== Test della connessione MongoDB ===${colors.reset}\n`);
  
  try {
    console.log("Tentativo di connessione a MongoDB...");
    const startTime = Date.now();
    const { db } = await connectToDatabase();
    const endTime = Date.now();
    
    console.log(`${colors.green}✅ Connessione riuscita in ${endTime - startTime}ms${colors.reset}`);
    
    // Verifica le collezioni
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log(`Collezioni disponibili: ${collectionNames.join(', ')}`);
    
    // Verifica che tutte le collezioni necessarie esistano
    const requiredCollections = Object.values(getCollectionNames());
    const missingCollections = requiredCollections.filter(name => !collectionNames.includes(name));
    
    if (missingCollections.length > 0) {
      console.log(`${colors.yellow}⚠️ Collezioni mancanti: ${missingCollections.join(', ')}${colors.reset}`);
      console.log("Creazione delle collezioni mancanti...");
      
      for (const collName of missingCollections) {
        await db.createCollection(collName);
        console.log(`${colors.green}✅ Collezione ${collName} creata${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}✅ Tutte le collezioni necessarie esistono${colors.reset}`);
    }
    
    // Verifica i documenti in ogni collezione
    for (const collName of requiredCollections) {
      const count = await db.collection(collName).countDocuments();
      console.log(`${collName}: ${count} documenti`);
    }
    
    // Chiudi la connessione
    await closeConnection();
    console.log(`${colors.green}✅ Test completato con successo${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Errore di connessione MongoDB:${colors.reset}`, error);
    
    // Suggerimenti per la risoluzione dei problemi
    console.log(`\n${colors.yellow}Suggerimenti per la risoluzione dei problemi:${colors.reset}`);
    console.log("1. Verifica che MongoDB sia installato e in esecuzione");
    console.log("2. Controlla che la porta 27017 sia accessibile");
    console.log("3. Verifica che il database 'giudanten' esista o possa essere creato");
    console.log("4. Controlla il file .env.local per la configurazione di MONGODB_URI");
    
    return false;
  }
}

// Esegui il test
testMongoDBConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Errore non gestito:", error);
    process.exit(1);
  });