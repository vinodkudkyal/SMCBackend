// const mongoose = require("mongoose");

// const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// // Schemas
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password:  String,
//   geofence:  { type: Array, default: [] },
//   checkpoints: { type: Array, default: [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type: String, default: null },
//   },
//   alarmEvents: { type: Object, default:  {} },
//   partitions: { type: Object, default: {} },
// });

// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose. Schema.Types.ObjectId, ref: "Sweeper" },
//   date: Date,
//   location: { latitude: Number, longitude:  Number },
//   createdAt:  { type: Date, default: Date.now },
// });

// const eventIndexSchema = new mongoose.Schema({
//   eventId: { type:  String, required: true, unique:  true, index: true },
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
//   dateKey:  { type: String, required: true },
//   storage: { type:  String, enum: ["sweeper", "group", "old"], default:  "sweeper" },
//   createdAt: { type: Date, default: Date.now },
// });

// const Sweeper = mongoose. model("Sweeper", sweeperSchema);
// const Attendance = mongoose.model("Attendance", attendanceSchema);
// const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// // Selected Sweepers
// const SWEEPERS = [
//   { id: "68da286c7172c21bf4a37c4d", name: "Akshay kambale", highPerformer: true },
//   { id: "68da29947172c21bf4a37c55", name: "Atish kuchekar", highPerformer:  true },
//   { id: "68e3820ab13dd1153fcf3ef7", name: "tanoj kadam", highPerformer: false },
//   { id: "69425c21531fd6f9b6c0bc77", name: "kartik", highPerformer: false },
//   { id: "68e37d42b13dd1153fcf3ec1", name: "vicky Ramesh Gaikwad", highPerformer: false },
//   { id: "69098f228d240ea50b2c2e5b", name: "Lakhan prabhakar gavli", highPerformer: true },
//   { id: "690990278d240ea50b2c2e73", name: "Gangaram Waghmare", highPerformer: false },
//   { id: "690994328d240ea50b2c2ec8", name: "Anand Gaikwad", highPerformer: false },
// ];

// // Week 3 of December 2025: Dec 15-21 (7 days)
// const ATTENDANCE_DATES = [
//   new Date("2025-12-15T07:00:00Z"),
//   new Date("2025-12-16T07:00:00Z"),
//   new Date("2025-12-17T07:00:00Z"),
//   new Date("2025-12-18T07:00:00Z"),
//   new Date("2025-12-19T07:00:00Z"),
//   new Date("2025-12-20T07:00:00Z"),
//   new Date("2025-12-21T07:00:00Z"),
// ];

// const DATE_KEYS = [
//   "2025-12-15",
//   "2025-12-16",
//   "2025-12-17",
//   "2025-12-18",
//   "2025-12-19",
//   "2025-12-20",
//   "2025-12-21",
// ];

// // Helper:  Random location
// function getRandomLocation(geofence) {
//   if (! geofence || geofence. length === 0) {
//     return {
//       latitude: 17.6805 + (Math.random() - 0.5) * 0.01,
//       longitude: 73.9903 + (Math.random() - 0.5) * 0.01,
//     };
//   }
//   const point = geofence[Math.floor(Math.random() * geofence.length)];
//   return {
//     latitude: (point.latitude || point.lat || 17.6805) + (Math.random() - 0.5) * 0.001,
//     longitude: (point. longitude || point.lng || 73.9903) + (Math.random() - 0.5) * 0.001,
//   };
// }

// // Helper: Point in polygon check
// function isPointInPolygon(point, polygon) {
//   if (! Array.isArray(polygon) || polygon.length < 3) return false;
//   let intersectCount = 0;
//   for (let j = 0; j < polygon. length; j++) {
//     const k = (j + 1) % polygon.length;
//     const latJ = polygon[j].latitude || polygon[j].lat;
//     const latK = polygon[k].latitude || polygon[k].lat;
//     const lngJ = polygon[j].longitude || polygon[j].lng;
//     const lngK = polygon[k].longitude || polygon[k]. lng;
//     if (! latJ || !latK || !lngJ || !lngK) continue;
//     const condition1 = (latJ > point.latitude) !== (latK > point.latitude);
//     const denom = latK - latJ;
//     const slope = denom === 0 ?  Infinity : (lngK - lngJ) * (point.latitude - latJ) / denom;
//     if (condition1 && point.longitude < slope + lngJ) {
//       intersectCount++;
//     }
//   }
//   return intersectCount % 2 === 1;
// }

// async function addDummyData() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ Connected to MongoDB\n");

//     let totalAttendance = 0;
//     let totalAlarms = 0;

//     for (const sweeperInfo of SWEEPERS) {
//       console.log(`\n${"=".repeat(80)}`);
//       console.log(`📌 Processing:  ${sweeperInfo.name}`);
//       console.log("=".repeat(80));

//       const sweeper = await Sweeper. findById(sweeperInfo. id);
//       if (!sweeper) {
//         console.log(`❌ Sweeper not found:  ${sweeperInfo.name}`);
//         continue;
//       }

//       // === ATTENDANCE ===
//       console.log("\n📅 Adding Attendance Records:");

//       const attendanceDays = sweeperInfo.highPerformer ? 6 : Math.floor(Math.random() * 3) + 3;
//       const selectedDates = ATTENDANCE_DATES.slice().sort(() => Math.random() - 0.5).slice(0, attendanceDays);

//       for (const date of selectedDates) {
//         const location = getRandomLocation(sweeper. geofence);

//         const dayStart = new Date(date);
//         dayStart.setHours(0, 0, 0, 0);
//         const dayEnd = new Date(dayStart);
//         dayEnd.setDate(dayEnd.getDate() + 1);

//         const existing = await Attendance.findOne({
//           sweeperId: sweeper._id,
//           date: { $gte: dayStart, $lt: dayEnd },
//         });

//         if (!existing) {
//           await new Attendance({
//             sweeperId: sweeper._id,
//             date: date,
//             location:  location,
//           }).save();

//           console.log(`   ✅ ${date. toISOString().split("T")[0]} - Lat: ${location.latitude. toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`);
//           totalAttendance++;
//         }
//       }

//       console.log(`   📊 Total attendance: ${attendanceDays}/7 days (${Math.round(attendanceDays / 7 * 100)}%)`);

//       // === ALARM EVENTS - 3 PER DAY FOR 7 DAYS ===
//       console.log("\n🚨 Adding Alarm Events (3 per day × 7 days = 21 total):");

//       if (! sweeper.alarmEvents) sweeper.alarmEvents = {};

//       let dayCounter = 1;
//       for (const dateKey of DATE_KEYS) {

//         if (! sweeper.alarmEvents[dateKey]) sweeper.alarmEvents[dateKey] = [];

//         console.log(`\n   📅 Day ${dayCounter} (${dateKey}):`);

//         // 3 alarms per day with different times
//         const alarmTimes = [
//           new Date(`${dateKey}T08:30:00Z`),
//           new Date(`${dateKey}T10:15:00Z`),
//           new Date(`${dateKey}T14:45:00Z`),
//         ];

//         // Pattern:  Verified, Missed, Verified
//         const eventTypes = ["verified", "missed", "verified"];

//         for (let i = 0; i < 3; i++) {
//           const alarmTimestampMs = alarmTimes[i]. getTime();
//           const eventId = new mongoose.Types.ObjectId().toString();

//           let event = {
//             id: eventId,
//             alarmTimestampMs:  alarmTimestampMs,
//             opened: false,
//             openedTimestampMs: null,
//             responseMs: null,
//             verificationTimestampMs:  null,
//             verificationStatus:  "missed",
//             location: null,
//             withinGeofence: null,
//             createdAt: alarmTimes[i],
//           };

//           const type = eventTypes[i];

//           if (type === "verified") {
//             const location = getRandomLocation(sweeper.geofence);
//             const openTime = alarmTimestampMs + (Math.random() * 120000 + 30000);
//             const verifyTime = openTime + (Math.random() * 180000 + 60000);

