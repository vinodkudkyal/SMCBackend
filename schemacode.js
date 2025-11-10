import { MongoClient } from "mongodb";

const uri = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

async function listSchemas() {
  try {
    await client.connect();
    const db = client.db(); // or specify db name
    const collections = await db.listCollections().toArray();

    for (const coll of collections) {
      const name = coll.name;
      const sample = await db.collection(name).findOne();
      console.log(`\n📘 Collection: ${name}`);
      console.log(JSON.stringify(sample, null, 2));
    }
  } finally {
    await client.close();
  }
}

listSchemas().catch(console.error);
