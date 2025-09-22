import { MongoClient, ServerApiVersion } from 'mongodb'

let client

async function dbConnect() {
  if (client) {
    return client
  }

  const uri = process.env.NEXT_PUBLIC_MONGODB_URI
  
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })

  try {
    await client.connect()
    console.log("Connected to MongoDB!")
    return client
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

export default dbConnect

export async function getCollection(collectionName) {
  const client = await dbConnect()
  const dbName = process.env.DB_NAME
  return client.db(dbName).collection(collectionName)
}