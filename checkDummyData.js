const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

const sweeperSchema = new mongoose.Schema({
  name: String,
  email: String,
  alarmEvents: { type: Object, default: {} },
});

const Sweeper = mongoose. model("Sweeper", sweeperSchema);

const SWEEPER_IDS = [
  { id: "68da286c7172c21bf4a37c4d", name: "Akshay kambale" },
  { id: "68da29947172c21bf4a37c55", name: "Atish kuchekar" },
  { id:  "68e3820ab13dd1153fcf3ef7", name: "tanoj kadam" },
  { id:  "69425c21531fd6f9b6c0bc77", name: "kartik" },
  { id: "68e37d42b13dd1153fcf3ec1", name: "vicky Ramesh Gaikwad" },
  { id: "69098f228d240ea50b2c2e5b", name: "Lakhan prabhakar gavli" },
  { id: "690990278d240ea50b2c2e73", name: "Gangaram Waghmare" },
  { id:  "690994328d240ea50b2c2ec8", name: "Anand Gaikwad" },
];

async function checkData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    for (const sweeperInfo of SWEEPER_IDS) {
      const sweeper = await Sweeper. findById(sweeperInfo. id).lean();
      
      if (!sweeper) {
        console.log(`❌ ${sweeperInfo.name} - NOT FOUND`);
        continue;
      }

      let totalEvents = 0;
      const dateKeys = Object.keys(sweeper. alarmEvents || {});
      
      console.log(`\n📌 ${sweeper.name}`);
      console.log(`   Date keys: ${dateKeys.length}`);
      
      dateKeys.forEach(dateKey => {
        const events = sweeper.alarmEvents[dateKey];
        if (Array.isArray(events)) {
          console.log(`   ${dateKey}: ${events.length} events`);
          totalEvents += events.length;
        }
      });
      
      console.log(`   ✅ TOTAL:  ${totalEvents} events`);
    }

  } catch (error) {
    console.error("❌ Error:", error. message);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

checkData();