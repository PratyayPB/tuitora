import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://localhost:27017";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const c = await clientPromise;
  const dbName = process.env.DB_NAME || "tuitora_database";
  return c.db(dbName);
}
