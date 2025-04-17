import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://botG:2Y9rIeZwJUXtDXm8@bar.n5dkowy.mongodb.net/?retryWrites=true&w=majority&appName=Bar";
const DATABASE_NAME = "hyperliquid_db";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  // If we already have a connection, use it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new connection
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DATABASE_NAME);

  // Cache the connection
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export function getCollectionNames() {
  return {
    WALLETS: "wallets",
    TRADES: "trades",
    PORTFOLIOS: "portfolios",
  };
}