//             event.opened = true;
//             event.openedTimestampMs = openTime;
//             event. responseMs = openTime - alarmTimestampMs;
//             event.verificationTimestampMs = verifyTime;
//             event. verificationStatus = "attended";
//             event.location = location;

//             const normalizedGeofence = (sweeper.geofence || []).map(p => ({
//               latitude: p. latitude || p.lat,
//               longitude: p.longitude || p.lng
//             })).filter(p => p.latitude && p.longitude);

//             if (normalizedGeofence.length >= 3) {
//               event. withinGeofence = isPointInPolygon(location, normalizedGeofence);
//             } else {
//               event.withinGeofence = Math.random() > 0.3; // 70% chance
//             }

//             console.log(`      ✅ Alarm ${i + 1} (${alarmTimes[i].toISOString().split('T')[1]. substring(0, 5)}) - VERIFIED - Response: ${Math.round(event.responseMs / 1000)}s - In Geofence: ${event. withinGeofence}`);

//           } else {
//             console.log(`      ❌ Alarm ${i + 1} (${alarmTimes[i].toISOString().split('T')[1].substring(0, 5)}) - MISSED`);
//           }

//           sweeper.alarmEvents[dateKey]. push(event);

//           // Add to EventIndex
//           try {
//             await EventIndex.create({
//               eventId: eventId,
//               sweeperId: sweeper._id,
//               dateKey: dateKey,
//               storage:  "sweeper",
//             });
//           } catch (e) {
//             // Ignore duplicate errors
//           }

//           totalAlarms++;
//         }

//         dayCounter++;
//       }

//       // CRITICAL: Mark as modified before saving
//       sweeper.markModified('alarmEvents');
//       await sweeper.save();
//       console.log(`\n   💾 Saved 21 alarm events (3 per day × 7 days) for ${sweeperInfo.name}`);
//     }

//     console.log(`\n\n${"=".repeat(80)}`);
//     console.log("✅ DUMMY DATA INSERTION COMPLETE");
//     console.log("=".repeat(80));
//     console.log(`📊 Total Attendance Records Added: ${totalAttendance}`);
//     console.log(`🚨 Total Alarm Events Added:  ${totalAlarms}`);
//     console.log(`👥 Sweepers Processed:  ${SWEEPERS.length}`);
//     console.log("\n📋 Summary:");
//     console.log(`   • Each sweeper:  21 alarm events (3 per day × 7 days)`);
//     console.log(`   • Pattern per day: Verified, Missed, Verified`);
//     console.log(`   • High performers: ~6-7 days attendance (86-100%)`);
//     console.log(`   • Regular performers: ~3-5 days attendance (43-71%)`);
//     console.log(`   • Date range: Dec 15-21, 2025`);
//     console.log(`   • Alarm times: 8:30 AM, 10:15 AM, 2:45 PM each day`);
//     console.log("=".repeat(80) + "\n");

//   } catch (error) {
//     console.error("❌ Error:", error.message);
//     console.error(error.stack);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB\n");
//     process.exit(0);
//   }
// }

// addDummyData();






// const mongoose = require("mongoose");

// const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// // Schemas
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default:  [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type:  String, default: null },
//   },
//   alarmEvents: { type: Object, default: {} },
//   partitions: { type: Object, default:  {} },
// });

// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   date: Date,
//   location: { latitude: Number, longitude: Number },
//   createdAt: { type: Date, default: Date.now },
// });

// const eventIndexSchema = new mongoose.Schema({
//   eventId: { type: String, required: true, unique: true, index: true },
//   sweeperId: { type: mongoose.Schema.Types. ObjectId, ref: "Sweeper", required: true },
//   dateKey: { type: String, required: true },
//   storage: { type: String, enum: ["sweeper", "group", "old"], default: "sweeper" },
//   createdAt: { type: Date, default: Date.now },
// });

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);
// const Attendance = mongoose. model("Attendance", attendanceSchema);
// const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// // Selected Sweepers with different missed counts
// const SWEEPERS = [
//   { id: "68da286c7172c21bf4a37c4d", name: "Akshay kambale", highPerformer: true, missedCount: 3 },
//   { id: "68da29947172c21bf4a37c55", name: "Atish kuchekar", highPerformer: true, missedCount: 2 },
//   { id:  "68e3820ab13dd1153fcf3ef7", name: "tanoj kadam", highPerformer: false, missedCount: 7 },
//   { id: "69425c21531fd6f9b6c0bc77", name: "kartik", highPerformer: false, missedCount: 9 },
//   { id: "68e37d42b13dd1153fcf3ec1", name: "vicky Ramesh Gaikwad", highPerformer: false, missedCount: 8 },
//   { id: "69098f228d240ea50b2c2e5b", name: "Lakhan prabhakar gavli", highPerformer: true, missedCount: 4 },
//   { id: "690990278d240ea50b2c2e73", name: "Gangaram Waghmare", highPerformer: false, missedCount: 10 },
//   { id:  "690994328d240ea50b2c2ec8", name: "Anand Gaikwad", highPerformer: false, missedCount:  6 },
// ];

// const DATE_KEYS = [
//   "2025-12-15",
//   "2025-12-16",
//   "2025-12-17",
//   "2025-12-18",
//   "2025-12-19",
//   "2025-12-20",
//   "2025-12-21",
// ];

// // Helper:  Random location
// function getRandomLocation() {
//   return {
//     latitude: 17.6805 + (Math.random() - 0.5) * 0.001,
//     longitude: 73.9903 + (Math.random() - 0.5) * 0.001,
//   };
// }

// // Generate alarm pattern based on missed count
// function generateAlarmPattern(missedCount) {
//   const totalAlarms = 21;
//   const verifiedCount = totalAlarms - missedCount;

//   // Calculate how many full days (3 verified = attendance marked)
//   const fullDays = Math.floor(verifiedCount / 3);
//   const remainingVerified = verifiedCount % 3;

//   let pattern = [];

//   // Add full days
//   for (let i = 0; i < fullDays; i++) {
//     pattern.push(3);
//   }

//   // Distribute remaining verified alarms
//   if (remainingVerified > 0) {
//     pattern.push(remainingVerified);
//   }

//   // Fill rest with days that have fewer verified (or 0)
//   while (pattern.length < 7) {
//     const remaining = 7 - pattern.length;
//     const alarmsLeft = missedCount - (pattern.length * 3 - pattern.reduce((a, b) => a + b, 0));

//     if (alarmsLeft >= 3) {
//       pattern.push(0); // All 3 missed
//     } else if (alarmsLeft === 2) {
//       pattern.push(1); // 1 verified, 2 missed
//     } else if (alarmsLeft === 1) {
//       pattern.push(2); // 2 verified, 1 missed
//     } else {
//       pattern.push(0);
//     }
//   }

//   // Shuffle to randomize
//   for (let i = pattern.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
//   }

//   return pattern;
// }

// async function addDummyData() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ Connected to MongoDB\n");

//     let totalAttendance = 0;
//     let totalAlarms = 0;

//     for (const sweeperInfo of SWEEPERS) {
//       console.log(`\n${"=".repeat(80)}`);
//       console.log(`📌 Processing: ${sweeperInfo.name} (${sweeperInfo.highPerformer ? 'HIGH PERFORMER' : 'REGULAR'}) - Target Missed: ${sweeperInfo.missedCount}`);
//       console.log("=".repeat(80));

//       const sweeper = await Sweeper.findById(sweeperInfo. id);
//       if (!sweeper) {
//         console.log(`❌ Sweeper not found: ${sweeperInfo.name}`);
//         continue;
//       }

//       if (! sweeper.alarmEvents) sweeper.alarmEvents = {};

//       // Generate pattern based on missed count
//       const dailyPattern = generateAlarmPattern(sweeperInfo.missedCount);

