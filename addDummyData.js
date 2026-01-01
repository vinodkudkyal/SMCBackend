const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// Schemas
const sweeperSchema = new mongoose.Schema({
  name: String,
  email: String,
  password:  String,
  geofence:  { type: Array, default: [] },
  checkpoints: { type: Array, default: [] },
  dutyTime: {
    start: { type: String, default: null },
    end: { type: String, default: null },
  },
  alarmEvents: { type: Object, default:  {} },
  partitions: { type: Object, default: {} },
});

const attendanceSchema = new mongoose.Schema({
  sweeperId: { type: mongoose. Schema.Types.ObjectId, ref: "Sweeper" },
  date: Date,
  location: { latitude: Number, longitude:  Number },
  createdAt:  { type: Date, default: Date.now },
});

const eventIndexSchema = new mongoose.Schema({
  eventId: { type:  String, required: true, unique:  true, index: true },
  sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
  dateKey:  { type: String, required: true },
  storage: { type:  String, enum: ["sweeper", "group", "old"], default:  "sweeper" },
  createdAt: { type: Date, default: Date.now },
});

const Sweeper = mongoose. model("Sweeper", sweeperSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// Selected Sweepers
const SWEEPERS = [
  { id: "68da286c7172c21bf4a37c4d", name: "Akshay kambale", highPerformer: true },
  { id: "68da29947172c21bf4a37c55", name: "Atish kuchekar", highPerformer:  true },
  { id: "68e3820ab13dd1153fcf3ef7", name: "tanoj kadam", highPerformer: false },
  { id: "69425c21531fd6f9b6c0bc77", name: "kartik", highPerformer: false },
  { id: "68e37d42b13dd1153fcf3ec1", name: "vicky Ramesh Gaikwad", highPerformer: false },
  { id: "69098f228d240ea50b2c2e5b", name: "Lakhan prabhakar gavli", highPerformer: true },
  { id: "690990278d240ea50b2c2e73", name: "Gangaram Waghmare", highPerformer: false },
  { id: "690994328d240ea50b2c2ec8", name: "Anand Gaikwad", highPerformer: false },
];

// Week 3 of December 2025: Dec 15-21 (7 days)
const ATTENDANCE_DATES = [
  new Date("2025-12-15T07:00:00Z"),
  new Date("2025-12-16T07:00:00Z"),
  new Date("2025-12-17T07:00:00Z"),
  new Date("2025-12-18T07:00:00Z"),
  new Date("2025-12-19T07:00:00Z"),
  new Date("2025-12-20T07:00:00Z"),
  new Date("2025-12-21T07:00:00Z"),
];

const DATE_KEYS = [
  "2025-12-15",
  "2025-12-16",
  "2025-12-17",
  "2025-12-18",
  "2025-12-19",
  "2025-12-20",
  "2025-12-21",
];

// Helper:  Random location
function getRandomLocation(geofence) {
  if (! geofence || geofence. length === 0) {
    return {
      latitude: 17.6805 + (Math.random() - 0.5) * 0.01,
      longitude: 73.9903 + (Math.random() - 0.5) * 0.01,
    };
  }
  const point = geofence[Math.floor(Math.random() * geofence.length)];
  return {
    latitude: (point.latitude || point.lat || 17.6805) + (Math.random() - 0.5) * 0.001,
    longitude: (point. longitude || point.lng || 73.9903) + (Math.random() - 0.5) * 0.001,
  };
}

// Helper: Point in polygon check
function isPointInPolygon(point, polygon) {
  if (! Array.isArray(polygon) || polygon.length < 3) return false;
  let intersectCount = 0;
  for (let j = 0; j < polygon. length; j++) {
    const k = (j + 1) % polygon.length;
    const latJ = polygon[j].latitude || polygon[j].lat;
    const latK = polygon[k].latitude || polygon[k].lat;
    const lngJ = polygon[j].longitude || polygon[j].lng;
    const lngK = polygon[k].longitude || polygon[k]. lng;
    if (! latJ || !latK || !lngJ || !lngK) continue;
    const condition1 = (latJ > point.latitude) !== (latK > point.latitude);
    const denom = latK - latJ;
    const slope = denom === 0 ?  Infinity : (lngK - lngJ) * (point.latitude - latJ) / denom;
    if (condition1 && point.longitude < slope + lngJ) {
      intersectCount++;
    }
  }
  return intersectCount % 2 === 1;
}

async function addDummyData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    let totalAttendance = 0;
    let totalAlarms = 0;

    for (const sweeperInfo of SWEEPERS) {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`📌 Processing:  ${sweeperInfo.name}`);
      console.log("=".repeat(80));

      const sweeper = await Sweeper. findById(sweeperInfo. id);
      if (!sweeper) {
        console.log(`❌ Sweeper not found:  ${sweeperInfo.name}`);
        continue;
      }

      // === ATTENDANCE ===
      console.log("\n📅 Adding Attendance Records:");
      
      const attendanceDays = sweeperInfo.highPerformer ? 6 : Math.floor(Math.random() * 3) + 3;
      const selectedDates = ATTENDANCE_DATES.slice().sort(() => Math.random() - 0.5).slice(0, attendanceDays);

      for (const date of selectedDates) {
        const location = getRandomLocation(sweeper. geofence);
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const existing = await Attendance.findOne({
          sweeperId: sweeper._id,
          date: { $gte: dayStart, $lt: dayEnd },
        });

        if (!existing) {
          await new Attendance({
            sweeperId: sweeper._id,
            date: date,
            location:  location,
          }).save();

          console.log(`   ✅ ${date. toISOString().split("T")[0]} - Lat: ${location.latitude. toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`);
          totalAttendance++;
        }
      }

      console.log(`   📊 Total attendance: ${attendanceDays}/7 days (${Math.round(attendanceDays / 7 * 100)}%)`);

      // === ALARM EVENTS - 3 PER DAY FOR 7 DAYS ===
      console.log("\n🚨 Adding Alarm Events (3 per day × 7 days = 21 total):");

      if (! sweeper.alarmEvents) sweeper.alarmEvents = {};

      let dayCounter = 1;
      for (const dateKey of DATE_KEYS) {
        
        if (! sweeper.alarmEvents[dateKey]) sweeper.alarmEvents[dateKey] = [];

        console.log(`\n   📅 Day ${dayCounter} (${dateKey}):`);

        // 3 alarms per day with different times
        const alarmTimes = [
          new Date(`${dateKey}T08:30:00Z`),
          new Date(`${dateKey}T10:15:00Z`),
          new Date(`${dateKey}T14:45:00Z`),
        ];

        // Pattern:  Verified, Missed, Verified
        const eventTypes = ["verified", "missed", "verified"];

        for (let i = 0; i < 3; i++) {
          const alarmTimestampMs = alarmTimes[i]. getTime();
          const eventId = new mongoose.Types.ObjectId().toString();

          let event = {
            id: eventId,
            alarmTimestampMs:  alarmTimestampMs,
            opened: false,
            openedTimestampMs: null,
            responseMs: null,
            verificationTimestampMs:  null,
            verificationStatus:  "missed",
            location: null,
            withinGeofence: null,
            createdAt: alarmTimes[i],
          };

          const type = eventTypes[i];

          if (type === "verified") {
            const location = getRandomLocation(sweeper.geofence);
            const openTime = alarmTimestampMs + (Math.random() * 120000 + 30000);
            const verifyTime = openTime + (Math.random() * 180000 + 60000);

            event.opened = true;
            event.openedTimestampMs = openTime;
            event. responseMs = openTime - alarmTimestampMs;
            event.verificationTimestampMs = verifyTime;
            event. verificationStatus = "attended";
            event.location = location;
            
            const normalizedGeofence = (sweeper.geofence || []).map(p => ({
              latitude: p. latitude || p.lat,
              longitude: p.longitude || p.lng
            })).filter(p => p.latitude && p.longitude);
            
            if (normalizedGeofence.length >= 3) {
              event. withinGeofence = isPointInPolygon(location, normalizedGeofence);
            } else {
              event.withinGeofence = Math.random() > 0.3; // 70% chance
            }

            console.log(`      ✅ Alarm ${i + 1} (${alarmTimes[i].toISOString().split('T')[1]. substring(0, 5)}) - VERIFIED - Response: ${Math.round(event.responseMs / 1000)}s - In Geofence: ${event. withinGeofence}`);

          } else {
            console.log(`      ❌ Alarm ${i + 1} (${alarmTimes[i].toISOString().split('T')[1].substring(0, 5)}) - MISSED`);
          }

          sweeper.alarmEvents[dateKey]. push(event);

          // Add to EventIndex
          try {
            await EventIndex.create({
              eventId: eventId,
              sweeperId: sweeper._id,
              dateKey: dateKey,
              storage:  "sweeper",
            });
          } catch (e) {
            // Ignore duplicate errors
          }

          totalAlarms++;
        }

        dayCounter++;
      }

      // CRITICAL: Mark as modified before saving
      sweeper.markModified('alarmEvents');
      await sweeper.save();
      console.log(`\n   💾 Saved 21 alarm events (3 per day × 7 days) for ${sweeperInfo.name}`);
    }

    console.log(`\n\n${"=".repeat(80)}`);
    console.log("✅ DUMMY DATA INSERTION COMPLETE");
    console.log("=".repeat(80));
    console.log(`📊 Total Attendance Records Added: ${totalAttendance}`);
    console.log(`🚨 Total Alarm Events Added:  ${totalAlarms}`);
    console.log(`👥 Sweepers Processed:  ${SWEEPERS.length}`);
    console.log("\n📋 Summary:");
    console.log(`   • Each sweeper:  21 alarm events (3 per day × 7 days)`);
    console.log(`   • Pattern per day: Verified, Missed, Verified`);
    console.log(`   • High performers: ~6-7 days attendance (86-100%)`);
    console.log(`   • Regular performers: ~3-5 days attendance (43-71%)`);
    console.log(`   • Date range: Dec 15-21, 2025`);
    console.log(`   • Alarm times: 8:30 AM, 10:15 AM, 2:45 PM each day`);
    console.log("=".repeat(80) + "\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB\n");
    process.exit(0);
  }
}

addDummyData();