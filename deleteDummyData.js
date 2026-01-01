const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// Schemas
const sweeperSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  geofence: { type: Array, default: [] },
  checkpoints: { type: Array, default:  [] },
  dutyTime: {
    start: { type: String, default: null },
    end: { type: String, default:  null },
  },
  alarmEvents: { type: Object, default: {} },
  partitions: { type: Object, default: {} },
});

const attendanceSchema = new mongoose.Schema({
  sweeperId: { type:  mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
  date: Date,
  location: { latitude: Number, longitude: Number },
  createdAt: { type: Date, default: Date.now },
});

const eventIndexSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  sweeperId: { type: mongoose.Schema.Types. ObjectId, ref: "Sweeper", required: true },
  dateKey:  { type: String, required: true },
  storage: { type: String, enum: ["sweeper", "group", "old"], default: "sweeper" },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "AlarmEventGroup", default: null },
  createdAt: { type: Date, default: Date.now },
});

const Sweeper = mongoose.model("Sweeper", sweeperSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// Selected Sweepers IDs
const SWEEPER_IDS = [
  "68da286c7172c21bf4a37c4d", // Akshay kambale
  "68da29947172c21bf4a37c55", // Atish kuchekar
  "68e3820ab13dd1153fcf3ef7", // tanoj kadam
  "69425c21531fd6f9b6c0bc77", // kartik
  "68e37d42b13dd1153fcf3ec1", // vicky Ramesh Gaikwad
  "69098f228d240ea50b2c2e5b", // Lakhan prabhakar gavli
  "690990278d240ea50b2c2e73", // Gangaram Waghmare
  "690994328d240ea50b2c2ec8", // Anand Gaikwad
];

// Date range for dummy data (Dec 15-21, 2025)
const START_DATE = new Date("2025-12-15T00:00:00Z");
const END_DATE = new Date("2025-12-21T23:59:59Z");

// Date keys for alarm events
const DATE_KEYS = [
  "2025-12-15",
  "2025-12-16",
  "2025-12-17",
  "2025-12-18",
  "2025-12-19",
  "2025-12-20",
  "2025-12-21",
];

async function deleteDummyData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    let totalAttendanceDeleted = 0;
    let totalAlarmsDeleted = 0;
    let totalEventIndexDeleted = 0;

    console.log("🧹 STARTING DUMMY DATA CLEANUP.. .\n");
    console.log("=".repeat(80));

    for (const sweeperId of SWEEPER_IDS) {
      const sweeper = await Sweeper. findById(sweeperId);
      if (!sweeper) {
        console.log(`⚠️  Sweeper not found: ${sweeperId}`);
        continue;
      }

      console.log(`\n📌 Cleaning data for:  ${sweeper.name}`);

      // === DELETE ATTENDANCE RECORDS ===
      const attendanceResult = await Attendance.deleteMany({
        sweeperId: sweeperId,
        date: { $gte: START_DATE, $lte: END_DATE },
      });

      console.log(`   🗑️  Attendance deleted: ${attendanceResult.deletedCount} records`);
      totalAttendanceDeleted += attendanceResult. deletedCount;

      // === DELETE ALARM EVENTS FROM SWEEPER DOCUMENT ===
      let alarmsDeletedCount = 0;

      if (sweeper.alarmEvents && typeof sweeper.alarmEvents === 'object') {
        for (const dateKey of DATE_KEYS) {
          if (sweeper.alarmEvents[dateKey] && Array.isArray(sweeper.alarmEvents[dateKey])) {
            const eventsCount = sweeper.alarmEvents[dateKey].length;
            
            // Delete the entire date key
            delete sweeper.alarmEvents[dateKey];
            alarmsDeletedCount += eventsCount;
          }
        }

        // Mark as modified and save
        sweeper.markModified('alarmEvents');
        await sweeper.save();
      }

      console.log(`   🗑️  Alarm events deleted:  ${alarmsDeletedCount} events`);
      totalAlarmsDeleted += alarmsDeletedCount;

      // === DELETE EVENT INDEX ENTRIES ===
      const eventIndexResult = await EventIndex.deleteMany({
        sweeperId: sweeperId,
        dateKey:  { $in: DATE_KEYS },
      });

      console.log(`   🗑️  Event index entries deleted: ${eventIndexResult.deletedCount} entries`);
      totalEventIndexDeleted += eventIndexResult.deletedCount;
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ DUMMY DATA CLEANUP COMPLETE");
    console.log("=". repeat(80));
    console.log(`📊 Total Attendance Records Deleted: ${totalAttendanceDeleted}`);
    console.log(`🚨 Total Alarm Events Deleted: ${totalAlarmsDeleted}`);
    console.log(`📇 Total Event Index Entries Deleted: ${totalEventIndexDeleted}`);
    console.log(`👥 Sweepers Processed: ${SWEEPER_IDS.length}`);
    console.log("\n📋 Details:");
    console.log(`   • Date range cleaned: Dec 15-21, 2025`);
    console.log(`   • Sweepers affected: 8`);
    console.log(`   • Collections cleaned:  Attendance, Sweeper. alarmEvents, EventIndex`);
    console.log("=".repeat(80) + "\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose. disconnect();
    console.log("🔌 Disconnected from MongoDB\n");
    process.exit(0);
  }
}

deleteDummyData();