//       let totalVerified = 0;
//       let totalMissed = 0;
//       let attendanceDays = 0;

//       console.log("\n🚨 Adding Alarm Events:");

//       for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
//         const dateKey = DATE_KEYS[dayIndex];
//         const verifiedToday = dailyPattern[dayIndex]; // 0, 1, 2, or 3
//         const missedToday = 3 - verifiedToday;

//         if (! sweeper.alarmEvents[dateKey]) sweeper.alarmEvents[dateKey] = [];

//         console.log(`\n   📅 Day ${dayIndex + 1} (${dateKey}): ${verifiedToday} verified, ${missedToday} missed`);

//         // 3 alarm times (all before 10 AM)
//         const alarmTimes = [
//           new Date(`${dateKey}T07:30:00Z`), // 7:30 AM
//           new Date(`${dateKey}T08:45:00Z`), // 8:45 AM
//           new Date(`${dateKey}T09:30:00Z`), // 9:30 AM
//         ];

//         // Determine which alarms are verified
//         let alarmStatuses = [];
//         for (let i = 0; i < 3; i++) {
//           alarmStatuses.push(i < verifiedToday ? "verified" : "missed");
//         }

//         // Shuffle to randomize which alarms are verified/missed
//         alarmStatuses = alarmStatuses.sort(() => Math.random() - 0.5);

//         // Variable to store last verified location for attendance
//         let lastVerifiedLocation = null;

//         for (let i = 0; i < 3; i++) {
//           const alarmTimestampMs = alarmTimes[i]. getTime();
//           const eventId = new mongoose.Types.ObjectId().toString();
//           const location = getRandomLocation();

//           let event = {
//             id: eventId,
//             alarmTimestampMs: alarmTimestampMs,
//             opened: false,
//             openedTimestampMs: null,
//             responseMs: null,
//             verificationTimestampMs: null,
//             verificationStatus: "missed",
//             location: null,
//             withinGeofence: null,
//             createdAt: alarmTimes[i],
//           };

//           if (alarmStatuses[i] === "verified") {
//             const openTime = alarmTimestampMs + (Math.random() * 60000 + 30000); // 30s-90s
//             const verifyTime = openTime + (Math.random() * 120000 + 60000); // 1-3min after

//             event.opened = true;
//             event.openedTimestampMs = openTime;
//             event.responseMs = openTime - alarmTimestampMs;
//             event.verificationTimestampMs = verifyTime;
//             event.verificationStatus = "attended";
//             event.location = location;
//             event.withinGeofence = true; // ALL are within geofence

//             lastVerifiedLocation = location; // Store for attendance

//             console.log(`      ✅ Alarm ${i + 1} (${alarmTimes[i].toISOString().split('T')[1]. substring(0, 5)}) - VERIFIED - Response: ${Math.round(event.responseMs / 1000)}s`);
//             totalVerified++;
//           } else {
//             console.log(`      ❌ Alarm ${i + 1} (${alarmTimes[i].toISOString().split('T')[1].substring(0, 5)}) - MISSED`);
//             totalMissed++;
//           }

//           sweeper. alarmEvents[dateKey].push(event);

//           // Add to EventIndex
//           try {
//             await EventIndex.create({
//               eventId: eventId,
//               sweeperId: sweeper._id,
//               dateKey: dateKey,
//               storage:  "sweeper",
//             });
//           } catch (e) {
//             // Ignore duplicates
//           }

//           totalAlarms++;
//         }

//         // Mark attendance if all 3 alarms verified today
//         if (verifiedToday === 3) {
//           const attendanceDate = new Date(`${dateKey}T07:00:00Z`);
//           const dayStart = new Date(attendanceDate);
//           dayStart.setHours(0, 0, 0, 0);
//           const dayEnd = new Date(dayStart);
//           dayEnd.setDate(dayEnd.getDate() + 1);

//           const existing = await Attendance.findOne({
//             sweeperId: sweeper._id,
//             date: { $gte: dayStart, $lt:  dayEnd },
//           });

//           if (!existing) {
//             await new Attendance({
//               sweeperId: sweeper._id,
//               date: attendanceDate,
//               location: lastVerifiedLocation || getRandomLocation(), // Use last verified location
//             }).save();
//             attendanceDays++;
//             console.log(`      ✅ ATTENDANCE MARKED for ${dateKey}`);
//           }
//         }
//       }

//       // Mark as modified and save
//       sweeper.markModified('alarmEvents');
//       await sweeper.save();

//       totalAttendance += attendanceDays;

//       console.log(`\n   📊 Summary for ${sweeperInfo.name}:`);
//       console.log(`      • Total alarms: 21`);
//       console.log(`      • Verified: ${totalVerified}`);
//       console.log(`      • Missed: ${totalMissed} (Target: ${sweeperInfo.missedCount})`);
//       console.log(`      • Attendance days: ${attendanceDays}/7 (${Math.round(attendanceDays / 7 * 100)}%)`);
//       console.log(`   💾 Saved successfully`);
//     }

//     console. log(`\n\n${"=".repeat(80)}`);
//     console.log("✅ DUMMY DATA INSERTION COMPLETE");
//     console.log("=".repeat(80));
//     console.log(`📊 Total Attendance Records Added: ${totalAttendance}`);
//     console.log(`🚨 Total Alarm Events Added: ${totalAlarms}`);
//     console.log(`👥 Sweepers Processed: ${SWEEPERS.length}`);
//     console.log("\n📋 Summary:");
//     console.log(`   • Each sweeper: 21 alarm events (3 per day × 7 days)`);
//     console.log(`   • Missed counts:  Variable (2-10 per sweeper)`);
//     console.log(`   • All alarms before 10:00 AM (7:30, 8:45, 9:30)`);
//     console.log(`   • All geofence checks: true`);
//     console.log(`   • Attendance marked only when 3 verified on same day`);
//     console.log(`   • High performers: 2-4 missed (more attendance)`);
//     console.log(`   • Regular performers: 6-10 missed (less attendance)`);
//     console.log(`   • Date range: Dec 15-21, 2025`);
//     console.log("=".repeat(80) + "\n");

//   } catch (error) {
//     console.error("❌ Error:", error.message);
//     console.error(error.stack);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB\n");
//     process.exit(0);
//   }
// }

// addDummyData();




// const mongoose = require("mongoose");

// const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// // Schemas
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default: [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type: String, default: null },
//   },
//   alarmEvents: { type: Object, default: {} },
//   partitions: { type: Object, default: {} },
// });

// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   date: Date,
//   location: { latitude: Number, longitude: Number },
//   createdAt: { type: Date, default: Date.now },
// });

// const eventIndexSchema = new mongoose.Schema({
//   eventId: { type: String, required: true, unique: true, index: true },
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
//   dateKey: { type: String, required: true },
//   storage: { type: String, enum: ["sweeper", "group", "old"], default: "sweeper" },
//   createdAt: { type: Date, default: Date.now },
// });

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);
// const Attendance = mongoose.model("Attendance", attendanceSchema);
// const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// // Selected Sweepers with different missed counts
// const SWEEPERS = [
//   { id: "68da286c7172c21bf4a37c4d", name: "Akshay kambale", highPerformer: true, missedCount: 3 },
//   { id: "68da29947172c21bf4a37c55", name: "Atish kuchekar", highPerformer: true, missedCount: 2 },
//   { id: "68e3820ab13dd1153fcf3ef7", name: "tanoj kadam", highPerformer: false, missedCount: 7 },
//   { id: "69425c21531fd6f9b6c0bc77", name: "kartik", highPerformer: false, missedCount: 9 },
//   { id: "68e37d42b13dd1153fcf3ec1", name: "vicky Ramesh Gaikwad", highPerformer: false, missedCount: 8 },
//   { id: "69098f228d240ea50b2c2e5b", name: "Lakhan prabhakar gavli", highPerformer: true, missedCount: 4 },
//   { id: "690990278d240ea50b2c2e73", name: "Gangaram Waghmare", highPerformer: false, missedCount: 10 },
//   { id: "690994328d240ea50b2c2ec8", name: "Anand Gaikwad", highPerformer: false, missedCount: 6 },
// ];

