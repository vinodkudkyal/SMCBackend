// const mongoose = require("mongoose");

// // MongoDB Connection - NO SPACES in query parameters
// const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// // Sweeper Schema
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default:  [] },
//   dutyTime:  {
//     start: { type:  String, default: null },
//     end: { type: String, default: null },
//   },
//   alarmEvents: { type: Object, default: {} },
//   partitions: { type: Object, default: {} },
// });

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// // Fetch and Display Sweepers
// async function getSweepers() {
//   try {
//     await mongoose.connect(MONGO_URI);

//     console.log("✅ Connected to MongoDB\n");

//     const sweepers = await Sweeper.find().lean();

//     if (sweepers.length === 0) {
//       console.log("❌ No sweepers found in database!");
//       process.exit(0);
//     }

//     console.log("📋 LIST OF ALL SWEEPERS:\n");
//     console.log("═".repeat(80));

//     sweepers.forEach((sweeper, index) => {
//       console.log(`\n${index + 1}. Name: ${sweeper. name || "N/A"}`);
//       console.log(`   ID: ${sweeper._id}`);
//       console.log(`   Email: ${sweeper.email || "N/A"}`);
//       console.log(`   Duty Time: ${sweeper.dutyTime?. start || "N/A"} - ${sweeper.dutyTime?.end || "N/A"}`);
//       console.log(`   Geofence Points: ${sweeper.geofence?. length || 0}`);
//       console.log(`   Checkpoints: ${sweeper.checkpoints?. length || 0}`);
//     });

//     console.log("\n" + "═".repeat(80));
//     console.log(`\n✅ Total Sweepers: ${sweepers.length}\n`);

//     // Also save to JSON file for easy reference
//     const fs = require('fs');
//     const simplifiedList = sweepers. map(s => ({
//       id: s._id.toString(),
//       name: s.name,
//       email: s.email
//     }));
    
//     fs.writeFileSync('sweepers_list.json', JSON.stringify(simplifiedList, null, 2));
//     console.log("💾 Sweeper list saved to 'sweepers_list.json'\n");

//   } catch (error) {
//     console.error("❌ Error:", error.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//     process.exit(0);
//   }
// }

// getSweepers();


// const mongoose = require("mongoose");

// // ===============================
// // MongoDB Connection
// // ===============================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// mongoose
//   .connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

// // ===============================
// // Sweeper Schema
// // ===============================
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
// });

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// // ===============================
// // Print Sweepers Ending With 33
// // ===============================
// async function printSweepersEnding33() {
//   try {
//     const sweepers = await Sweeper.find({
//       email: { $regex: /33$/ }
//     }).lean();

//     console.log("\n📋 Sweepers whose email ends with 33:\n");

//     if (sweepers.length === 0) {
//       console.log("No sweepers found.");
//     } else {
//       sweepers.forEach((s, index) => {
//         console.log(
//           `${index + 1}. Name: ${s.name} | Email: ${s.email}`
//         );
//       });
//     }
//   } catch (err) {
//     console.error("❌ Error fetching sweepers:", err.message);
//   } finally {
//     mongoose.connection.close();
//     console.log("\n🔌 MongoDB connection closed");
//   }
// }

// // Run
// printSweepersEnding33();




// const mongoose = require("mongoose");

// // ===============================
// // MongoDB Connection
// // ===============================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// mongoose
//   .connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

// // ===============================
// // Sweeper Schema
// // ===============================
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
// });

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// // ===============================
// // Print Sweepers Ending With 33
// // ===============================
// async function printSweepersEnding33() {
//   try {
//     const sweepers = await Sweeper.find(
//       { email: { $regex: /33$/ } },
//       { name: 1, email: 1, password: 1, _id: 0 }
//     ).lean();

//     console.log("\n📋 Sweepers whose email ends with 33 (with passwords):\n");

//     if (sweepers.length === 0) {
//       console.log("No sweepers found.");
//     } else {
//       sweepers.forEach((s, index) => {
//         console.log(
//           `${index + 1}. Name: ${s.name} | Email: ${s.email} | Password: ${s.password}`
//         );
//       });
//     }
//   } catch (err) {
//     console.error("❌ Error fetching sweepers:", err.message);
//   } finally {
//     await mongoose.connection.close();
//     console.log("\n🔌 MongoDB connection closed");
//   }
// }

// // Run
// printSweepersEnding33();




// const mongoose = require("mongoose");

// // ===============================
// // MongoDB Connection
// // ===============================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// mongoose
//   .connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err);
//     process.exit(1);
//   });

// // ===============================
// // Schemas
// // ===============================
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
// });

