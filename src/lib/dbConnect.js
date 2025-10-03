<<<<<<< Updated upstream
// src/lib/dbConnect.js
import "server-only";
=======
//import "server-only";
>>>>>>> Stashed changes
import { MongoClient, ServerApiVersion } from "mongodb";

// cache across hot reloads in dev / lambda reuses
let cached = global._mongo || { client: null, promise: null };
global._mongo = cached;

<<<<<<< Updated upstream
function getUri() {
  // ✅ server-only env (never NEXT_PUBLIC_)
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Set MONGODB_URI in .env.local");
  return uri;
=======
export const collectionNamesObj = {
  petCollection: "pets",
  vetCollection: "vets",
  
};

let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });
  global._mongoClientPromise = client.connect();
>>>>>>> Stashed changes
}

function getDbName() {
  return process.env.MONGODB_DB || "pawfectMatch";
}

/** Get a connected MongoClient (memoized) */
async function getClient() {
  if (cached.client) return cached.client;
  if (!cached.promise) {
    const client = new MongoClient(getUri(), {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
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
<<<<<<< Updated upstream

// (optional) centralize collection names
export const collectionNamesObj = {
  petCollection: "pets",
};
=======
// export default async function dbConnect(collectionName) {
//   const client = await clientPromise;
//   const db = client.db(dbName);
//   return db.collection(collectionName);
// }
>>>>>>> Stashed changes
