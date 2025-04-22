import { MongoClient } from 'mongodb';

// Variabili di ambiente
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/giudanten';

// Opzioni di connessione
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  family: 4, // Forza IPv4
};

// Cache per la connessione
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Inizializza la connessione
if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise || client.connect();

export function getCollectionNames() {
  return {
    WALLETS: 'wallets',
    TRADES: 'trades',
    PORTFOLIOS: 'portfolios',
    SCORES: 'scores'  // Aggiungi questa riga
  };
}

// Funzione per connettersi al database
export async function connectToDatabase() {
  try {
    const clientInstance = await clientPromise;
    const db = clientInstance.db();
    
    // Verifica e crea le collezioni mancanti
    await ensureCollectionsExist(db);
    
    return { client: clientInstance, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Funzione per assicurarsi che tutte le collezioni esistano
async function ensureCollectionsExist(db) {
  const collections = getCollectionNames();
  const existingCollections = await db.listCollections().toArray();
  const existingNames = existingCollections.map(c => c.name);
  
  for (const collName of Object.values(collections)) {
    if (!existingNames.includes(collName)) {
      console.log(`Creazione della collezione mancante: ${collName}`);
      await db.createCollection(collName);
    }
  }
}

// Funzione per chiudere la connessione (utile per i test)
export async function closeConnection() {
  const clientInstance = await clientPromise;
  await clientInstance.close();
  console.log("MongoDB connection closed");
}