// const DATE_KEYS = [
//   "2025-12-15",
//   "2025-12-16",
//   "2025-12-17",
//   "2025-12-18",
//   "2025-12-19",
//   "2025-12-20",
//   "2025-12-21",
// ];

// // Helper:   Random location
// function getRandomLocation() {
//   return {
//     latitude: 17.6805 + (Math.random() - 0.5) * 0.001,
//     longitude: 73.9903 + (Math.random() - 0.5) * 0.001,
//   };
// }

// // Helper: Convert 12-hour format (e.g., "6:30 AM") or 24-hour (e.g., "06:30") to 24-hour HH:mm
// function convertTo24Hour(timeStr) {
//   if (!timeStr) return "06:30";

//   timeStr = timeStr.trim();

//   // Check if it's already in 24-hour format (HH:mm)
//   if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
//     const [hours, minutes] = timeStr.split(':');
//     return `${hours.padStart(2, '0')}:${minutes}`;
//   }

//   // Parse 12-hour format (e.  g., "6:30 AM" or "10:30 PM")
//   const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
//   if (!match) return "06:30"; // Default fallback

//   let hours = parseInt(match[1], 10);
//   const minutes = match[2];
//   const period = match[3].toUpperCase();

//   if (period === 'PM' && hours !== 12) {
//     hours += 12;
//   } else if (period === 'AM' && hours === 12) {
//     hours = 0;
//   }

//   return `${String(hours).padStart(2, '0')}:${minutes}`;
// }

// // Helper: Parse time string (HH:mm) and convert to hours
// function parseTimeToHours(timeStr) {
//   if (!timeStr) return null;
//   const parts = timeStr.split(':');
//   if (parts.length !== 2) return null;
//   const hours = parseInt(parts[0], 10);
//   const minutes = parseInt(parts[1], 10);
//   if (isNaN(hours) || isNaN(minutes)) return null;
//   return hours + minutes / 60;
// }

// // Helper: Generate alarm times within duty period
// // Helper:  Generate alarm times within duty period
// function generateAlarmTimes(dateKey, dutyStart, dutyEnd) {
//   const startHours = parseTimeToHours(dutyStart);
//   const endHours = parseTimeToHours(dutyEnd);

//   // Default to 6:30 AM - 10:00 AM if duty time not set
//   const effectiveStart = startHours !== null ? startHours : 6.5;
//   const effectiveEnd = endHours !== null ? Math.min(endHours, 10) : 10;

//   // Generate 3 alarm times evenly distributed within duty period
//   const duration = effectiveEnd - effectiveStart;
//   const interval = duration / 4; // Divide into 4 parts, use middle 3

//   const alarmTimes = [];
//   for (let i = 1; i <= 3; i++) {
//     const hours = effectiveStart + (interval * i);
//     const hoursPart = Math.floor(hours);
//     const minutesPart = Math.round((hours - hoursPart) * 60);

//     const timeStr = `${String(hoursPart).padStart(2, '0')}:${String(minutesPart).padStart(2, '0')}: 00`;
//     const alarmDate = new Date(`${dateKey}T${timeStr}Z`);

//     // Validate the date
//     if (isNaN(alarmDate.getTime())) {
//       console.error(`❌ Invalid date generated:  ${dateKey}T${timeStr}Z`);
//       continue;
//     }

//     alarmTimes.push(alarmDate);
//   }

//   return alarmTimes;
// }

// // Generate alarm pattern based on missed count
// function generateAlarmPattern(missedCount) {
//   const totalAlarms = 21;
//   const verifiedCount = totalAlarms - missedCount;

//   // Calculate how many full days (3 verified = attendance marked)
//   const fullDays = Math.floor(verifiedCount / 3);
//   const remainingVerified = verifiedCount % 3;

//   let pattern = [];

//   // Add full days
//   for (let i = 0; i < fullDays; i++) {
//     pattern.push(3);
//   }

//   // Distribute remaining verified alarms
//   if (remainingVerified > 0) {
//     pattern.push(remainingVerified);
//   }

//   // Fill rest with days that have fewer verified (or 0)
//   while (pattern.length < 7) {
//     const alarmsLeft = missedCount - (pattern.length * 3 - pattern.reduce((a, b) => a + b, 0));

//     if (alarmsLeft >= 3) {
//       pattern.push(0); // All 3 missed
//     } else if (alarmsLeft === 2) {
//       pattern.push(1); // 1 verified, 2 missed
//     } else if (alarmsLeft === 1) {
//       pattern.push(2); // 2 verified, 1 missed
//     } else {
//       pattern.push(0);
//     }
//   }

//   // Shuffle to randomize
//   for (let i = pattern.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
//   }

//   return pattern;
// }

// async function addDummyData() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ Connected to MongoDB\n");

//     let totalAttendance = 0;
//     let totalAlarms = 0;

//     for (const sweeperInfo of SWEEPERS) {
//       console.log(`\n${"=".repeat(80)}`);
//       console.log(`📌 Processing: ${sweeperInfo.name} (${sweeperInfo.highPerformer ? 'HIGH PERFORMER' : 'REGULAR'}) - Target Missed: ${sweeperInfo.missedCount}`);
//       console.log("=".repeat(80));

//       const sweeper = await Sweeper.findById(sweeperInfo.id);
//       if (!sweeper) {
//         console.log(`❌ Sweeper not found: ${sweeperInfo.name}`);
//         continue;
//       }

//       // Get duty time and convert to 24-hour format
//       const dutyStartRaw = sweeper.dutyTime?.start || "06:30";
//       const dutyEndRaw = sweeper.dutyTime?.end || "10:00";
// s
//       const dutyStart = convertTo24Hour(dutyStartRaw);
//       const dutyEnd = convertTo24Hour(dutyEndRaw);

//       console.log(`⏰ Duty Time: ${dutyStartRaw} → ${dutyStart} to ${dutyEndRaw} → ${dutyEnd}`);

//       if (!sweeper.alarmEvents) sweeper.alarmEvents = {};

//       // Generate pattern based on missed count
//       const dailyPattern = generateAlarmPattern(sweeperInfo.missedCount);

//       let totalVerified = 0;
//       let totalMissed = 0;
//       let attendanceDays = 0;

//       console.log("\n🚨 Adding Alarm Events:");

//       for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
//         const dateKey = DATE_KEYS[dayIndex];
//         const verifiedToday = dailyPattern[dayIndex]; // 0, 1, 2, or 3
//         const missedToday = 3 - verifiedToday;

//         if (!sweeper.alarmEvents[dateKey]) sweeper.alarmEvents[dateKey] = [];

//         console.log(`\n   📅 Day ${dayIndex + 1} (${dateKey}): ${verifiedToday} verified, ${missedToday} missed`);

//         // Generate 3 alarm times within duty period
//         const alarmTimes = generateAlarmTimes(dateKey, dutyStart, dutyEnd);

//         if (alarmTimes.length !== 3) {
//           console.error(`❌ Failed to generate 3 alarm times for ${dateKey}`);
//           continue;
//         }

//         // Determine which alarms are verified
//         let alarmStatuses = [];
//         for (let i = 0; i < 3; i++) {
//           alarmStatuses.push(i < verifiedToday ? "verified" : "missed");
//         }

//         // Shuffle to randomize which alarms are verified/missed
//         alarmStatuses = alarmStatuses.sort(() => Math.random() - 0.5);

//         // Variable to store last verified location for attendance
//         let lastVerifiedLocation = null;

//         for (let i = 0; i < 3; i++) {
//           const alarmTime = alarmTimes[i];
//           const alarmTimestampMs = alarmTime.getTime();
//           const eventId = new mongoose.Types.ObjectId().toString();
//           const location = getRandomLocation();

