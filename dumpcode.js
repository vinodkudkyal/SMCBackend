import { MongoClient } from "mongodb";

const oldUri = "mongodb+srv://adarshanna69_db_user:nvr53vg7ZicinMRc@cluster0.obkoytt.mongodb.net/nagarshuddhi?retryWrites=true&w=majority";
const newUri = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority";

const oldDbName = "nagarshuddhi";
const newDbName = "nagarshuddhi";

async function copyDatabase() {
  const sourceClient = new MongoClient(oldUri, {
    tls: true,
    retryWrites: true,
    serverSelectionTimeoutMS: 10000,
  });
  const targetClient = new MongoClient(newUri, {
    tls: true,
    retryWrites: true,
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log("🔗 Connecting to both databases...");
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(oldDbName);
    const targetDb = targetClient.db(newDbName);

    const collections = await sourceDb.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections in '${oldDbName}'`);

    for (const coll of collections) {
      const collectionName = coll.name;
      console.log(`\n➡ Copying collection: ${collectionName}`);

      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      const docs = await sourceCollection.find({}).toArray();
      console.log(`   Found ${docs.length} documents`);

      if (docs.length > 0) {
        await targetCollection.deleteMany({});
        await targetCollection.insertMany(docs);
        console.log(`   ✅ Inserted ${docs.length} documents into '${collectionName}'`);
      } else {
        console.log(`   ⚠ No documents to copy in '${collectionName}'`);
      }
    }

    console.log("\n🎉 Database copy completed successfully!");
  } catch (err) {
    console.error("❌ Error copying database:", err);
  } finally {
    await sourceClient.close();
    await targetClient.close();
    console.log("🔒 Connections closed.");
  }
}

copyDatabase();