// const faceDataSchema = new mongoose.Schema({
//   sweeperId: mongoose.Schema.Types.ObjectId,
//   name: String,
//   faceData: String,
// });

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);
// const FaceData = mongoose.model("FaceData", faceDataSchema);

// // ===============================
// // Remove ONLY Face Data
// // ===============================
// async function removeAniketFaceData() {
//   try {
//     // Find Aniket Lokhande
//     const sweeper = await Sweeper.findOne({
//       email: "aniketlokhande33",
//     });

//     if (!sweeper) {
//       console.log("❌ Sweeper Aniket Lokhande not found");
//       return;
//     }

//     // Delete only face data
//     const result = await FaceData.deleteOne({
//       sweeperId: sweeper._id,
//     });

//     if (result.deletedCount === 0) {
//       console.log("ℹ️ Face data already not present for Aniket Lokhande");
//     } else {
//       console.log("✅ Face data deleted successfully for Aniket Lokhande");
//     }
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   } finally {
//     await mongoose.connection.close();
//     console.log("🔌 MongoDB connection closed");
//   }
// }

// // Run
// removeAniketFaceData();




// const mongoose = require("mongoose");

// // ===============================
// // MongoDB URI
// // ===============================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// // ===============================
// // Schemas
// // ===============================
// const sweeperSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: String,
//     password: String,
//   },
//   { collection: "sweepers" } // IMPORTANT: force correct collection
// );

// const faceDataSchema = new mongoose.Schema(
//   {
//     sweeperId: mongoose.Schema.Types.ObjectId,
//     name: String,
//     faceData: String,
//   },
//   { collection: "facedatas" }
// );

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);
// const FaceData = mongoose.model("FaceData", faceDataSchema);

// // ===============================
// // Main Logic (AFTER connection)
// // ===============================
// async function run() {
//   try {
//     console.log("⏳ Connecting to MongoDB...");
//     await mongoose.connect(MONGO_URI); // ✅ WAIT here
//     console.log("✅ MongoDB Connected\n");

//     const emails = [
//       "aniketlokhande33",
//       "ashokgaikwad33",
//       "dyndipmaske33",
//       "gurugangabansode33",
//       "kunaldasmore33",
//       "pradipsarvgod33",
//       "riteshagaikwad33",
//       "rupaligaikwad33",
//       "sachinjogdiya33",
//       "sunilmhetre33",
//       "swapnildaware33",
//       "uttamkasabe33",
//       "yashpalsurvase33",
//       "yogeshajadhav33",
//       "yuvrajbhalerao33",
//     ];

//     for (const email of emails) {
//       const sweeper = await Sweeper.findOne({ email }).lean();

//       if (!sweeper) {
//         console.log(`❌ Sweeper not found: ${email}`);
//         continue;
//       }

//       const result = await FaceData.deleteOne({
//         sweeperId: sweeper._id,
//       });

//       if (result.deletedCount === 0) {
//         console.log(`ℹ️ Face data already missing: ${sweeper.name}`);
//       } else {
//         console.log(`✅ Face data deleted: ${sweeper.name}`);
//       }
//     }
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log("\n🔌 MongoDB connection closed");
//   }
// }

// // ===============================
// // Run
// // ===============================
// run();




const mongoose = require("mongoose");

// ===============================
// MongoDB URI
// ===============================
const MONGO_URI =
  "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// ===============================
// Schemas (force collections)
// ===============================
const sweeperSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
  },
  { collection: "sweepers" }
);

const faceDataSchema = new mongoose.Schema(
  {
    sweeperId: mongoose.Schema.Types.ObjectId,
    name: String,
    faceData: String,
  },
  { collection: "facedatas" }
);

const Sweeper = mongoose.model("Sweeper", sweeperSchema);
const FaceData = mongoose.model("FaceData", faceDataSchema);

// ===============================
// Main Logic
// ===============================
async function run() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    // Get all face data entries
    const faceRecords = await FaceData.find(
      {},
      { sweeperId: 1 }
    ).lean();

    if (faceRecords.length === 0) {
      console.log("ℹ️ No users with face data found.");
      return;
    }

    const sweeperIds = faceRecords.map(f => f.sweeperId);

    // Get corresponding sweepers
    const sweepers = await Sweeper.find(
      { _id: { $in: sweeperIds } },
      { name: 1, email: 1 }
    ).lean();

    console.log("📋 Users who have face data:\n");

    sweepers.forEach((s, index) => {
      console.log(`${index + 1}. Name: ${s.name} | Email: ${s.email}`);
    });

    console.log(`\n✅ Total users with face data: ${sweepers.length}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 MongoDB connection closed");
  }
}

// ===============================
// Run
// ===============================
run();