//           let event = {
//             id: eventId,
//             alarmTimestampMs: alarmTimestampMs,
//             opened: false,
//             openedTimestampMs: null,
//             responseMs: null,
//             verificationTimestampMs: null,
//             verificationStatus: "missed",
//             location: null,
//             withinGeofence: null,
//             createdAt: alarmTime,
//           };

//           if (alarmStatuses[i] === "verified") {
//             const openTime = alarmTimestampMs + (Math.random() * 60000 + 30000); // 30s-90s
//             const verifyTime = openTime + (Math.random() * 120000 + 60000); // 1-3min after

//             event.opened = true;
//             event.openedTimestampMs = openTime;
//             event.responseMs = openTime - alarmTimestampMs;
//             event.verificationTimestampMs = verifyTime;
//             event.verificationStatus = "attended";
//             event.location = location;
//             event.withinGeofence = true; // ALL are within geofence

//             lastVerifiedLocation = location; // Store for attendance

//             const timeStr = alarmTime.toISOString().split('T')[1].substring(0, 5);
//             console.log(`      ✅ Alarm ${i + 1} (${timeStr}) - VERIFIED - Response: ${Math.round(event.responseMs / 1000)}s`);
//             totalVerified++;
//           } else {
//             const timeStr = alarmTime.toISOString().split('T')[1].substring(0, 5);
//             console.log(`      ❌ Alarm ${i + 1} (${timeStr}) - MISSED`);
//             totalMissed++;
//           }

//           sweeper.alarmEvents[dateKey].push(event);

//           // Add to EventIndex
//           try {
//             await EventIndex.create({
//               eventId: eventId,
//               sweeperId: sweeper._id,
//               dateKey: dateKey,
//               storage: "sweeper",
//             });
//           } catch (e) {
//             // Ignore duplicates
//           }

//           totalAlarms++;
//         }

//         // Mark attendance if all 3 alarms verified today
//         if (verifiedToday === 3) {
//           const attendanceDate = new Date(`${dateKey}T${dutyStart}: 00Z`);
//           const dayStart = new Date(attendanceDate);
//           dayStart.setHours(0, 0, 0, 0);
//           const dayEnd = new Date(dayStart);
//           dayEnd.setDate(dayEnd.getDate() + 1);

//           const existing = await Attendance.findOne({
//             sweeperId: sweeper._id,
//             date: { $gte: dayStart, $lt: dayEnd },
//           });

//           if (!existing) {
//             await new Attendance({
//               sweeperId: sweeper._id,
//               date: attendanceDate,
//               location: lastVerifiedLocation || getRandomLocation(),
//             }).save();
//             attendanceDays++;
//             console.log(`      ✅ ATTENDANCE MARKED for ${dateKey} at ${dutyStart}`);
//           }
//         }
//       }

//       // Mark as modified and save
//       sweeper.markModified('alarmEvents');
//       await sweeper.save();

//       totalAttendance += attendanceDays;

//       console.log(`\n   📊 Summary for ${sweeperInfo.name}:`);
//       console.log(`      • Total alarms: 21`);
//       console.log(`      • Verified: ${totalVerified}`);
//       console.log(`      • Missed: ${totalMissed} (Target:  ${sweeperInfo.missedCount})`);
//       console.log(`      • Attendance days: ${attendanceDays}/7 (${Math.round(attendanceDays / 7 * 100)}%)`);
//       console.log(`   💾 Saved successfully`);
//     }

//     console.log(`\n\n${"=".repeat(80)}`);
//     console.log("✅ DUMMY DATA INSERTION COMPLETE");
//     console.log("=".repeat(80));
//     console.log(`📊 Total Attendance Records Added: ${totalAttendance}`);
//     console.log(`🚨 Total Alarm Events Added: ${totalAlarms}`);
//     console.log(`👥 Sweepers Processed:  ${SWEEPERS.length}`);
//     console.log("\n📋 Summary:");
//     console.log(`   • Each sweeper: 21 alarm events (3 per day × 7 days)`);
//     console.log(`   • Missed counts: Variable (2-10 per sweeper)`);
//     console.log(`   • All alarms within duty time and before 10:00 AM`);
//     console.log(`   • All geofence checks: true`);
//     console.log(`   • Attendance marked only when 3 verified on same day`);
//     console.log(`   • Attendance time = duty start time`);
//     console.log(`   • High performers: 2-4 missed (more attendance)`);
//     console.log(`   • Regular performers: 6-10 missed (less attendance)`);
//     console.log(`   • Date range: Dec 15-21, 2025`);
//     console.log("=".repeat(80) + "\n");

//   } catch (error) {
//     console.error("❌ Error:", error.message);
//     console.error(error.stack);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB\n");
//     process.exit(0);
//   }
// }

// addDummyData();





// const mongoose = require("mongoose");

// const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// // Schemas
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   password: String,
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default: [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type: String, default: null },
//   },
//   alarmEvents: { type: Object, default: {} },
//   partitions: { type: Object, default: {} },
// });

// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   date: Date,
//   location: { latitude: Number, longitude: Number },
//   createdAt: { type: Date, default: Date.now },
// });

// const eventIndexSchema = new mongoose.Schema({
//   eventId: { type: String, required: true, unique: true, index: true },
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
//   dateKey: { type: String, required: true },
//   storage: { type: String, enum: ["sweeper", "group", "old"], default: "sweeper" },
//   createdAt: { type: Date, default: Date.now },
// });

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);
// const Attendance = mongoose.model("Attendance", attendanceSchema);
// const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// // Selected Sweepers with different missed counts
// const SWEEPERS = [
//   { id: "68da286c7172c21bf4a37c4d", name: "Akshay kambale", highPerformer: true, missedCount: 3 },
//   { id: "68da29947172c21bf4a37c55", name: "Atish kuchekar", highPerformer: true, missedCount: 2 },
//   { id: "68e3820ab13dd1153fcf3ef7", name: "tanoj kadam", highPerformer: false, missedCount: 7 },
//   { id: "69425c21531fd6f9b6c0bc77", name: "kartik", highPerformer: false, missedCount: 9 },
//   { id: "68e37d42b13dd1153fcf3ec1", name: "vicky Ramesh Gaikwad", highPerformer: false, missedCount: 8 },
//   { id: "69098f228d240ea50b2c2e5b", name: "Lakhan prabhakar gavli", highPerformer: true, missedCount: 4 },
//   { id: "690990278d240ea50b2c2e73", name: "Gangaram Waghmare", highPerformer: false, missedCount: 10 },
//   { id: "690994328d240ea50b2c2ec8", name: "Anand Gaikwad", highPerformer: false, missedCount: 6 },
// ];

// const DATE_KEYS = [
//   "2025-12-15",
//   "2025-12-16",
//   "2025-12-17",
//   "2025-12-18",
//   "2025-12-19",
//   "2025-12-20",
//   "2025-12-21",
// ];

// // Helper:  Random location
// function getRandomLocation() {
//   return {
//     latitude: 17.6805 + (Math.random() - 0.5) * 0.001,
//     longitude: 73.9903 + (Math.random() - 0.5) * 0.001,
//   };
// }

// // Helper: Convert 12-hour format to 24-hour
// function convertTo24Hour(timeStr) {
//   if (!timeStr) return "06:30";

//   timeStr = timeStr.trim();

//   // Check if already in 24-hour format
//   if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
//     const [hours, minutes] = timeStr.split(':');
//     return `${hours.padStart(2, '0')}:${minutes}`;
//   }

//   // Parse 12-hour format
//   const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
//   if (!match) return "06:30";

//   let hours = parseInt(match[1], 10);
//   const minutes = match[2];
//   const period = match[3].toUpperCase();

//   if (period === 'PM' && hours !== 12) {
//     hours += 12;
//   } else if (period === 'AM' && hours === 12) {
//     hours = 0;
//   }

