// src/lib/dbConnect.js
import "server-only";
import { MongoClient, ServerApiVersion } from "mongodb";

// Cache across HMR (dev) / lambda re-use (prod)
let cached = globalThis._mongo || { client: null, promise: null };
globalThis._mongo = cached;

function getUri() {
  const uri = process.env.MONGODB_URI; // server-only
  if (!uri) throw new Error("Set MONGODB_URI in .env.local");
  return uri;
}

function getDbName() {
  // Keep a single source of truth for DB name
  return process.env.MONGODB_DB || process.env.DB_NAME || "pawfectMatch";
}

/** Get a connected MongoClient (memoized) */
async function getClient() {
  if (cached.client) return cached.client;

  if (!cached.promise) {
    const client = new MongoClient(getUri(), {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    cached.promise = client.connect().then((c) => (cached.client = c));
  }
  return cached.promise;
}

/** Get a DB handle */
export async function getDb(name = getDbName()) {
  const client = await getClient();
  return client.db(name);
}

/** Get a collection handle */
export async function getCollection(collectionName, name = getDbName()) {
  const db = await getDb(name);
  return db.collection(collectionName);
}

/** Centralized collection names */
export const collectionNamesObj = {
  pets: "pets",
  vets: "vets",
  shelters: "shelters",
  users: "users",
    petCollection: "pets",
  vetCollection: "vets",
};
