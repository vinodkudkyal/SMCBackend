const mongoose = require("mongoose");

// MongoDB Connection - NO SPACES in query parameters
const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// Sweeper Schema
const sweeperSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  geofence: { type: Array, default: [] },
  checkpoints: { type: Array, default:  [] },
  dutyTime:  {
    start: { type:  String, default: null },
    end: { type: String, default: null },
  },
  alarmEvents: { type: Object, default: {} },
  partitions: { type: Object, default: {} },
});

const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// Fetch and Display Sweepers
async function getSweepers() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to MongoDB\n");

    const sweepers = await Sweeper.find().lean();

    if (sweepers.length === 0) {
      console.log("❌ No sweepers found in database!");
      process.exit(0);
    }

    console.log("📋 LIST OF ALL SWEEPERS:\n");
    console.log("═".repeat(80));

    sweepers.forEach((sweeper, index) => {
      console.log(`\n${index + 1}. Name: ${sweeper. name || "N/A"}`);
      console.log(`   ID: ${sweeper._id}`);
      console.log(`   Email: ${sweeper.email || "N/A"}`);
      console.log(`   Duty Time: ${sweeper.dutyTime?. start || "N/A"} - ${sweeper.dutyTime?.end || "N/A"}`);
      console.log(`   Geofence Points: ${sweeper.geofence?. length || 0}`);
      console.log(`   Checkpoints: ${sweeper.checkpoints?. length || 0}`);
    });

    console.log("\n" + "═".repeat(80));
    console.log(`\n✅ Total Sweepers: ${sweepers.length}\n`);

    // Also save to JSON file for easy reference
    const fs = require('fs');
    const simplifiedList = sweepers. map(s => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email
    }));
    
    fs.writeFileSync('sweepers_list.json', JSON.stringify(simplifiedList, null, 2));
    console.log("💾 Sweeper list saved to 'sweepers_list.json'\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

getSweepers();