//   return `${String(hours).padStart(2, '0')}:${minutes}`;
// }

// // Helper: Parse time to hours
// function parseTimeToHours(timeStr) {
//   if (!timeStr) return null;
//   const parts = timeStr.split(':');
//   if (parts.length !== 2) return null;
//   const hours = parseInt(parts[0], 10);
//   const minutes = parseInt(parts[1], 10);
//   if (isNaN(hours) || isNaN(minutes)) return null;
//   return hours + minutes / 60;
// }

// // Helper: Generate alarm times within duty period
// // Helper:  Generate alarm times within duty period
// // Helper:  Generate alarm times within duty period (in LOCAL time, not UTC)
// function generateAlarmTimes(dateKey, dutyStart, dutyEnd) {
//   const startHours = parseTimeToHours(dutyStart);
//   const endHours = parseTimeToHours(dutyEnd);

//   // Default to 6:30 AM - 10:00 AM if duty time not set
//   const effectiveStart = startHours !== null ? startHours : 6.5;

//   // CRITICAL: Cap at 10 AM (10.0 hours), even if duty end is later
//   const effectiveEnd = endHours !== null ? Math.min(endHours, 10.0) : 10.0;

//   // Ensure we have a valid range
//   if (effectiveEnd <= effectiveStart) {
//     console.error(`❌ Invalid duty time range: ${effectiveStart} to ${effectiveEnd}`);
//     // Fallback to default times (WITHOUT 'Z' - local time)
//     return [
//       new Date(`${dateKey}T07:30:00`),
//       new Date(`${dateKey}T08:45:00`),
//       new Date(`${dateKey}T09:30:00`),
//     ];
//   }

//   const duration = effectiveEnd - effectiveStart;
//   const interval = duration / 4; // Divide into 4 parts, use middle 3

//   const alarmTimes = [];
//   for (let i = 1; i <= 3; i++) {
//     const hours = effectiveStart + (interval * i);
//     const hoursPart = Math.floor(hours);
//     const minutesPart = Math.round((hours - hoursPart) * 60);

//     // Ensure minutes are valid (0-59)
//     const validMinutes = Math.min(59, Math.max(0, minutesPart));

//     // IMPORTANT: Create date WITHOUT 'Z' suffix to use local time
//     const timeStr = `${String(hoursPart).padStart(2, '0')}:${String(validMinutes).padStart(2, '0')}:00`;
//     const alarmDate = new Date(`${dateKey}T${timeStr}`);

//     // Validate the date
//     if (isNaN(alarmDate.getTime())) {
//       console.error(`❌ Invalid date generated: ${dateKey}T${timeStr}`);
//       console.error(`   Hours: ${hours}, HoursPart: ${hoursPart}, Minutes: ${minutesPart}`);
//       continue;
//     }

//     // Double-check the hour is AM (before 12)
//     const generatedHour = alarmDate.getHours();
//     if (generatedHour >= 12) {
//       console.error(`❌ Generated PM time:  ${alarmDate.toISOString()} (hour:  ${generatedHour})`);
//       continue;
//     }

//     alarmTimes.push(alarmDate);
//   }

//   // If we failed to generate 3 alarms, use fallback (WITHOUT 'Z')
//   if (alarmTimes.length !== 3) {
//     console.warn(`⚠️ Only generated ${alarmTimes.length} alarms, using fallback`);
//     return [
//       new Date(`${dateKey}T07:30:00`),
//       new Date(`${dateKey}T08:45:00`),
//       new Date(`${dateKey}T09:30:00`),
//     ];
//   }

//   return alarmTimes;
// }

// // Generate alarm pattern
// function generateAlarmPattern(missedCount) {
//   const totalAlarms = 21;
//   const verifiedCount = totalAlarms - missedCount;

//   const fullDays = Math.floor(verifiedCount / 3);
//   const remainingVerified = verifiedCount % 3;

//   let pattern = [];

//   for (let i = 0; i < fullDays; i++) {
//     pattern.push(3);
//   }

//   if (remainingVerified > 0) {
//     pattern.push(remainingVerified);
//   }

//   while (pattern.length < 7) {
//     const alarmsLeft = missedCount - (pattern.length * 3 - pattern.reduce((a, b) => a + b, 0));

//     if (alarmsLeft >= 3) {
//       pattern.push(0);
//     } else if (alarmsLeft === 2) {
//       pattern.push(1);
//     } else if (alarmsLeft === 1) {
//       pattern.push(2);
//     } else {
//       pattern.push(0);
//     }
//   }

//   for (let i = pattern.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
//   }

//   return pattern;
// }

// async function addDummyData() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ Connected to MongoDB\n");

//     let totalAttendance = 0;
//     let totalAlarms = 0;

//     for (const sweeperInfo of SWEEPERS) {
//       console.log(`\n${"=".repeat(80)}`);
//       console.log(`📌 Processing: ${sweeperInfo.name} (${sweeperInfo.highPerformer ? 'HIGH PERFORMER' : 'REGULAR'}) - Target Missed: ${sweeperInfo.missedCount}`);
//       console.log("=".repeat(80));

//       const sweeper = await Sweeper.findById(sweeperInfo.id);
//       if (!sweeper) {
//         console.log(`❌ Sweeper not found: ${sweeperInfo.name}`);
//         continue;
//       }

//       const dutyStartRaw = sweeper.dutyTime?.start || "06:30";
//       const dutyEndRaw = sweeper.dutyTime?.end || "10:00";

//       const dutyStart = convertTo24Hour(dutyStartRaw);
//       const dutyEnd = convertTo24Hour(dutyEndRaw);

//       console.log(`⏰ Duty Time: ${dutyStartRaw} → ${dutyStart} to ${dutyEndRaw} → ${dutyEnd}`);

//       if (!sweeper.alarmEvents) sweeper.alarmEvents = {};

//       const dailyPattern = generateAlarmPattern(sweeperInfo.missedCount);

//       let totalVerified = 0;
//       let totalMissed = 0;
//       let attendanceDays = 0;

//       console.log("\n🚨 Adding Alarm Events:");

//       for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
//         const dateKey = DATE_KEYS[dayIndex];
//         const verifiedToday = dailyPattern[dayIndex];
//         const missedToday = 3 - verifiedToday;

//         if (!sweeper.alarmEvents[dateKey]) sweeper.alarmEvents[dateKey] = [];

//         console.log(`\n   📅 Day ${dayIndex + 1} (${dateKey}): ${verifiedToday} verified, ${missedToday} missed`);

//         const alarmTimes = generateAlarmTimes(dateKey, dutyStart, dutyEnd);

//         if (alarmTimes.length !== 3) {
//           console.error(`❌ Failed to generate 3 alarm times for ${dateKey}`);
//           continue;
//         }

//         let alarmStatuses = [];
//         for (let i = 0; i < 3; i++) {
//           alarmStatuses.push(i < verifiedToday ? "verified" : "missed");
//         }

//         alarmStatuses = alarmStatuses.sort(() => Math.random() - 0.5);

//         let lastVerifiedLocation = null;

//         for (let i = 0; i < 3; i++) {
//           const alarmTime = alarmTimes[i];
//           const alarmTimestampMs = alarmTime.getTime();
//           const eventId = new mongoose.Types.ObjectId().toString();
//           const location = getRandomLocation();

//           let event = {
//             id: eventId,
//             alarmTimestampMs: alarmTimestampMs,
//             opened: false,
//             openedTimestampMs: null,
//             responseMs: null,
//             verificationTimestampMs: null,
//             verificationStatus: "missed",
//             location: null,
//             withinGeofence: null,
//             createdAt: alarmTime,
//           };

//           if (alarmStatuses[i] === "verified") {
//             const openTime = alarmTimestampMs + (Math.random() * 60000 + 30000);
//             const verifyTime = openTime + (Math.random() * 120000 + 60000);

