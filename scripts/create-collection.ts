import { connectToDatabase } from '../lib/mongodb';

async function createCollection() {
  try {
    console.log("Connessione al database...");
    const { db } = await connectToDatabase();
    
    console.log("Creazione della collezione 'portfolios'...");
    await db.createCollection('portfolios');
    console.log("Collezione 'portfolios' creata con successo!");
    
    // Verifica che la collezione sia stata creata
    const collections = await db.listCollections().toArray();
    console.log("Collezioni esistenti:", collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error("Errore durante la creazione della collezione:", error);
    process.exit(1);
  }
}

createCollection();