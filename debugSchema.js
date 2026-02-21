// import { MongoClient, ObjectId } from "mongodb";

// // 🔐 Your MongoDB URI
// const uri = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// const client = new MongoClient(uri);

// async function debugDatabase(userId) {
//   try {
//     await client.connect();
//     console.log("✅ Connected to MongoDB\n");

//     const db = client.db("nagarshuddhi");

//     // ===============================
//     // 1️⃣ LIST ALL COLLECTIONS
//     // ===============================
//     console.log("📚 COLLECTION SCHEMAS\n");

//     const collections = await db.listCollections().toArray();

//     for (const coll of collections) {
//       const name = coll.name;
//       const sample = await db.collection(name).findOne();

//       console.log(`\n📘 Collection: ${name}`);
//       console.log(JSON.stringify(sample, null, 2));
//     }

//     // ===============================
//     // 2️⃣ GET FULL DATA OF ONE USER
//     // ===============================
//     console.log("\n\n==============================");
//     console.log("🔎 FULL DATA FOR USER:", userId);
//     console.log("==============================\n");

//     let objectId = null;
//     try {
//       objectId = new ObjectId(userId);
//     } catch {
//       console.log("⚠️ Invalid ObjectId format. Using as string.");
//     }

//     const fullData = {};

//     for (const coll of collections) {
//       const name = coll.name;
//       const collection = db.collection(name);

//       let queryResults = [];

//       // Try matching _id
//       if (objectId) {
//         const byId = await collection.findOne({ _id: objectId });
//         if (byId) queryResults.push(byId);
//       }

//       // Try matching sweeperId (string)
//       const bySweeperId = await collection
//         .find({ sweeperId: userId })
//         .toArray();

//       if (bySweeperId.length > 0) {
//         queryResults.push(...bySweeperId);
//       }

//       if (queryResults.length > 0) {
//         fullData[name] = queryResults;
//       }
//     }

//     console.log(JSON.stringify(fullData, null, 2));

//   } catch (error) {
//     console.error("❌ Error:", error);
//   } finally {
//     await client.close();
//     console.log("\n🔒 Connection closed");
//   }
// }

// // 🔥 PUT YOUR USER OR SWEEPER ID HERE
// const userId = "699591437a8b8754a4191d42";

// debugDatabase(userId);



import { MongoClient } from "mongodb";

// 🔐 Replace with your MongoDB URI
const uri = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

// 🔎 Helper: Detect Type Properly
function detectType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Array (empty)";
    return `Array<${detectType(value[0])}>`;
  }
  if (value instanceof Date) return "Date";
  if (typeof value === "object") return "Object";
  return typeof value;
}

// 🔎 Helper: Extract Object Structure
function extractObjectStructure(obj, indent = 2) {
  let structure = "";

  for (const key in obj) {
    const value = obj[key];
    const type = detectType(value);

    if (type === "Object") {
      structure += `${" ".repeat(indent)}- ${key}: Object\n`;
      structure += extractObjectStructure(value, indent + 4);
    } else {
      structure += `${" ".repeat(indent)}- ${key}: ${type}\n`;
    }
  }

  return structure;
}

async function analyzeSchema() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db("nagarshuddhi");

    const collections = await db.listCollections().toArray();

    console.log("==========================================");
    console.log("📚 DATABASE SCHEMA ANALYSIS");
    console.log("==========================================\n");

    for (const coll of collections) {
      const name = coll.name;
      const sample = await db.collection(name).findOne();

      console.log(`📘 Collection: ${name}`);

      if (!sample) {
        console.log("   ⚠ Collection is empty\n");
        continue;
      }

      const structure = extractObjectStructure(sample);
      console.log(structure);

      // 🔗 Detect Possible Relation Fields
      const relationFields = Object.keys(sample).filter(field =>
        field.toLowerCase().includes("id") &&
        field !== "_id"
      );

      if (relationFields.length > 0) {
        console.log("   🔗 Possible Relation Fields:");
        relationFields.forEach(field => {
          console.log(`      - ${field}`);
        });
      }

      console.log("--------------------------------------------------\n");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔒 Connection closed");
  }
}

analyzeSchema();