//             event.opened = true;
//             event.openedTimestampMs = openTime;
//             event.responseMs = openTime - alarmTimestampMs;
//             event.verificationTimestampMs = verifyTime;
//             event.verificationStatus = "attended";
//             event.location = location;
//             event.withinGeofence = true;

//             lastVerifiedLocation = location;

//             const timeStr = alarmTime.toISOString().split('T')[1].substring(0, 5);
//             console.log(`      ✅ Alarm ${i + 1} (${timeStr}) - VERIFIED - Response: ${Math.round(event.responseMs / 1000)}s`);
//             totalVerified++;
//           } else {
//             const timeStr = alarmTime.toISOString().split('T')[1].substring(0, 5);
//             console.log(`      ❌ Alarm ${i + 1} (${timeStr}) - MISSED`);
//             totalMissed++;
//           }

//           sweeper.alarmEvents[dateKey].push(event);

//           try {
//             await EventIndex.create({
//               eventId: eventId,
//               sweeperId: sweeper._id,
//               dateKey: dateKey,
//               storage: "sweeper",
//             });
//           } catch (e) {
//             // Ignore duplicates
//           }

//           totalAlarms++;
//         }

//         if (verifiedToday === 3) {
//           const attendanceDate = new Date(`${dateKey}T${dutyStart}: 00`);  // ✅ No Z
//           const dayStart = new Date(attendanceDate);
//           dayStart.setHours(0, 0, 0, 0);
//           const dayEnd = new Date(dayStart);
//           dayEnd.setDate(dayEnd.getDate() + 1);

//           const existing = await Attendance.findOne({
//             sweeperId: sweeper._id,
//             date: { $gte: dayStart, $lt: dayEnd },
//           });

//           if (!existing) {
//             await new Attendance({
//               sweeperId: sweeper._id,
//               date: attendanceDate,
//               location: lastVerifiedLocation || getRandomLocation(),
//             }).save();
//             attendanceDays++;
//             console.log(`      ✅ ATTENDANCE MARKED for ${dateKey} at ${dutyStart}`);
//           }
//         }
//       }

//       sweeper.markModified('alarmEvents');
//       await sweeper.save();

//       totalAttendance += attendanceDays;

//       console.log(`\n   📊 Summary for ${sweeperInfo.name}:`);
//       console.log(`      • Total alarms: 21`);
//       console.log(`      • Verified: ${totalVerified}`);
//       console.log(`      • Missed: ${totalMissed} (Target: ${sweeperInfo.missedCount})`);
//       console.log(`      • Attendance days: ${attendanceDays}/7 (${Math.round(attendanceDays / 7 * 100)}%)`);
//       console.log(`   💾 Saved successfully`);
//     }

//     console.log(`\n\n${"=".repeat(80)}`);
//     console.log("✅ DUMMY DATA INSERTION COMPLETE");
//     console.log("=".repeat(80));
//     console.log(`📊 Total Attendance Records Added: ${totalAttendance}`);
//     console.log(`🚨 Total Alarm Events Added: ${totalAlarms}`);
//     console.log(`👥 Sweepers Processed: ${SWEEPERS.length}`);
//     console.log("\n📋 Summary:");
//     console.log(`   • Each sweeper:  21 alarm events (3 per day × 7 days)`);
//     console.log(`   • Missed counts: Variable (2-10 per sweeper)`);
//     console.log(`   • All alarms within duty time and before 10:00 AM`);
//     console.log(`   • All geofence checks:  true`);
//     console.log(`   • Attendance marked only when 3 verified on same day`);
//     console.log(`   • Date range: Dec 15-21, 2025`);
//     console.log("=".repeat(80) + "\n");

//   } catch (error) {
//     console.error("❌ Error:", error.message);
//     console.error(error.stack);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB\n");
//     process.exit(0);
//   }
// }

// addDummyData();


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
    end: { type:  String, default: null },
  },
  alarmEvents: { type: Object, default: {} },
  partitions: { type: Object, default: {} },
});

const attendanceSchema = new mongoose.Schema({
  sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
  date: Date,
  location: { latitude: Number, longitude: Number },
  createdAt: { type: Date, default: Date.now },
});

const eventIndexSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  sweeperId: { type: mongoose.Schema. Types.ObjectId, ref: "Sweeper", required: true },
  dateKey:  { type: String, required: true },
  storage: { type: String, enum: ["sweeper", "group", "old"], default: "sweeper" },
  createdAt: { type: Date, default: Date.now },
});

