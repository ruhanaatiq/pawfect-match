import "server-only";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;          // ✅ use server var
const dbName = process.env.DB_NAME || "test";
if (!uri) throw new Error("Missing MONGODB_URI in .env.local");

let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb(name = dbName) {
  const client = await clientPromise;
  return client.db(name);
}

export async function getCollection(collectionName, name = dbName) {
  const db = await getDb(name);
  return db.collection(collectionName);
}