const Sweeper = mongoose.model("Sweeper", sweeperSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);
const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// Selected Sweepers with different missed counts
const SWEEPERS = [
  { id: "68da286c7172c21bf4a37c4d", name: "Akshay kambale", highPerformer: true, missedCount: 3 },
  { id: "68da29947172c21bf4a37c55", name: "Atish kuchekar", highPerformer: true, missedCount: 2 },
  { id: "68e3820ab13dd1153fcf3ef7", name: "tanoj kadam", highPerformer: false, missedCount: 7 },
  { id: "69425c21531fd6f9b6c0bc77", name: "kartik", highPerformer: false, missedCount: 9 },
  { id: "68e37d42b13dd1153fcf3ec1", name: "vicky Ramesh Gaikwad", highPerformer:  false, missedCount: 8 },
  { id: "69098f228d240ea50b2c2e5b", name: "Lakhan prabhakar gavli", highPerformer: true, missedCount: 4 },
  { id: "690990278d240ea50b2c2e73", name: "Gangaram Waghmare", highPerformer: false, missedCount: 10 },
  { id: "690994328d240ea50b2c2ec8", name: "Anand Gaikwad", highPerformer:  false, missedCount: 6 },
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
function getRandomLocation() {
  return {
    latitude: 17.6805 + (Math.random() - 0.5) * 0.001,
    longitude: 73.9903 + (Math.random() - 0.5) * 0.001,
  };
}

// Helper: Convert 12-hour format to 24-hour
function convertTo24Hour(timeStr) {
  if (! timeStr) return "06:30";

  timeStr = timeStr.trim();

  // Check if already in 24-hour format
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [hours, minutes] = timeStr.split(': ');
    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  // Parse 12-hour format
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return "06:30";

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3]. toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

// Helper: Parse time to hours
function parseTimeToHours(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours + minutes / 60;
}

// Helper: Generate alarm times within duty period - USING UTC+5:30 (IST)
function generateAlarmTimes(dateKey, dutyStart, dutyEnd) {
  const startHours = parseTimeToHours(dutyStart);
  const endHours = parseTimeToHours(dutyEnd);

  // Default to 6:30 AM - 10:00 AM
  const effectiveStart = startHours !== null ? startHours : 6.5;
  const effectiveEnd = endHours !== null ? Math.min(endHours, 10.0) : 10.0;

  // Ensure valid range
  if (effectiveEnd <= effectiveStart) {
    console.error(`❌ Invalid duty time range: ${effectiveStart} to ${effectiveEnd}`);
    return [
      new Date(`${dateKey}T07:30:00.000+05:30`),
      new Date(`${dateKey}T08:45:00.000+05:30`),
      new Date(`${dateKey}T09:30:00.000+05:30`),
    ];
  }

  const duration = effectiveEnd - effectiveStart;
  const interval = duration / 4;

  const alarmTimes = [];
  for (let i = 1; i <= 3; i++) {
    const hours = effectiveStart + (interval * i);
    const hoursPart = Math.floor(hours);
    const minutesPart = Math.round((hours - hoursPart) * 60);
    const validMinutes = Math.min(59, Math.max(0, minutesPart));

    // Create date with IST timezone offset (+05:30)
    const timeStr = `${String(hoursPart).padStart(2, '0')}:${String(validMinutes).padStart(2, '0')}:00.000+05:30`;
    const alarmDate = new Date(`${dateKey}T${timeStr}`);

    if (isNaN(alarmDate.getTime())) {
      console.error(`❌ Invalid date: ${dateKey}T${timeStr}`);
      continue;
    }

    alarmTimes.push(alarmDate);
  }

  // Fallback
  if (alarmTimes. length !== 3) {
    console.warn(`⚠️ Only generated ${alarmTimes.length} alarms, using fallback`);
    return [
      new Date(`${dateKey}T07:30:00.000+05:30`),
      new Date(`${dateKey}T08:45:00.000+05:30`),
      new Date(`${dateKey}T09:30:00.000+05:30`),
    ];
  }

  return alarmTimes;
}

// Generate alarm pattern
function generateAlarmPattern(missedCount) {
  const totalAlarms = 21;
  const verifiedCount = totalAlarms - missedCount;

  const fullDays = Math.floor(verifiedCount / 3);
  const remainingVerified = verifiedCount % 3;

  let pattern = [];

  for (let i = 0; i < fullDays; i++) {
    pattern.push(3);
  }

  if (remainingVerified > 0) {
    pattern.push(remainingVerified);
  }

  while (pattern.length < 7) {
    const alarmsLeft = missedCount - (pattern.length * 3 - pattern.reduce((a, b) => a + b, 0));

    if (alarmsLeft >= 3) {
      pattern.push(0);
    } else if (alarmsLeft === 2) {
      pattern.push(1);
    } else if (alarmsLeft === 1) {
      pattern.push(2);
    } else {
      pattern.push(0);
    }
  }

  for (let i = pattern.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
  }

  return pattern;
}

async function addDummyData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    let totalAttendance = 0;
    let totalAlarms = 0;

    for (const sweeperInfo of SWEEPERS) {
      console.log(`\n${"=".repeat(80)}`);
      console.log(`📌 Processing: ${sweeperInfo.name} (${sweeperInfo.highPerformer ? 'HIGH PERFORMER' : 'REGULAR'}) - Target Missed: ${sweeperInfo. missedCount}`);
      console.log("=".repeat(80));

      const sweeper = await Sweeper.findById(sweeperInfo.id);
      if (!sweeper) {
        console.log(`❌ Sweeper not found: ${sweeperInfo. name}`);
        continue;
      }

      const dutyStartRaw = sweeper.dutyTime?. start || "06:30";
      const dutyEndRaw = sweeper. dutyTime?.end || "10:00";

      const dutyStart = convertTo24Hour(dutyStartRaw);
      const dutyEnd = convertTo24Hour(dutyEndRaw);

      console.log(`⏰ Duty Time: ${dutyStartRaw} → ${dutyStart} to ${dutyEndRaw} → ${dutyEnd}`);

      if (! sweeper.alarmEvents) sweeper.alarmEvents = {};

      const dailyPattern = generateAlarmPattern(sweeperInfo.missedCount);

      let totalVerified = 0;
      let totalMissed = 0;
      let attendanceDays = 0;

      console.log("\n🚨 Adding Alarm Events:");

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dateKey = DATE_KEYS[dayIndex];
        const verifiedToday = dailyPattern[dayIndex];
        const missedToday = 3 - verifiedToday;

        if (! sweeper.alarmEvents[dateKey]) sweeper.alarmEvents[dateKey] = [];

        console.log(`\n   📅 Day ${dayIndex + 1} (${dateKey}): ${verifiedToday} verified, ${missedToday} missed`);

        const alarmTimes = generateAlarmTimes(dateKey, dutyStart, dutyEnd);

        if (alarmTimes.length !== 3) {
          console. error(`❌ Failed to generate 3 alarm times for ${dateKey}`);
          continue;
        }

        let alarmStatuses = [];
        for (let i = 0; i < 3; i++) {
          alarmStatuses.push(i < verifiedToday ? "verified" : "missed");
        }

        alarmStatuses = alarmStatuses.sort(() => Math.random() - 0.5);

        let lastVerifiedLocation = null;

        for (let i = 0; i < 3; i++) {
          const alarmTime = alarmTimes[i];
          const alarmTimestampMs = alarmTime.getTime();
          const eventId = new mongoose.Types.ObjectId().toString();
          const location = getRandomLocation();

          let event = {
            id: eventId,
            alarmTimestampMs: alarmTimestampMs,
            opened: false,
            openedTimestampMs: null,
            responseMs: null,
            verificationTimestampMs: null,
            verificationStatus: "missed",
            location: null,
            withinGeofence: null,
            createdAt: alarmTime,
          };

          if (alarmStatuses[i] === "verified") {
            const openTime = alarmTimestampMs + (Math.random() * 60000 + 30000);
            const verifyTime = openTime + (Math. random() * 120000 + 60000);

            event.opened = true;
            event.openedTimestampMs = openTime;
            event.responseMs = openTime - alarmTimestampMs;
            event.verificationTimestampMs = verifyTime;
            event.verificationStatus = "attended";
            event.location = location;
            event.withinGeofence = true;

            lastVerifiedLocation = location;

            // Display in local time
            const hours = alarmTime.getHours();
            const minutes = alarmTime. getMinutes();
            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            console.log(`      ✅ Alarm ${i + 1} (${timeStr}) - VERIFIED - Response: ${Math.round(event.responseMs / 1000)}s`);
            totalVerified++;
          } else {
            const hours = alarmTime.getHours();
            const minutes = alarmTime.getMinutes();
            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            console.log(`      ❌ Alarm ${i + 1} (${timeStr}) - MISSED`);
            totalMissed++;
          }

          sweeper. alarmEvents[dateKey].push(event);

          try {
            await EventIndex.create({
              eventId: eventId,
              sweeperId: sweeper._id,
              dateKey: dateKey,
              storage: "sweeper",
            });
          } catch (e) {
            // Ignore duplicates
          }

          totalAlarms++;
        }

        if (verifiedToday === 3) {
          // Create attendance date with IST offset
          const attendanceDate = new Date(`${dateKey}T${dutyStart}:00.000+05:30`);
          const dayStart = new Date(attendanceDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);

          const existing = await Attendance.findOne({
            sweeperId:  sweeper._id,
            date: { $gte: dayStart, $lt: dayEnd },
          });

          if (!existing) {
            await new Attendance({
              sweeperId: sweeper._id,
              date: attendanceDate,
              location: lastVerifiedLocation || getRandomLocation(),
            }).save();
            attendanceDays++;
            console.log(`      ✅ ATTENDANCE MARKED for ${dateKey} at ${dutyStart}`);
          }
        }
      }

      sweeper.markModified('alarmEvents');
      await sweeper.save();

      totalAttendance += attendanceDays;

      console.log(`\n   📊 Summary for ${sweeperInfo.name}:`);
      console.log(`      • Total alarms: 21`);
      console.log(`      • Verified: ${totalVerified}`);
      console.log(`      • Missed: ${totalMissed} (Target: ${sweeperInfo.missedCount})`);
      console.log(`      • Attendance days: ${attendanceDays}/7 (${Math.round(attendanceDays / 7 * 100)}%)`);
      console.log(`   💾 Saved successfully`);
    }

    console.log(`\n\n${"=". repeat(80)}`);
    console.log("✅ DUMMY DATA INSERTION COMPLETE");
    console.log("=".repeat(80));
    console.log(`📊 Total Attendance Records Added: ${totalAttendance}`);
    console.log(`🚨 Total Alarm Events Added: ${totalAlarms}`);
    console.log(`👥 Sweepers Processed: ${SWEEPERS.length}`);
    console.log("\n📋 Summary:");
    console.log(`   • Each sweeper:  21 alarm events (3 per day × 7 days)`);
    console.log(`   • Missed counts: Variable (2-10 per sweeper)`);
    console.log(`   • All alarms within duty time (6:30-10:00 AM IST)`);
    console.log(`   • All geofence checks: true`);
    console.log(`   • Attendance marked only when 3 verified on same day`);
    console.log(`   • Date range: Dec 15-21, 2025`);
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