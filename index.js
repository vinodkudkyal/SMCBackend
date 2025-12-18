// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const { Types } = mongoose;

// const app = express();
// app.use(cors()); // allow all origins for dev; tighten for production
// app.use(express.json()); // body-parser

// // ---------------- MONGOOSE CONNECTION ----------------
// // NOTE: For simplicity this uses the same hardcoded URI used previously.
// // In production you should put this in an environment variable.
// const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // ---------------- SCHEMAS & MODELS ----------------

// // User schema (admins)
// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String, // NOTE: plaintext in DB is supported for backward compatibility here
//   role: String,
//   name: String,
// });
// const User = mongoose.model("User", userSchema);

// // Sweeper schema
// const sweeperSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default: [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type: String, default: null },
//   },
// });
// const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// // Face data schema
// const faceDataSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
//   name: { type: String, required: true },
//   faceData: { type: String, required: true }, // JSON embeddings
//   createdAt: { type: Date, default: Date.now },
// });
// const FaceData = mongoose.model("FaceData", faceDataSchema);

// // Attendance schema
// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
//   date: { type: Date, required: true },
//   location: {
//     latitude: Number,
//     longitude: Number,
//   },
//   createdAt: { type: Date, default: Date.now },
// });
// const Attendance = mongoose.model("Attendance", attendanceSchema);

// // Geofence schema
// const geofenceSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   zone: { type: String, default: "" },
//   landmark: { type: String, default: "" },
//   geofence: { type: Array, default: [] }, // polygon points [{lat,lng}]
//   checkpoints: { type: Array, default: [] }, // [{lat,lng}]
//   createdAt: { type: Date, default: Date.now },
// });
// const Geofence = mongoose.model("Geofence", geofenceSchema);

// // ---------------- AlarmEvent schema (added) ----------------
// // Important: force the collection name to "alarmevents" to match your existing data
// const alarmEventSchema = new mongoose.Schema({
//   // sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
//   sweeperId: { type: String, required: true },
//   alarmTimestampMs: { type: Number, required: true }, // epoch ms
//   opened: { type: Boolean, default: false },
//   openedTimestampMs: { type: Number, default: null },
//   responseMs: { type: Number, default: null },
//   verificationTimestampMs: { type: Number, default: null },
//   verificationStatus: { type: String, default: null }, // e.g., 'skipped', 'verified'
//   note: { type: String, default: null }, // optional extra info
//   createdAt: { type: Date, default: Date.now },
// });

// // create an index to speed queries by sweeper and time
// alarmEventSchema.index({ sweeperId: 1, alarmTimestampMs: -1 });

// const AlarmEvent = mongoose.model("AlarmEvent", alarmEventSchema, "alarmevents"); // explicit collection name

// // ---------------- HTTP + Socket.IO ----------------
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   cors: { origin: "*" }, // tighten in production
// });

// // Provide a simple info endpoint for socket clients
// io.on("connection", (socket) => {
//   console.log("🔌 socket connected:", socket.id);
//   socket.on("disconnect", () => console.log("🔌 socket disconnected:", socket.id));
// });

// // Helper to emit events
// function emitEvent(name, payload) {
//   try {
//     io.emit(name, payload);
//   } catch (e) {
//     console.error("Socket emit error:", e);
//   }
// }

// // ---------------- ROUTES ----------------

// // Health check
// app.get("/", (req, res) => {
//   res.json({ success: true, message: "Sweeper Tracker API running" });
// });

// // LOGIN (Admin + Sweeper)
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     let user = await User.findOne({ email, password }).lean();
//     if (user) return res.json({ success: true, role: user.role, name: user.name, id: user._id });

//     let sweeper = await Sweeper.findOne({ email, password }).lean();
//     if (sweeper) return res.json({ success: true, role: "sweeper", name: sweeper.name, id: sweeper._id });

//     return res.status(401).json({ success: false, message: "Invalid credentials" });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------------- SWEEPER ROUTES ----------------

// // GET ALL SWEEPERS
// app.get("/sweepers", async (req, res) => {
//   try {
//     const sweepers = await Sweeper.find().lean();
//     return res.json({ success: true, sweepers });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ADD SWEEPER
// app.post("/sweepers", async (req, res) => {
//   const { name, email, password, zone, status } = req.body;
//   try {
//     const existing = await Sweeper.findOne({ email });
//     if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

//     const sweeper = new Sweeper({ name, email, password, zone, status, dutyTime: { start: null, end: null } });
//     await sweeper.save();

//     // Emit real-time event
//     emitEvent("sweeper:added", { sweeper });

//     return res.json({ success: true, sweeper });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // DELETE SWEEPER
// app.delete("/sweepers/:id", async (req, res) => {
//   try {
//     const sweeper = await Sweeper.findByIdAndDelete(req.params.id);
//     if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     await FaceData.deleteOne({ sweeperId: req.params.id });
//     await Attendance.deleteMany({ sweeperId: req.params.id });
//     await AlarmEvent.deleteMany({ sweeperId: req.params.id }); // remove alarms for the sweeper as well

//     // Emit real-time event
//     emitEvent("sweeper:deleted", { id: req.params.id });

//     return res.json({ success: true, message: "Sweeper deleted successfully" });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // GET ASSIGNMENT
// app.get("/sweepers/:id/assignment", async (req, res) => {
//   try {
//     const sweeper = await Sweeper.findById(req.params.id).lean();
//     if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     return res.json({ success: true, geofence: sweeper.geofence || [], checkpoints: sweeper.checkpoints || [] });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // UPDATE ASSIGNMENT
// app.put("/sweepers/:id/assignment", async (req, res) => {
//   const { geofence, checkpoints } = req.body;
//   try {
//     const sweeper = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { geofence: geofence || [], checkpoints: checkpoints || [] },
//       { new: true, runValidators: true }
//     ).lean();

//     if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     emitEvent("sweeper:updated", { sweeper });
//     return res.json({ success: true, sweeper });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // UPDATE DUTY TIME
// app.put("/sweepers/:id/duty-time", async (req, res) => {
//   const { start, end } = req.body;
//   try {
//     const sweeper = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { dutyTime: { start: start || null, end: end || null } },
//       { new: true }
//     ).lean();

//     if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     // Emit update event with updated dutyTime
//     emitEvent("sweeper:duty-time-updated", { id: req.params.id, dutyTime: sweeper.dutyTime });

//     return res.json({ success: true, dutyTime: sweeper.dutyTime, sweeper });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // FACE DATA
// app.get("/sweepers/facedata/:id", async (req, res) => {
//   try {
//     const faceData = await FaceData.findOne({ sweeperId: req.params.id }).lean();
//     return res.json({
//       success: true,
//       hasFaceData: !!faceData,
//       faceData: faceData ? faceData.faceData : null,
//     });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.post("/sweepers/facedata/:id", async (req, res) => {
//   const { name, faceData } = req.body;
//   try {
//     const sweeper = await Sweeper.findById(req.params.id);
//     if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     let existing = await FaceData.findOne({ sweeperId: req.params.id });
//     if (existing) {
//       existing.name = name || existing.name;
//       existing.faceData = faceData;
//       await existing.save();
//       return res.json({ success: true, message: "Face data updated", faceData: existing });
//     } else {
//       const fd = new FaceData({ sweeperId: req.params.id, name, faceData });
//       await fd.save();
//       return res.json({ success: true, message: "Face data saved", faceData: fd });
//     }
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ATTENDANCE
// app.post("/sweepers/attendance", async (req, res) => {
//   const { sweeperId, date, location } = req.body;
//   try {
//     const sweeper = await Sweeper.findById(sweeperId);
//     if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     const providedDate = date ? new Date(date) : new Date();
//     const dayStart = new Date(providedDate);
//     dayStart.setHours(0, 0, 0, 0);
//     const dayEnd = new Date(dayStart);
//     dayEnd.setDate(dayEnd.getDate() + 1);

//     const existing = await Attendance.findOne({
//       sweeperId,
//       date: { $gte: dayStart, $lt: dayEnd },
//     }).lean();

//     if (existing) return res.json({ success: true, message: "Attendance already marked", attendance: existing });

//     const attendance = new Attendance({ sweeperId, date: providedDate, location: location || {} });
//     await attendance.save();

//     // Emit attendance event for real-time updates
//     emitEvent("attendance:marked", { attendance, sweeperId });

//     return res.json({ success: true, attendance });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/sweepers/:id/attendance", async (req, res) => {
//   try {
//     const { from, to } = req.query;
//     const query = { sweeperId: req.params.id };

//     if (from || to) {
//       query.date = {};
//       if (from) query.date.$gte = new Date(from);
//       if (to) query.date.$lte = new Date(to);
//     }

//     const attendanceHistory = await Attendance.find(query).sort({ date: -1 }).lean();
//     return res.json({ success: true, attendanceHistory });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------------- AlarmEvent routes ----------------

// // Create alarm event (store in DB)
// app.post("/alarmevents", async (req, res) => {
//   try {
//     const payload = req.body;
//     // Validate required fields
//     if (!payload.sweeperId || !payload.alarmTimestampMs) {
//       return res.status(400).json({ success: false, message: "sweeperId and alarmTimestampMs required" });
//     }
//     const ev = new AlarmEvent({
//       sweeperId: payload.sweeperId,
//       alarmTimestampMs: Number(payload.alarmTimestampMs),
//       opened: payload.opened === true,
//       openedTimestampMs: payload.openedTimestampMs ? Number(payload.openedTimestampMs) : null,
//       responseMs: payload.responseMs ? Number(payload.responseMs) : null,
//       verificationTimestampMs: payload.verificationTimestampMs ? Number(payload.verificationTimestampMs) : null,
//       verificationStatus: payload.verificationStatus || null,
//       note: payload.note || null,
//     });
//     await ev.save();

//     // Emit event for realtime clients
//     emitEvent("alarmevent:created", { alarmevent: ev, sweeperId: ev.sweeperId });

//     return res.json({ success: true, alarmevent: ev });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Get alarmevents (filter by sweeperId, from, to) - returns array
// app.get("/alarmevents", async (req, res) => {
//   try {
//     const { sweeperId, from, to } = req.query;
//     const query = {};
//     if (sweeperId) query.sweeperId = sweeperId;
//     if (from || to) {
//       query.alarmTimestampMs = {};
//       if (from) query.alarmTimestampMs.$gte = Number(from);
//       if (to) query.alarmTimestampMs.$lte = Number(to);
//     }
//     const events = await AlarmEvent.find(query).sort({ alarmTimestampMs: -1 }).lean();
//     return res.json(events);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // Per-sweeper shortcut: GET /sweepers/:id/alarmevents
// app.get("/sweepers/:id/alarmevents", async (req, res) => {
//   try {
//     const { from, to } = req.query;
//     const query = { sweeperId: req.params.id };
//     if (from || to) {
//       query.alarmTimestampMs = {};
//       if (from) query.alarmTimestampMs.$gte = Number(from);
//       if (to) query.alarmTimestampMs.$lte = Number(to);
//     }
//     const events = await AlarmEvent.find(query).sort({ alarmTimestampMs: -1 }).lean();
//     return res.json(events);
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------------- GEOFENCE ROUTES ----------------
// app.post("/geofences", async (req, res) => {
//   try {
//     const gf = new Geofence(req.body);
//     await gf.save();
//     return res.json({ success: true, geofence: gf });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences", async (req, res) => {
//   try {
//     const geofences = await Geofence.find().lean();
//     return res.json({ success: true, geofences });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences/:id", async (req, res) => {
//   try {
//     const gf = await Geofence.findById(req.params.id).lean();
//     if (!gf) return res.status(404).json({ success: false, message: "Geofence not found" });
//     return res.json({ success: true, geofence: gf });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });



// app.get("/fetch-alarmevents", async (req, res) => {
//   try {
//     const { sweeperId } = req.query;

//     const query = {};
//     if (sweeperId) {
//       query.sweeperId = sweeperId;  // string match
//     }

//     const events = await AlarmEvent.find(query)
//       .sort({ alarmTimestampMs: -1 })
//       .lean();

//     return res.json(events);
//   } catch (err) {
//     console.error("Fetch alarm events error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });


// app.delete("/geofences/:id", async (req, res) => {
//   try {
//     const gf = await Geofence.findByIdAndDelete(req.params.id);
//     if (!gf) return res.status(404).json({ success: false, message: "Geofence not found" });
//     return res.json({ success: true, message: "Geofence deleted" });
//   } catch (err) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------------- START SERVER ----------------
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, "0.0.0.0", () => console.log(`✅ Server + Socket.IO running on http://0.0.0.0:${PORT}`));



// =======================================================================
//  IMPORTS
// =======================================================================


// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");

// // For alarmEvents separate collection (OLD version)
// const { Types } = mongoose;

// const app = express();
// app.use(cors());
// app.use(express.json());

// // =======================================================================
// //  MONGO CONNECTION
// // =======================================================================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // =======================================================================
// //  SOCKET.IO (Old code – retained)
// // =======================================================================
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 socket connected:", socket.id);
//   socket.on("disconnect", () => console.log("🔌 socket disconnected:", socket.id));
// });

// // helper
// function emitEvent(name, payload) {
//   try {
//     io.emit(name, payload);
//   } catch (e) {
//     console.error("Socket emit error:", e);
//   }
// }

// // =======================================================================
// //  SCHEMAS — MERGED FROM OLD + NEW
// // =======================================================================

// // ---------------- USER ----------------
// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String,
//   role: String,
//   name: String,
// });
// const User = mongoose.model("User", userSchema);

// // ---------------- SWEEPER ----------------
// // NEW alarmEvents (embedded) merged into sweeper schema
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default: [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type: String, default: null },
//   },
//   // NEW version alarmEvents
//   alarmEvents: { type: Object, default: {} },
// });
// const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// // ---------------- FACE DATA ----------------
// const faceDataSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   name: String,
//   faceData: String,
//   createdAt: { type: Date, default: Date.now },
// });
// const FaceData = mongoose.model("FaceData", faceDataSchema);

// // ---------------- ATTENDANCE ----------------
// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   date: Date,
//   location: { latitude: Number, longitude: Number },
//   createdAt: { type: Date, default: Date.now },
// });
// const Attendance = mongoose.model("Attendance", attendanceSchema);

// // ---------------- GEOFENCE ----------------
// const geofenceSchema = new mongoose.Schema({
//   name: String,
//   zone: String,
//   landmark: String,
//   geofence: Array,
//   checkpoints: Array,
//   createdAt: { type: Date, default: Date.now },
// });
// const Geofence = mongoose.model("Geofence", geofenceSchema);

// // ---------------- ALARM EVENTS — OLD VERSION (separate collection) ----------------
// const alarmEventSchema = new mongoose.Schema({
//   sweeperId: String,
//   alarmTimestampMs: Number,
//   opened: Boolean,
//   openedTimestampMs: Number,
//   responseMs: Number,
//   verificationTimestampMs: Number,
//   verificationStatus: String,
//   note: String,
//   createdAt: { type: Date, default: Date.now },
// });
// alarmEventSchema.index({ sweeperId: 1, alarmTimestampMs: -1 });

// const AlarmEvent = mongoose.model("AlarmEvent", alarmEventSchema, "alarmevents");

// // =======================================================================
// //  ROUTES — MERGED
// // =======================================================================

// // ---------------- HEALTH CHECK ----------------
// app.get("/", (req, res) => {
//   res.json({ success: true, message: "Sweeper Tracker API running" });
// });

// // ---------------- LOGIN ----------------
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     let user = await User.findOne({ email, password }).lean();
//     if (user)
//       return res.json({
//         success: true,
//         role: user.role,
//         name: user.name,
//         id: user._id,
//       });

//     let sweeper = await Sweeper.findOne({ email, password }).lean();
//     if (sweeper)
//       return res.json({
//         success: true,
//         role: "sweeper",
//         name: sweeper.name,
//         id: sweeper._id,
//       });

//     res.status(401).json({ success: false, message: "Invalid credentials" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  SWEEPERS
// // =======================================================================
// app.get("/sweepers", async (req, res) => {
//   try {
//     res.json({ success: true, sweepers: await Sweeper.find().lean() });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // app.post("/sweepers", async (req, res) => {
// //   try {
// //     const { name, email, password } = req.body;

// //     const exists = await Sweeper.findOne({ email });
// //     if (exists)
// //       return res.json({
// //         success: false,
// //         message: "Email already exists",
// //       });

// //     const sweeper = await new Sweeper({ name, email, password }).save();
// //     emitEvent("sweeper:added", { sweeper });

// //     res.json({ success: true, sweeper });
// //   } catch (err) {
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });
// app.post("/sweepers", async (req, res) => {
//   try {
//     const { name, email, password, zone, status } = req.body;

//     const exists = await Sweeper.findOne({ email });
//     if (exists)
//       return res.json({ success: false, message: "Email already exists" });

//     const sweeper = await new Sweeper({
//       name,
//       email,
//       password,
//       zone,
//       status
//     }).save();

//     emitEvent("sweeper:added", { sweeper });

//     res.json({ success: true, sweeper });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.delete("/sweepers/:id", async (req, res) => {
//   try {
//     await Sweeper.findByIdAndDelete(req.params.id);
//     await FaceData.deleteOne({ sweeperId: req.params.id });
//     await Attendance.deleteMany({ sweeperId: req.params.id });
//     await AlarmEvent.deleteMany({ sweeperId: req.params.id });

//     emitEvent("sweeper:deleted", { id: req.params.id });

//     res.json({ success: true, message: "Sweeper deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ASSIGNMENT
// // =======================================================================
// app.get("/sweepers/:id/assignment", async (req, res) => {
//   try {
//     const s = await Sweeper.findById(req.params.id).lean();
//     if (!s)
//       return res.status(404).json({ success: false, message: "Sweeper not found" });

//     res.json({
//       success: true,
//       geofence: s.geofence,
//       checkpoints: s.checkpoints,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.put("/sweepers/:id/assignment", async (req, res) => {
//   try {
//     const s = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { geofence: req.body.geofence, checkpoints: req.body.checkpoints },
//       { new: true }
//     );

//     emitEvent("sweeper:updated", { sweeper: s });

//     res.json({ success: true, sweeper: s });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  DUTY TIME
// // =======================================================================
// app.put("/sweepers/:id/duty-time", async (req, res) => {
//   try {
//     const s = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { dutyTime: req.body },
//       { new: true }
//     );

//     emitEvent("sweeper:duty-time-updated", {
//       id: req.params.id,
//       dutyTime: s.dutyTime,
//     });

//     res.json({ success: true, dutyTime: s.dutyTime });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  FACE DATA
// // =======================================================================
// app.get("/sweepers/facedata/:id", async (req, res) => {
//   try {
//     const data = await FaceData.findOne({ sweeperId: req.params.id }).lean();
//     res.json({
//       success: true,
//       hasFaceData: !!data,
//       faceData: data?.faceData || null,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.post("/sweepers/facedata/:id", async (req, res) => {
//   try {
//     const s = await Sweeper.findById(req.params.id);
//     if (!s) return res.json({ success: false, message: "Sweeper not found" });

//     let data = await FaceData.findOne({ sweeperId: req.params.id });

//     if (!data) {
//       data = await new FaceData({
//         sweeperId: req.params.id,
//         name: req.body.name,
//         faceData: req.body.faceData,
//       }).save();
//     } else {
//       data.name = req.body.name;
//       data.faceData = req.body.faceData;
//       await data.save();
//     }

//     res.json({ success: true, faceData: data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ATTENDANCE
// // =======================================================================
// app.post("/sweepers/attendance", async (req, res) => {
//   try {
//     const { sweeperId, date, location } = req.body;

//     const providedDate = date ? new Date(date) : new Date();

//     const dayStart = new Date(providedDate);
//     dayStart.setHours(0, 0, 0, 0);

//     const dayEnd = new Date(dayStart);
//     dayEnd.setDate(dayEnd.getDate() + 1);

//     let existing = await Attendance.findOne({
//       sweeperId,
//       date: { $gte: dayStart, $lt: dayEnd },
//     });

//     if (existing)
//       return res.json({
//         success: true,
//         message: "Attendance already marked",
//         attendance: existing,
//       });

//     const attendance = await new Attendance({
//       sweeperId,
//       date: providedDate,
//       location,
//     }).save();

//     emitEvent("attendance:marked", { sweeperId, attendance });

//     res.json({ success: true, attendance });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/sweepers/:id/attendance", async (req, res) => {
//   try {
//     const q = { sweeperId: req.params.id };

//     if (req.query.from || req.query.to) {
//       q.date = {};
//       if (req.query.from) q.date.$gte = new Date(req.query.from);
//       if (req.query.to) q.date.$lte = new Date(req.query.to);
//     }

//     const data = await Attendance.find(q).sort({ date: -1 }).lean();
//     res.json({ success: true, attendanceHistory: data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ALARM EVENTS — OLD VERSION ROUTES (separate collection)
// // =======================================================================
// app.post("/alarmevents", async (req, res) => {
//   try {
//     const ev = await new AlarmEvent(req.body).save();

//     emitEvent("alarmevent:created", {
//       alarmevent: ev,
//       sweeperId: ev.sweeperId,
//     });

//     res.json({ success: true, alarmevent: ev });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/alarmevents", async (req, res) => {
//   try {
//     const q = {};
//     if (req.query.sweeperId) q.sweeperId = req.query.sweeperId;

//     const events = await AlarmEvent.find(q)
//       .sort({ alarmTimestampMs: -1 })
//       .lean();

//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ALARM EVENTS — NEW VERSION (embedded inside sweeper document)
// // =======================================================================

// // Helper
// function yyyymmddFromMs(ms) {
//   const d = new Date(Number(ms));
//   return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
//     2,
//     "0"
//   )}-${String(d.getUTCDate()).padStart(2, "0")}`;
// }

// // CREATE new embedded alarm event
// app.post("/alarm-events", async (req, res) => {
//   try {
//     const { sweeperId, alarmTimestampMs, location } = req.body;

//     const s = await Sweeper.findById(sweeperId);
//     if (!s)
//       return res.json({ success: false, message: "Sweeper not found" });

//     const dateKey = yyyymmddFromMs(alarmTimestampMs);
//     const id = new mongoose.Types.ObjectId().toString();

//     const evt = {
//       id,
//       alarmTimestampMs,
//       opened: false,
//       openedTimestampMs: null,
//       responseMs: null,
//       verificationTimestampMs: null,
//       verificationStatus: null,
//       location: location || null,
//     };

//     if (!s.alarmEvents[dateKey]) s.alarmEvents[dateKey] = [];
//     s.alarmEvents[dateKey].push(evt);

//     await s.save();

//     res.json({ success: true, event: evt, dateKey });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// /**
//  * BACKWARD COMPATIBLE ALARM EVENTS ENDPOINT
//  * React UI expects: GET /sweepers/:id/alarmevents
//  */
// app.get("/sweepers/:id/alarmevents", async (req, res) => {
//   try {
//     const sweeperId = req.params.id;
//     const { from, to } = req.query;

//     let fromMs = from ? Number(from) : null;
//     let toMs = to ? Number(to) : null;

//     // -------------------------
//     // 1️⃣ FETCH OLD AlarmEvent COLLECTION
//     // -------------------------
//     const oldEvents = await AlarmEvent.find({ sweeperId })
//       .lean()
//       .catch(() => []);

//     // Apply time filtering
//     const filteredOld = oldEvents.filter(ev => {
//       const t = Number(ev.alarmTimestampMs || 0);
//       if (fromMs && t < fromMs) return false;
//       if (toMs && t > toMs) return false;
//       return true;
//     });

//     // -------------------------
//     // 2️⃣ FETCH NEW EMBEDDED EVENTS FROM SWEEPER DOCUMENT
//     // -------------------------
//     const sweeper = await Sweeper.findById(sweeperId).lean();

//     let embeddedEvents = [];
//     if (sweeper?.alarmEvents) {
//       for (const [dateKey, list] of Object.entries(sweeper.alarmEvents)) {
//         if (!Array.isArray(list)) continue;

//         list.forEach(ev => {
//           const t = Number(ev.alarmTimestampMs || 0);
//           if (fromMs && t < fromMs) return;
//           if (toMs && t > toMs) return;
//           embeddedEvents.push({
//             ...ev,
//             _id: ev.id,   // so React table can use key
//             sweeperId
//           });
//         });
//       }
//     }

//     // -------------------------
//     // 3️⃣ MERGE BOTH SYSTEMS
//     // -------------------------
//     const merged = [...filteredOld, ...embeddedEvents];

//     // Sort latest first
//     merged.sort((a, b) => (b.alarmTimestampMs || 0) - (a.alarmTimestampMs || 0));

//     return res.json(merged);

//   } catch (err) {
//     console.error("Error fetching merged alarm events:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });


// // =======================================================================
// //  GEOFENCE ROUTES
// // =======================================================================
// app.post("/geofences", async (req, res) => {
//   try {
//     const gf = await new Geofence(req.body).save();
//     res.json({ success: true, geofence: gf });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences", async (req, res) => {
//   try {
//     const data = await Geofence.find().lean();
//     res.json({ success: true, geofences: data });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences/:id", async (req, res) => {
//   try {
//     const data = await Geofence.findById(req.params.id).lean();
//     if (!data)
//       return res.json({ success: false, message: "Geofence not found" });

//     res.json({ success: true, geofence: data });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.delete("/geofences/:id", async (req, res) => {
//   try {
//     const gf = await Geofence.findByIdAndDelete(req.params.id);
//     if (!gf)
//       return res.json({ success: false, message: "Geofence not found" });

//     res.json({ success: true, message: "Geofence deleted" });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  START SERVER
// // =======================================================================
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, "0.0.0.0", () =>
//   console.log(`🚀 SERVER + SOCKET.IO RUNNING ON http://0.0.0.0:${PORT}`)
// );








// /* indexdb.js
//    (modified: added `partitions` field to Sweeper schema and a PUT route to save partitions)
// */
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");

// // For alarmEvents separate collection (OLD version)
// const { Types } = mongoose;

// const app = express();
// app.use(cors());
// app.use(express.json());

// // =======================================================================
// //  MONGO CONNECTION
// // =======================================================================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // =======================================================================
// //  SOCKET.IO (Old code – retained)
// // =======================================================================
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 socket connected:", socket.id);
//   socket.on("disconnect", () => console.log("🔌 socket disconnected:", socket.id));
// });

// // helper
// function emitEvent(name, payload) {
//   try {
//     io.emit(name, payload);
//   } catch (e) {
//     console.error("Socket emit error:", e);
//   }
// }

// // =======================================================================
// //  SCHEMAS — MERGED FROM OLD + NEW
// // =======================================================================

// // ---------------- USER ----------------
// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String,
//   role: String,
//   name: String,
// });
// const User = mongoose.model("User", userSchema);

// // ---------------- SWEEPER ----------------
// // NEW alarmEvents (embedded) merged into sweeper schema
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default: [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type: String, default: null },
//   },
//   // NEW version alarmEvents
//   alarmEvents: { type: Object, default: {} },

//   // PARTITIONS: store per-day partitions (hidden field). Structure:
//   // partitions: { "<yyyymmdd>": [ { startMs: <number>, endMs: <number>, createdAt: Date }, ... ] }
//   partitions: { type: Object, default: {} },
// });
// const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// // ---------------- FACE DATA ----------------
// const faceDataSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   name: String,
//   faceData: String,
//   createdAt: { type: Date, default: Date.now },
// });
// const FaceData = mongoose.model("FaceData", faceDataSchema);

// // ---------------- ATTENDANCE ----------------
// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   date: Date,
//   location: { latitude: Number, longitude: Number },
//   createdAt: { type: Date, default: Date.now },
// });
// const Attendance = mongoose.model("Attendance", attendanceSchema);

// // ---------------- GEOFENCE ----------------
// const geofenceSchema = new mongoose.Schema({
//   name: String,
//   zone: String,
//   landmark: String,
//   geofence: Array,
//   checkpoints: Array,
//   createdAt: { type: Date, default: Date.now },
// });
// const Geofence = mongoose.model("Geofence", geofenceSchema);

// // ---------------- ALARM EVENTS — OLD VERSION (separate collection) ----------------
// const alarmEventSchema = new mongoose.Schema({
//   sweeperId: String,
//   alarmTimestampMs: Number,
//   opened: Boolean,
//   openedTimestampMs: Number,
//   responseMs: Number,
//   verificationTimestampMs: Number,
//   verificationStatus: String,
//   note: String,
//   createdAt: { type: Date, default: Date.now },
// });
// alarmEventSchema.index({ sweeperId: 1, alarmTimestampMs: -1 });

// const AlarmEvent = mongoose.model("AlarmEvent", alarmEventSchema, "alarmevents");

// // =======================================================================
// //  ROUTES — MERGED
// // =======================================================================

// // ---------------- HEALTH CHECK ----------------
// app.get("/", (req, res) => {
//   res.json({ success: true, message: "Sweeper Tracker API running" });
// });

// // ---------------- LOGIN ----------------
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     let user = await User.findOne({ email, password }).lean();
//     if (user)
//       return res.json({
//         success: true,
//         role: user.role,
//         name: user.name,
//         id: user._id,
//       });

//     let sweeper = await Sweeper.findOne({ email, password }).lean();
//     if (sweeper)
//       return res.json({
//         success: true,
//         role: "sweeper",
//         name: sweeper.name,
//         id: sweeper._id,
//       });

//     res.status(401).json({ success: false, message: "Invalid credentials" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  SWEEPERS
// // =======================================================================
// app.get("/sweepers", async (req, res) => {
//   try {
//     res.json({ success: true, sweepers: await Sweeper.find().lean() });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.post("/sweepers", async (req, res) => {
//   try {
//     const { name, email, password, zone, status } = req.body;

//     const exists = await Sweeper.findOne({ email });
//     if (exists)
//       return res.json({ success: false, message: "Email already exists" });

//     const sweeper = await new Sweeper({
//       name,
//       email,
//       password,
//       zone,
//       status
//     }).save();

//     emitEvent("sweeper:added", { sweeper });

//     res.json({ success: true, sweeper });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.delete("/sweepers/:id", async (req, res) => {
//   try {
//     await Sweeper.findByIdAndDelete(req.params.id);
//     await FaceData.deleteOne({ sweeperId: req.params.id });
//     await Attendance.deleteMany({ sweeperId: req.params.id });
//     await AlarmEvent.deleteMany({ sweeperId: req.params.id });

//     emitEvent("sweeper:deleted", { id: req.params.id });

//     res.json({ success: true, message: "Sweeper deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ASSIGNMENT
// // =======================================================================
// app.get("/sweepers/:id/assignment", async (req, res) => {
//   try {
//     const s = await Sweeper.findById(req.params.id).lean();
//     if (!s)
//       return res.status(404).json({ success: false, message: "Sweeper not found" });

//     res.json({
//       success: true,
//       geofence: s.geofence,
//       checkpoints: s.checkpoints,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.put("/sweepers/:id/assignment", async (req, res) => {
//   try {
//     const s = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { geofence: req.body.geofence, checkpoints: req.body.checkpoints },
//       { new: true }
//     );

//     emitEvent("sweeper:updated", { sweeper: s });

//     res.json({ success: true, sweeper: s });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  DUTY TIME
// // =======================================================================
// app.put("/sweepers/:id/duty-time", async (req, res) => {
//   try {
//     const s = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { dutyTime: req.body },
//       { new: true }
//     );

//     emitEvent("sweeper:duty-time-updated", {
//       id: req.params.id,
//       dutyTime: s.dutyTime,
//     });

//     res.json({ success: true, dutyTime: s.dutyTime });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  FACE DATA
// // =======================================================================
// app.get("/sweepers/facedata/:id", async (req, res) => {
//   try {
//     const data = await FaceData.findOne({ sweeperId: req.params.id }).lean();
//     res.json({
//       success: true,
//       hasFaceData: !!data,
//       faceData: data?.faceData || null,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.post("/sweepers/facedata/:id", async (req, res) => {
//   try {
//     const s = await Sweeper.findById(req.params.id);
//     if (!s) return res.json({ success: false, message: "Sweeper not found" });

//     let data = await FaceData.findOne({ sweeperId: req.params.id });

//     if (!data) {
//       data = await new FaceData({
//         sweeperId: req.params.id,
//         name: req.body.name,
//         faceData: req.body.faceData,
//       }).save();
//     } else {
//       data.name = req.body.name;
//       data.faceData = req.body.faceData;
//       await data.save();
//     }

//     res.json({ success: true, faceData: data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ATTENDANCE
// // =======================================================================
// app.post("/sweepers/attendance", async (req, res) => {
//   try {
//     const { sweeperId, date, location } = req.body;

//     const providedDate = date ? new Date(date) : new Date();

//     const dayStart = new Date(providedDate);
//     dayStart.setHours(0, 0, 0, 0);

//     const dayEnd = new Date(dayStart);
//     dayEnd.setDate(dayEnd.getDate() + 1);

//     let existing = await Attendance.findOne({
//       sweeperId,
//       date: { $gte: dayStart, $lt: dayEnd },
//     });

//     if (existing)
//       return res.json({
//         success: true,
//         message: "Attendance already marked",
//         attendance: existing,
//       });

//     const attendance = await new Attendance({
//       sweeperId,
//       date: providedDate,
//       location,
//     }).save();

//     emitEvent("attendance:marked", { sweeperId, attendance });

//     res.json({ success: true, attendance });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/sweepers/:id/attendance", async (req, res) => {
//   try {
//     const q = { sweeperId: req.params.id };

//     if (req.query.from || req.query.to) {
//       q.date = {};
//       if (req.query.from) q.date.$gte = new Date(req.query.from);
//       if (req.query.to) q.date.$lte = new Date(req.query.to);
//     }

//     const data = await Attendance.find(q).sort({ date: -1 }).lean();
//     res.json({ success: true, attendanceHistory: data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ALARM EVENTS — OLD VERSION ROUTES (separate collection)
// // =======================================================================
// app.post("/alarmevents", async (req, res) => {
//   try {
//     const ev = await new AlarmEvent(req.body).save();

//     emitEvent("alarmevent:created", {
//       alarmevent: ev,
//       sweeperId: ev.sweeperId,
//     });

//     res.json({ success: true, alarmevent: ev });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/alarmevents", async (req, res) => {
//   try {
//     const q = {};
//     if (req.query.sweeperId) q.sweeperId = req.query.sweeperId;

//     const events = await AlarmEvent.find(q)
//       .sort({ alarmTimestampMs: -1 })
//       .lean();

//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ALARM EVENTS — NEW VERSION (embedded inside sweeper document)
// // =======================================================================

// // Helper
// function yyyymmddFromMs(ms) {
//   const d = new Date(Number(ms));
//   return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
//     2,
//     "0"
//   )}-${String(d.getUTCDate()).padStart(2, "0")}`;
// }

// // CREATE new embedded alarm event
// app.post("/alarm-events", async (req, res) => {
//   try {
//     const { sweeperId, alarmTimestampMs, location } = req.body;

//     const s = await Sweeper.findById(sweeperId);
//     if (!s)
//       return res.json({ success: false, message: "Sweeper not found" });

//     const dateKey = yyyymmddFromMs(alarmTimestampMs);
//     const id = new mongoose.Types.ObjectId().toString();

//     const evt = {
//       id,
//       alarmTimestampMs,
//       opened: false,
//       openedTimestampMs: null,
//       responseMs: null,
//       verificationTimestampMs: null,
//       verificationStatus: null,
//       location: location || null,
//     };

//     if (!s.alarmEvents[dateKey]) s.alarmEvents[dateKey] = [];
//     s.alarmEvents[dateKey].push(evt);

//     await s.save();

//     res.json({ success: true, event: evt, dateKey });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// /**
//  * BACKWARD COMPATIBLE ALARM EVENTS ENDPOINT
//  * React UI expects: GET /sweepers/:id/alarmevents
//  */
// app.get("/sweepers/:id/alarmevents", async (req, res) => {
//   try {
//     const sweeperId = req.params.id;
//     const { from, to } = req.query;

//     let fromMs = from ? Number(from) : null;
//     let toMs = to ? Number(to) : null;

//     // -------------------------
//     // 1️⃣ FETCH OLD AlarmEvent COLLECTION
//     // -------------------------
//     const oldEvents = await AlarmEvent.find({ sweeperId })
//       .lean()
//       .catch(() => []);

//     // Apply time filtering
//     const filteredOld = oldEvents.filter(ev => {
//       const t = Number(ev.alarmTimestampMs || 0);
//       if (fromMs && t < fromMs) return false;
//       if (toMs && t > toMs) return false;
//       return true;
//     });

//     // -------------------------
//     // 2️⃣ FETCH NEW EMBEDDED EVENTS FROM SWEEPER DOCUMENT
//     // -------------------------
//     const sweeper = await Sweeper.findById(sweeperId).lean();

//     let embeddedEvents = [];
//     if (sweeper?.alarmEvents) {
//       for (const [dateKey, list] of Object.entries(sweeper.alarmEvents)) {
//         if (!Array.isArray(list)) continue;

//         list.forEach(ev => {
//           const t = Number(ev.alarmTimestampMs || 0);
//           if (fromMs && t < fromMs) return;
//           if (toMs && t > toMs) return;
//           embeddedEvents.push({
//             ...ev,
//             _id: ev.id,   // so React table can use key
//             sweeperId
//           });
//         });
//       }
//     }

//     // -------------------------
//     // 3️⃣ MERGE BOTH SYSTEMS
//     // -------------------------
//     const merged = [...filteredOld, ...embeddedEvents];

//     // Sort latest first
//     merged.sort((a, b) => (b.alarmTimestampMs || 0) - (a.alarmTimestampMs || 0));

//     return res.json(merged);

//   } catch (err) {
//     console.error("Error fetching merged alarm events:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // =======================================================================
// //  SAVE PARTITIONS (NEW)
// //  PUT /sweepers/:id/partitions
// //  Body: { dateKey?: string, partitions: [ { startMs: Number, endMs: Number } ] }
// //  Stores partitions under sweeper.partitions[dateKey] = array
// // =======================================================================
// app.put("/sweepers/:id/partitions", async (req, res) => {
//   try {
//     const sweeperId = req.params.id;
//     const { dateKey, partitions } = req.body;

//     if (!Array.isArray(partitions) || partitions.length === 0) {
//       return res.status(400).json({ success: false, message: "Partitions must be a non-empty array" });
//     }

//     const s = await Sweeper.findById(sweeperId);
//     if (!s) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     // Determine date key if not provided (use first partition start)
//     let key = dateKey;
//     if (!key) {
//       const firstStartMs = Number(partitions[0].startMs || Date.now());
//       const d = new Date(firstStartMs);
//       key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
//     }

//     // Store with createdAt metadata per partition
//     const stored = partitions.map(p => ({
//       startMs: Number(p.startMs),
//       endMs: Number(p.endMs),
//       createdAt: new Date(),
//     }));

//     if (!s.partitions) s.partitions = {};
//     s.partitions[key] = stored;

//     await s.save();

//     // Log to server console only (hidden from UI)
//     console.log(`Saved partitions for sweeper=${sweeperId} date=${key} partitions=`, stored);

//     // Optionally emit socket for server-side monitoring (not for UI)
//     emitEvent("sweeper:partitions-saved", { sweeperId, dateKey: key });

//     res.json({ success: true, dateKey: key });
//   } catch (err) {
//     console.error("Error saving partitions:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  GEOFENCE ROUTES
// // =======================================================================
// app.post("/geofences", async (req, res) => {
//   try {
//     const gf = await new Geofence(req.body).save();
//     res.json({ success: true, geofence: gf });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences", async (req, res) => {
//   try {
//     const data = await Geofence.find().lean();
//     res.json({ success: true, geofences: data });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences/:id", async (req, res) => {
//   try {
//     const data = await Geofence.findById(req.params.id).lean();
//     if (!data)
//       return res.json({ success: false, message: "Geofence not found" });

//     res.json({ success: true, geofence: data });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.delete("/geofences/:id", async (req, res) => {
//   try {
//     const gf = await Geofence.findByIdAndDelete(req.params.id);
//     if (!gf)
//       return res.json({ success: false, message: "Geofence not found" });

//     res.json({ success: true, message: "Geofence deleted" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  START SERVER
// // =======================================================================
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, "0.0.0.0", () =>
//   console.log(`🚀 SERVER + SOCKET.IO RUNNING ON http://0.0.0.0:${PORT}`)
// );







// /* indexdb_Version2.js
//    (updated: added partitions query endpoint and an EventIndex collection to map
//     eventId -> sweeperId/dateKey for fast lookup. Embedded + old events creation
//     now populate EventIndex. findEmbeddedEventById now uses EventIndex.)
// */
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");

// // For alarmEvents separate collection (OLD version)
// const { Types } = mongoose;

// const app = express();
// app.use(cors());
// app.use(express.json());

// // =======================================================================
// //  MONGO CONNECTION
// // =======================================================================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// mongoose
//   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   });

// // =======================================================================
// //  SOCKET.IO (Old code – retained)
// // =======================================================================
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   cors: { origin: "*" },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 socket connected:", socket.id);
//   socket.on("disconnect", () => console.log("🔌 socket disconnected:", socket.id));
// });

// // helper
// function emitEvent(name, payload) {
//   try {
//     io.emit(name, payload);
//   } catch (e) {
//     console.error("Socket emit error:", e);
//   }
// }

// // =======================================================================
// //  SCHEMAS — MERGED FROM OLD + NEW
// // =======================================================================

// // ---------------- USER ----------------
// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String,
//   role: String,
//   name: String,
// });
// const User = mongoose.model("User", userSchema);

// // ---------------- SWEEPER ----------------
// // NEW alarmEvents (embedded) merged into sweeper schema
// const sweeperSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   geofence: { type: Array, default: [] },
//   checkpoints: { type: Array, default: [] },
//   dutyTime: {
//     start: { type: String, default: null },
//     end: { type: String, default: null },
//   },
//   // NEW version alarmEvents
//   alarmEvents: { type: Object, default: {} },

//   // PARTITIONS: store per-day partitions (hidden field). Structure:
//   // partitions: { "<yyyymmdd>": [ { startMs: <number>, endMs: <number>, createdAt: Date }, ... ] }
//   partitions: { type: Object, default: {} },
// });
// const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// // ---------------- EVENT INDEX (fast lookup for embedded events) ----------------
// // Maps eventId -> sweeperId + dateKey
// const eventIndexSchema = new mongoose.Schema({
//   eventId: { type: String, required: true, unique: true, index: true },
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
//   dateKey: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });
// const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// // ---------------- FACE DATA ----------------
// const faceDataSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   name: String,
//   faceData: String,
//   createdAt: { type: Date, default: Date.now },
// });
// const FaceData = mongoose.model("FaceData", faceDataSchema);

// // ---------------- ATTENDANCE ----------------
// const attendanceSchema = new mongoose.Schema({
//   sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
//   date: Date,
//   location: { latitude: Number, longitude: Number },
//   createdAt: { type: Date, default: Date.now },
// });
// const Attendance = mongoose.model("Attendance", attendanceSchema);

// // ---------------- GEOFENCE ----------------
// const geofenceSchema = new mongoose.Schema({
//   name: String,
//   zone: String,
//   landmark: String,
//   geofence: Array,
//   checkpoints: Array,
//   createdAt: { type: Date, default: Date.now },
// });
// const Geofence = mongoose.model("Geofence", geofenceSchema);

// // ---------------- ALARM EVENTS — OLD VERSION (separate collection) ----------------
// const alarmEventSchema = new mongoose.Schema({
//   sweeperId: String,
//   alarmTimestampMs: Number,
//   opened: Boolean,
//   openedTimestampMs: Number,
//   responseMs: Number,
//   verificationTimestampMs: Number,
//   verificationStatus: String,
//   note: String,
//   location: {
//     latitude: Number,
//     longitude: Number
//   },
//   createdAt: { type: Date, default: Date.now },
// });
// alarmEventSchema.index({ sweeperId: 1, alarmTimestampMs: -1 });

// const AlarmEvent = mongoose.model("AlarmEvent", alarmEventSchema, "alarmevents");

// // =======================================================================
// //  ROUTES — MERGED
// // =======================================================================

// // ---------------- HEALTH CHECK ----------------
// app.get("/", (req, res) => {
//   res.json({ success: true, message: "Sweeper Tracker API running" });
// });

// // ---------------- LOGIN ----------------
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     let user = await User.findOne({ email, password }).lean();
//     if (user)
//       return res.json({
//         success: true,
//         role: user.role,
//         name: user.name,
//         id: user._id,
//       });

//     let sweeper = await Sweeper.findOne({ email, password }).lean();
//     if (sweeper)
//       return res.json({
//         success: true,
//         role: "sweeper",
//         name: sweeper.name,
//         id: sweeper._id,
//       });

//     res.status(401).json({ success: false, message: "Invalid credentials" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  SWEEPERS
// // =======================================================================
// app.get("/sweepers", async (req, res) => {
//   try {
//     res.json({ success: true, sweepers: await Sweeper.find().lean() });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.post("/sweepers", async (req, res) => {
//   try {
//     const { name, email, password, zone, status } = req.body;

//     const exists = await Sweeper.findOne({ email });
//     if (exists)
//       return res.json({ success: false, message: "Email already exists" });

//     const sweeper = await new Sweeper({
//       name,
//       email,
//       password,
//       zone,
//       status
//     }).save();

//     emitEvent("sweeper:added", { sweeper });

//     res.json({ success: true, sweeper });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.delete("/sweepers/:id", async (req, res) => {
//   try {
//     await Sweeper.findByIdAndDelete(req.params.id);
//     await FaceData.deleteOne({ sweeperId: req.params.id });
//     await Attendance.deleteMany({ sweeperId: req.params.id });
//     await AlarmEvent.deleteMany({ sweeperId: req.params.id });
//     // Optionally cleanup EventIndex entries for that sweeper
//     await EventIndex.deleteMany({ sweeperId: req.params.id });

//     emitEvent("sweeper:deleted", { id: req.params.id });

//     res.json({ success: true, message: "Sweeper deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ASSIGNMENT
// // =======================================================================
// app.get("/sweepers/:id/assignment", async (req, res) => {
//   try {
//     const s = await Sweeper.findById(req.params.id).lean();
//     if (!s)
//       return res.status(404).json({ success: false, message: "Sweeper not found" });

//     res.json({
//       success: true,
//       geofence: s.geofence,
//       checkpoints: s.checkpoints,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.put("/sweepers/:id/assignment", async (req, res) => {
//   try {
//     const s = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { geofence: req.body.geofence, checkpoints: req.body.checkpoints },
//       { new: true }
//     );

//     emitEvent("sweeper:updated", { sweeper: s });

//     res.json({ success: true, sweeper: s });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  DUTY TIME
// // =======================================================================
// app.put("/sweepers/:id/duty-time", async (req, res) => {
//   try {
//     const s = await Sweeper.findByIdAndUpdate(
//       req.params.id,
//       { dutyTime: req.body },
//       { new: true }
//     );

//     emitEvent("sweeper:duty-time-updated", {
//       id: req.params.id,
//       dutyTime: s.dutyTime,
//     });

//     res.json({ success: true, dutyTime: s.dutyTime });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  FACE DATA
// // =======================================================================
// app.get("/sweepers/facedata/:id", async (req, res) => {
//   try {
//     const data = await FaceData.findOne({ sweeperId: req.params.id }).lean();
//     res.json({
//       success: true,
//       hasFaceData: !!data,
//       faceData: data?.faceData || null,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.post("/sweepers/facedata/:id", async (req, res) => {
//   try {
//     const s = await Sweeper.findById(req.params.id);
//     if (!s) return res.json({ success: false, message: "Sweeper not found" });

//     let data = await FaceData.findOne({ sweeperId: req.params.id });

//     if (!data) {
//       data = await new FaceData({
//         sweeperId: req.params.id,
//         name: req.body.name,
//         faceData: req.body.faceData,
//       }).save();
//     } else {
//       data.name = req.body.name;
//       data.faceData = req.body.faceData;
//       await data.save();
//     }

//     res.json({ success: true, faceData: data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ATTENDANCE
// // =======================================================================
// app.post("/sweepers/attendance", async (req, res) => {
//   try {
//     const { sweeperId, date, location } = req.body;

//     const providedDate = date ? new Date(date) : new Date();

//     const dayStart = new Date(providedDate);
//     dayStart.setHours(0, 0, 0, 0);

//     const dayEnd = new Date(dayStart);
//     dayEnd.setDate(dayEnd.getDate() + 1);

//     let existing = await Attendance.findOne({
//       sweeperId,
//       date: { $gte: dayStart, $lt: dayEnd },
//     });

//     if (existing)
//       return res.json({
//         success: true,
//         message: "Attendance already marked",
//         attendance: existing,
//       });

//     const attendance = await new Attendance({
//       sweeperId,
//       date: providedDate,
//       location,
//     }).save();

//     emitEvent("attendance:marked", { sweeperId, attendance });

//     res.json({ success: true, attendance });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/sweepers/:id/attendance", async (req, res) => {
//   try {
//     const q = { sweeperId: req.params.id };

//     if (req.query.from || req.query.to) {
//       q.date = {};
//       if (req.query.from) q.date.$gte = new Date(req.query.from);
//       if (req.query.to) q.date.$lte = new Date(req.query.to);
//     }

//     const data = await Attendance.find(q).sort({ date: -1 }).lean();
//     res.json({ success: true, attendanceHistory: data });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ALARM EVENTS — OLD VERSION ROUTES (separate collection)
// // =======================================================================
// app.post("/alarmevents", async (req, res) => {
//   try {
//     const ev = await new AlarmEvent(req.body).save();

//     // create index entry for old-style event (use _id string)
//     try {
//       await EventIndex.create({
//         eventId: ev._id.toString(),
//         sweeperId: mongoose.Types.ObjectId(ev.sweeperId),
//         dateKey: (() => {
//           const d = new Date(Number(ev.alarmTimestampMs || Date.now()));
//           return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
//         })(),
//       });
//     } catch (e) {
//       // ignore duplicate/index errors
//     }

//     emitEvent("alarmevent:created", {
//       alarmevent: ev,
//       sweeperId: ev.sweeperId,
//     });

//     res.json({ success: true, alarmevent: ev });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.get("/alarmevents", async (req, res) => {
//   try {
//     const q = {};
//     if (req.query.sweeperId) q.sweeperId = req.query.sweeperId;

//     const events = await AlarmEvent.find(q)
//       .sort({ alarmTimestampMs: -1 })
//       .lean();

//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  ALARM EVENTS — NEW VERSION (embedded inside sweeper document)
// // =======================================================================

// // Helper
// function yyyymmddFromMs(ms) {
//   const d = new Date(Number(ms));
//   return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
//     2,
//     "0"
//   )}-${String(d.getUTCDate()).padStart(2, "0")}`;
// }

// // CREATE new embedded alarm event
// app.post("/alarm-events", async (req, res) => {
//   try {
//     const { sweeperId, alarmTimestampMs, location } = req.body;

//     const s = await Sweeper.findById(sweeperId);
//     if (!s)
//       return res.json({ success: false, message: "Sweeper not found" });

//     const dateKey = yyyymmddFromMs(alarmTimestampMs);
//     const id = new mongoose.Types.ObjectId().toString();

//     const evt = {
//       id,
//       alarmTimestampMs,
//       opened: false,
//       openedTimestampMs: null,
//       responseMs: null,
//       verificationTimestampMs: null,
//       verificationStatus: null,
//       location: location || null,
//     };

//     if (!s.alarmEvents[dateKey]) s.alarmEvents[dateKey] = [];
//     s.alarmEvents[dateKey].push(evt);

//     await s.save();

//     // Add to EventIndex for fast lookup
//     try {
//       await EventIndex.create({
//         eventId: id,
//         sweeperId: s._id,
//         dateKey,
//       });
//     } catch (e) {
//       // ignore dup/index errors
//     }

//     res.json({ success: true, event: evt, dateKey });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// /**
//  * BACKWARD COMPATIBLE ALARM EVENTS ENDPOINT
//  * React UI expects: GET /sweepers/:id/alarmevents
//  */
// async function getMergedAlarmEventsForSweeper(sweeperId, fromMs = null, toMs = null) {
//   // 1) old collection
//   const oldEvents = await AlarmEvent.find({ sweeperId })
//     .lean()
//     .catch(() => []);

//   const filteredOld = oldEvents.filter(ev => {
//     const t = Number(ev.alarmTimestampMs || 0);
//     if (fromMs && t < fromMs) return false;
//     if (toMs && t > toMs) return false;
//     return true;
//   });

//   // 2) embedded events
//   const sweeper = await Sweeper.findById(sweeperId).lean();

//   let embeddedEvents = [];
//   if (sweeper?.alarmEvents) {
//     for (const [dateKey, list] of Object.entries(sweeper.alarmEvents)) {
//       if (!Array.isArray(list)) continue;

//       list.forEach(ev => {
//         const t = Number(ev.alarmTimestampMs || 0);
//         if (fromMs && t < fromMs) return;
//         if (toMs && t > toMs) return;
//         embeddedEvents.push({
//           ...ev,
//           _id: ev.id,   // for compatibility
//           sweeperId
//         });
//       });
//     }
//   }

//   // 3) merge & sort
//   const merged = [...filteredOld, ...embeddedEvents];
//   merged.sort((a, b) => (b.alarmTimestampMs || 0) - (a.alarmTimestampMs || 0));
//   return merged;
// }

// app.get("/sweepers/:id/alarmevents", async (req, res) => {
//   try {
//     const sweeperId = req.params.id;
//     const { from, to } = req.query;
//     const fromMs = from ? Number(from) : null;
//     const toMs = to ? Number(to) : null;

//     const merged = await getMergedAlarmEventsForSweeper(sweeperId, fromMs, toMs);
//     return res.json(merged);
//   } catch (err) {
//     console.error("Error fetching merged alarm events:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // Also add hyphenated route expected by client: /sweepers/:id/alarm-events
// app.get("/sweepers/:id/alarm-events", async (req, res) => {
//   try {
//     const sweeperId = req.params.id;
//     const { from, to } = req.query;
//     const fromMs = from ? Number(from) : null;
//     const toMs = to ? Number(to) : null;

//     const merged = await getMergedAlarmEventsForSweeper(sweeperId, fromMs, toMs);
//     return res.json(merged);
//   } catch (err) {
//     console.error("Error fetching merged alarm events (hyphen route):", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// // =======================================================================
// //  OPEN / VERIFY single event endpoints
// //  PUT /alarm-events/:id/open
// //  PUT /alarm-events/:id/verify
// //  - These update either the AlarmEvent collection entry or the embedded sweeper.alarmEvents entry
// //  - Uses EventIndex for fast lookup of embedded events
// // =======================================================================

// async function findEmbeddedEventById(eventId) {
//   // Use EventIndex lookup
//   try {
//     const idx = await EventIndex.findOne({ eventId }).lean();
//     if (!idx) return null;
//     const sweeper = await Sweeper.findById(idx.sweeperId).lean();
//     if (!sweeper) return null;
//     const arr = sweeper.alarmEvents && sweeper.alarmEvents[idx.dateKey] ? sweeper.alarmEvents[idx.dateKey] : [];
//     const ev = Array.isArray(arr) ? arr.find(x => String(x.id) === String(eventId)) : null;
//     if (!ev) return null;
//     return { sweeper, dateKey: idx.dateKey, event: ev };
//   } catch (e) {
//     console.error("EventIndex lookup error:", e);
//     return null;
//   }
// }

// app.put("/alarm-events/:id/open", async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const openedTimestampMs = req.body.openedTimestampMs ? Number(req.body.openedTimestampMs) : Date.now();

//     // 1) Try old collection by _id or id field
//     let ae = null;
//     try {
//       ae = await AlarmEvent.findOne({ $or: [{ _id: eventId }, { id: eventId }] });
//     } catch (_) {
//       ae = null;
//     }

//     if (ae) {
//       ae.opened = true;
//       ae.openedTimestampMs = openedTimestampMs;
//       if (ae.alarmTimestampMs) {
//         ae.responseMs = (ae.openedTimestampMs || Date.now()) - (ae.alarmTimestampMs || 0);
//       }
//       await ae.save();
//       return res.json({ success: true, event: ae });
//     }

//     // 2) Try embedded via EventIndex
//     const found = await findEmbeddedEventById(eventId);
//     if (found) {
//       const s = await Sweeper.findById(found.sweeper._id);
//       const arr = s.alarmEvents[found.dateKey];
//       if (Array.isArray(arr)) {
//         const idx = arr.findIndex(x => String(x.id) === String(eventId));
//         if (idx !== -1) {
//           s.alarmEvents[found.dateKey][idx].opened = true;
//           s.alarmEvents[found.dateKey][idx].openedTimestampMs = openedTimestampMs;
//           const alarmTs = s.alarmEvents[found.dateKey][idx].alarmTimestampMs;
//           if (alarmTs) {
//             s.alarmEvents[found.dateKey][idx].responseMs = openedTimestampMs - Number(alarmTs);
//           }
//           await s.save();
//           return res.json({ success: true, event: s.alarmEvents[found.dateKey][idx] });
//         }
//       }
//     }

//     return res.status(404).json({ success: false, message: "Event not found" });
//   } catch (err) {
//     console.error("Error marking event open:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// app.put("/alarm-events/:id/verify", async (req, res) => {
//   try {
//     const eventId = req.params.id;
//     const verificationTimestampMs = req.body.verificationTimestampMs ? Number(req.body.verificationTimestampMs) : Date.now();
//     const status = req.body.status ? String(req.body.status) : 'unknown';
//     const location = req.body.location || null;

//     // 1) Try old collection
//     let ae = null;
//     try {
//       ae = await AlarmEvent.findOne({ $or: [{ _id: eventId }, { id: eventId }] });
//     } catch (_) {
//       ae = null;
//     }

//     if (ae) {
//       ae.verificationTimestampMs = verificationTimestampMs;
//       ae.verificationStatus = status;
//       if (location && typeof location === 'object') {
//         ae.location = {
//           latitude: Number(location.latitude || null),
//           longitude: Number(location.longitude || null)
//         };
//       }
//       await ae.save();
//       return res.json({ success: true, event: ae });
//     }

//     // 2) Try embedded via EventIndex
//     const found = await findEmbeddedEventById(eventId);
//     if (found) {
//       const s = await Sweeper.findById(found.sweeper._id);
//       const arr = s.alarmEvents[found.dateKey];
//       if (Array.isArray(arr)) {
//         const idx = arr.findIndex(x => String(x.id) === String(eventId));
//         if (idx !== -1) {
//           s.alarmEvents[found.dateKey][idx].verificationTimestampMs = verificationTimestampMs;
//           s.alarmEvents[found.dateKey][idx].verificationStatus = status;
//           if (location && typeof location === 'object') {
//             s.alarmEvents[found.dateKey][idx].location = {
//               latitude: Number(location.latitude || null),
//               longitude: Number(location.longitude || null)
//             };
//           }
//           await s.save();
//           return res.json({ success: true, event: s.alarmEvents[found.dateKey][idx] });
//         }
//       }
//     }

//     return res.status(404).json({ success: false, message: "Event not found" });
//   } catch (err) {
//     console.error("Error recording verification:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  SAVE PARTITIONS (NEW)
// //  PUT /sweepers/:id/partitions
// //  Body: { dateKey?: string, partitions: [ { startMs: Number, endMs: Number } ] }
// //  Stores partitions under sweeper.partitions[dateKey] = array
// // =======================================================================
// app.put("/sweepers/:id/partitions", async (req, res) => {
//   try {
//     const sweeperId = req.params.id;
//     const { dateKey, partitions } = req.body;

//     if (!Array.isArray(partitions) || partitions.length === 0) {
//       return res.status(400).json({ success: false, message: "Partitions must be a non-empty array" });
//     }

//     const s = await Sweeper.findById(sweeperId);
//     if (!s) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     // Determine date key if not provided (use first partition start)
//     let key = dateKey;
//     if (!key) {
//       const firstStartMs = Number(partitions[0].startMs || Date.now());
//       const d = new Date(firstStartMs);
//       key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
//     }

//     // Store with createdAt metadata per partition
//     const stored = partitions.map(p => ({
//       startMs: Number(p.startMs),
//       endMs: Number(p.endMs),
//       createdAt: new Date(),
//     }));

//     if (!s.partitions) s.partitions = {};
//     s.partitions[key] = stored;

//     await s.save();

//     // Log to server console only (hidden from UI)
//     console.log(`Saved partitions for sweeper=${sweeperId} date=${key} partitions=`, stored);

//     // Optionally emit socket for server-side monitoring (not for UI)
//     emitEvent("sweeper:partitions-saved", { sweeperId, dateKey: key });

//     res.json({ success: true, dateKey: key });
//   } catch (err) {
//     console.error("Error saving partitions:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  NEW: GET partitions for sweeper/date
// //  GET /sweepers/:id/partitions?dateKey=YYYY-MM-DD
// //  If dateKey omitted, returns entire partitions object for sweeper
// // =======================================================================
// app.get("/sweepers/:id/partitions", async (req, res) => {
//   try {
//     const sweeperId = req.params.id;
//     const dateKey = req.query.dateKey;

//     const s = await Sweeper.findById(sweeperId).lean();
//     if (!s) return res.status(404).json({ success: false, message: "Sweeper not found" });

//     if (!s.partitions) return res.json({ success: true, partitions: {} });

//     if (dateKey) {
//       const partsForDate = s.partitions[dateKey] || [];
//       return res.json({ success: true, dateKey, partitions: partsForDate });
//     }

//     // return all
//     return res.json({ success: true, partitions: s.partitions });
//   } catch (err) {
//     console.error("Error fetching partitions:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  GEOFENCE ROUTES
// // =======================================================================
// app.post("/geofences", async (req, res) => {
//   try {
//     const gf = await new Geofence(req.body).save();
//     res.json({ success: true, geofence: gf });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences", async (req, res) => {
//   try {
//     const data = await Geofence.find().lean();
//     res.json({ success: true, geofences: data });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.get("/geofences/:id", async (req, res) => {
//   try {
//     const data = await Geofence.findById(req.params.id).lean();
//     if (!data)
//       return res.json({ success: false, message: "Geofence not found" });

//     res.json({ success: true, geofence: data });
//   } catch (err) {
//     res.json({ success: false, message: err.message });
//   }
// });

// app.delete("/geofences/:id", async (req, res) => {
//   try {
//     const gf = await Geofence.findByIdAndDelete(req.params.id);
//     if (!gf)
//       return res.json({ success: false, message: "Geofence not found" });

//     res.json({ success: true, message: "Geofence deleted" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // =======================================================================
// //  START SERVER
// // =======================================================================
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, "0.0.0.0", () =>
//   console.log(`🚀 SERVER + SOCKET.IO RUNNING ON http://0.0.0.0:${PORT}`)
// );




/* indexdb_Version2.js
   (updated: added partitions query endpoint and an EventIndex collection to map
    eventId -> sweeperId/dateKey for fast lookup. Updated POST /alarm-events to
    accept slotName + initialStatus and store them in the embedded event so scheduled
    alarms are persisted with attributes like "1st/2nd/3rd", time and default status.)
*/
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");

// For alarmEvents separate collection (OLD version)
const { Types } = mongoose;

const app = express();
app.use(cors());
app.use(express.json());

// =======================================================================
//  MONGO CONNECTION
// =======================================================================
const MONGO_URI =
  "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// =======================================================================
//  SOCKET.IO (Old code – retained)
// =======================================================================
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🔌 socket connected:", socket.id);
  socket.on("disconnect", () => console.log("🔌 socket disconnected:", socket.id));
});

// helper
function emitEvent(name, payload) {
  try {
    io.emit(name, payload);
  } catch (e) {
    console.error("Socket emit error:", e);
  }
}

// =======================================================================
//  SCHEMAS — MERGED FROM OLD + NEW
// =======================================================================

// ---------------- USER ----------------
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  name: String,
});
const User = mongoose.model("User", userSchema);

// ---------------- SWEEPER ----------------
// NEW alarmEvents (embedded) merged into sweeper schema
const sweeperSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  geofence: { type: Array, default: [] },
  checkpoints: { type: Array, default: [] },
  dutyTime: {
    start: { type: String, default: null },
    end: { type: String, default: null },
  },
  // NEW version alarmEvents
  alarmEvents: { type: Object, default: {} },

  // PARTITIONS: store per-day partitions (hidden field). Structure:
  // partitions: { "<yyyymmdd>": [ { startMs: <number>, endMs: <number>, createdAt: Date }, ... ] }
  partitions: { type: Object, default: {} },
});
const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// ---------------- EVENT INDEX (fast lookup for embedded events) ----------------
// Maps eventId -> sweeperId + dateKey
const eventIndexSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
  dateKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const EventIndex = mongoose.model("EventIndex", eventIndexSchema, "eventindexes");

// ---------------- FACE DATA ----------------
const faceDataSchema = new mongoose.Schema({
  sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
  name: String,
  faceData: String,
  createdAt: { type: Date, default: Date.now },
});
const FaceData = mongoose.model("FaceData", faceDataSchema);

// ---------------- ATTENDANCE ----------------
const attendanceSchema = new mongoose.Schema({
  sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper" },
  date: Date,
  location: { latitude: Number, longitude: Number },
  createdAt: { type: Date, default: Date.now },
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

// ---------------- GEOFENCE ----------------
const geofenceSchema = new mongoose.Schema({
  name: String,
  zone: String,
  landmark: String,
  geofence: Array,
  checkpoints: Array,
  createdAt: { type: Date, default: Date.now },
});
const Geofence = mongoose.model("Geofence", geofenceSchema);

// ---------------- ALARM EVENTS — OLD VERSION (separate collection) ----------------
const alarmEventSchema = new mongoose.Schema({
  sweeperId: String,
  alarmTimestampMs: Number,
  opened: Boolean,
  openedTimestampMs: Number,
  responseMs: Number,
  verificationTimestampMs: Number,
  verificationStatus: String,
  slotName: String, // optional: "1st", "2nd", "3rd"
  note: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: { type: Date, default: Date.now },
});
alarmEventSchema.index({ sweeperId: 1, alarmTimestampMs: -1 });

const AlarmEvent = mongoose.model("AlarmEvent", alarmEventSchema, "alarmevents");

// =======================================================================
//  ROUTES — MERGED
// =======================================================================

// ---------------- HEALTH CHECK ----------------
app.get("/", (req, res) => {
  res.json({ success: true, message: "Sweeper Tracker API running" });
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email, password }).lean();
    if (user)
      return res.json({
        success: true,
        role: user.role,
        name: user.name,
        id: user._id,
      });

    let sweeper = await Sweeper.findOne({ email, password }).lean();
    if (sweeper)
      return res.json({
        success: true,
        role: "sweeper",
        name: sweeper.name,
        id: sweeper._id,
      });

    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  SWEEPERS
// =======================================================================
app.get("/sweepers", async (req, res) => {
  try {
    res.json({ success: true, sweepers: await Sweeper.find().lean() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/sweepers", async (req, res) => {
  try {
    const { name, email, password, zone, status } = req.body;

    const exists = await Sweeper.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "Email already exists" });

    const sweeper = await new Sweeper({
      name,
      email,
      password,
      zone,
      status
    }).save();

    emitEvent("sweeper:added", { sweeper });

    res.json({ success: true, sweeper });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/sweepers/:id", async (req, res) => {
  try {
    await Sweeper.findByIdAndDelete(req.params.id);
    await FaceData.deleteOne({ sweeperId: req.params.id });
    await Attendance.deleteMany({ sweeperId: req.params.id });
    await AlarmEvent.deleteMany({ sweeperId: req.params.id });
    // Optionally cleanup EventIndex entries for that sweeper
    await EventIndex.deleteMany({ sweeperId: req.params.id });

    emitEvent("sweeper:deleted", { id: req.params.id });

    res.json({ success: true, message: "Sweeper deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  ASSIGNMENT
// =======================================================================
app.get("/sweepers/:id/assignment", async (req, res) => {
  try {
    const s = await Sweeper.findById(req.params.id).lean();
    if (!s)
      return res.status(404).json({ success: false, message: "Sweeper not found" });

    res.json({
      success: true,
      geofence: s.geofence,
      checkpoints: s.checkpoints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/sweepers/:id/assignment", async (req, res) => {
  try {
    const s = await Sweeper.findByIdAndUpdate(
      req.params.id,
      { geofence: req.body.geofence, checkpoints: req.body.checkpoints },
      { new: true }
    );

    emitEvent("sweeper:updated", { sweeper: s });

    res.json({ success: true, sweeper: s });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  DUTY TIME
// =======================================================================
app.put("/sweepers/:id/duty-time", async (req, res) => {
  try {
    const s = await Sweeper.findByIdAndUpdate(
      req.params.id,
      { dutyTime: req.body },
      { new: true }
    );

    emitEvent("sweeper:duty-time-updated", {
      id: req.params.id,
      dutyTime: s.dutyTime,
    });

    res.json({ success: true, dutyTime: s.dutyTime });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  FACE DATA
// =======================================================================
app.get("/sweepers/facedata/:id", async (req, res) => {
  try {
    const data = await FaceData.findOne({ sweeperId: req.params.id }).lean();
    res.json({
      success: true,
      hasFaceData: !!data,
      faceData: data?.faceData || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/sweepers/facedata/:id", async (req, res) => {
  try {
    const s = await Sweeper.findById(req.params.id);
    if (!s) return res.json({ success: false, message: "Sweeper not found" });

    let data = await FaceData.findOne({ sweeperId: req.params.id });

    if (!data) {
      data = await new FaceData({
        sweeperId: req.params.id,
        name: req.body.name,
        faceData: req.body.faceData,
      }).save();
    } else {
      data.name = req.body.name;
      data.faceData = req.body.faceData;
      await data.save();
    }

    res.json({ success: true, faceData: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  ATTENDANCE
// =======================================================================
app.post("/sweepers/attendance", async (req, res) => {
  try {
    const { sweeperId, date, location } = req.body;

    const providedDate = date ? new Date(date) : new Date();

    const dayStart = new Date(providedDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    let existing = await Attendance.findOne({
      sweeperId,
      date: { $gte: dayStart, $lt: dayEnd },
    });

    if (existing)
      return res.json({
        success: true,
        message: "Attendance already marked",
        attendance: existing,
      });

    const attendance = await new Attendance({
      sweeperId,
      date: providedDate,
      location,
    }).save();

    emitEvent("attendance:marked", { sweeperId, attendance });

    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/sweepers/:id/attendance", async (req, res) => {
  try {
    const q = { sweeperId: req.params.id };

    if (req.query.from || req.query.to) {
      q.date = {};
      if (req.query.from) q.date.$gte = new Date(req.query.from);
      if (req.query.to) q.date.$lte = new Date(req.query.to);
    }

    const data = await Attendance.find(q).sort({ date: -1 }).lean();
    res.json({ success: true, attendanceHistory: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  ALARM EVENTS — OLD VERSION ROUTES (separate collection)
// =======================================================================
app.post("/alarmevents", async (req, res) => {
  try {
    const ev = await new AlarmEvent(req.body).save();

    // create index entry for old-style event (use _id string)
    try {
      await EventIndex.create({
        eventId: ev._id.toString(),
        sweeperId: mongoose.Types.ObjectId(ev.sweeperId),
        dateKey: (() => {
          const d = new Date(Number(ev.alarmTimestampMs || Date.now()));
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        })(),
      });
    } catch (e) {
      // ignore duplicate/index errors
    }

    emitEvent("alarmevent:created", {
      alarmevent: ev,
      sweeperId: ev.sweeperId,
    });

    res.json({ success: true, alarmevent: ev });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/alarmevents", async (req, res) => {
  try {
    const q = {};
    if (req.query.sweeperId) q.sweeperId = req.query.sweeperId;

    const events = await AlarmEvent.find(q)
      .sort({ alarmTimestampMs: -1 })
      .lean();

    res.json(events);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  ALARM EVENTS — NEW VERSION (embedded inside sweeper document)
// =======================================================================

// Helper
function yyyymmddFromMs(ms) {
  const d = new Date(Number(ms));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

// CREATE new embedded alarm event
// Now accepts optional `slotName` and `initialStatus` so scheduled events can be persisted
app.post("/alarm-events", async (req, res) => {
  try {
    const { sweeperId, alarmTimestampMs, location, slotName, initialStatus } = req.body;

    const s = await Sweeper.findById(sweeperId);
    if (!s)
      return res.json({ success: false, message: "Sweeper not found" });

    const dateKey = yyyymmddFromMs(alarmTimestampMs || Date.now());
    const id = new mongoose.Types.ObjectId().toString();

    const evt = {
      id,
      alarmTimestampMs: Number(alarmTimestampMs || Date.now()),
      opened: false,
      openedTimestampMs: null,
      responseMs: null,
      verificationTimestampMs: null,
      verificationStatus: initialStatus || 'missed', // default to 'missed' for scheduled alarms
      slotName: slotName || null,
      location: location || null,
    };

    if (!s.alarmEvents[dateKey]) s.alarmEvents[dateKey] = [];
    s.alarmEvents[dateKey].push(evt);

    await s.save();

    // Add to EventIndex for fast lookup
    try {
      await EventIndex.create({
        eventId: id,
        sweeperId: s._id,
        dateKey,
      });
    } catch (e) {
      // ignore dup/index errors
    }

    res.json({ success: true, event: evt, dateKey });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

/**
 * BACKWARD COMPATIBLE ALARM EVENTS ENDPOINT
 * GET /sweepers/:id/alarmevents (or /alarm-events)
 * Merges old collection and embedded events.
 */
async function getMergedAlarmEventsForSweeper(sweeperId, fromMs = null, toMs = null) {
  // 1) old collection
  const oldEvents = await AlarmEvent.find({ sweeperId })
    .lean()
    .catch(() => []);

  const filteredOld = oldEvents.filter(ev => {
    const t = Number(ev.alarmTimestampMs || 0);
    if (fromMs && t < fromMs) return false;
    if (toMs && t > toMs) return false;
    return true;
  });

  // 2) embedded events
  const sweeper = await Sweeper.findById(sweeperId).lean();

  let embeddedEvents = [];
  if (sweeper?.alarmEvents) {
    for (const [dateKey, list] of Object.entries(sweeper.alarmEvents)) {
      if (!Array.isArray(list)) continue;

      list.forEach(ev => {
        const t = Number(ev.alarmTimestampMs || 0);
        if (fromMs && t < fromMs) return;
        if (toMs && t > toMs) return;
        embeddedEvents.push({
          ...ev,
          _id: ev.id,   // for compatibility
          sweeperId
        });
      });
    }
  }

  // 3) merge & sort
  const merged = [...filteredOld, ...embeddedEvents];
  merged.sort((a, b) => (b.alarmTimestampMs || 0) - (a.alarmTimestampMs || 0));
  return merged;
}

app.get("/sweepers/:id/alarmevents", async (req, res) => {
  try {
    const sweeperId = req.params.id;
    const { from, to } = req.query;
    const fromMs = from ? Number(from) : null;
    const toMs = to ? Number(to) : null;

    const merged = await getMergedAlarmEventsForSweeper(sweeperId, fromMs, toMs);
    return res.json(merged);
  } catch (err) {
    console.error("Error fetching merged alarm events:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Also add hyphenated route expected by client: /sweepers/:id/alarm-events
app.get("/sweepers/:id/alarm-events", async (req, res) => {
  try {
    const sweeperId = req.params.id;
    const { from, to } = req.query;
    const fromMs = from ? Number(from) : null;
    const toMs = to ? Number(to) : null;

    const merged = await getMergedAlarmEventsForSweeper(sweeperId, fromMs, toMs);
    return res.json(merged);
  } catch (err) {
    console.error("Error fetching merged alarm events (hyphen route):", err);
    return res.status(500).json({ error: err.message });
  }
});

// =======================================================================
//  OPEN / VERIFY single event endpoints
//  PUT /alarm-events/:id/open
//  PUT /alarm-events/:id/verify
//  - These update either the AlarmEvent collection entry or the embedded sweeper.alarmEvents entry
//  - Uses EventIndex for fast lookup of embedded events
// =======================================================================

async function findEmbeddedEventById(eventId) {
  // Use EventIndex lookup
  try {
    const idx = await EventIndex.findOne({ eventId }).lean();
    if (!idx) return null;
    const sweeper = await Sweeper.findById(idx.sweeperId).lean();
    if (!sweeper) return null;
    const arr = sweeper.alarmEvents && sweeper.alarmEvents[idx.dateKey] ? sweeper.alarmEvents[idx.dateKey] : [];
    const ev = Array.isArray(arr) ? arr.find(x => String(x.id) === String(eventId)) : null;
    if (!ev) return null;
    return { sweeper, dateKey: idx.dateKey, event: ev };
  } catch (e) {
    console.error("EventIndex lookup error:", e);
    return null;
  }
}

app.put("/alarm-events/:id/open", async (req, res) => {
  try {
    const eventId = req.params.id;
    const openedTimestampMs = req.body.openedTimestampMs ? Number(req.body.openedTimestampMs) : Date.now();

    // 1) Try old collection by _id or id field
    let ae = null;
    try {
      ae = await AlarmEvent.findOne({ $or: [{ _id: eventId }, { id: eventId }] });
    } catch (_) {
      ae = null;
    }

    if (ae) {
      ae.opened = true;
      ae.openedTimestampMs = openedTimestampMs;
      if (ae.alarmTimestampMs) {
        ae.responseMs = (ae.openedTimestampMs || Date.now()) - (ae.alarmTimestampMs || 0);
      }
      await ae.save();
      return res.json({ success: true, event: ae });
    }

    // 2) Try embedded via EventIndex
    const found = await findEmbeddedEventById(eventId);
    if (found) {
      const s = await Sweeper.findById(found.sweeper._id);
      const arr = s.alarmEvents[found.dateKey];
      if (Array.isArray(arr)) {
        const idx = arr.findIndex(x => String(x.id) === String(eventId));
        if (idx !== -1) {
          s.alarmEvents[found.dateKey][idx].opened = true;
          s.alarmEvents[found.dateKey][idx].openedTimestampMs = openedTimestampMs;
          const alarmTs = s.alarmEvents[found.dateKey][idx].alarmTimestampMs;
          if (alarmTs) {
            s.alarmEvents[found.dateKey][idx].responseMs = openedTimestampMs - Number(alarmTs);
          }
          await s.save();
          return res.json({ success: true, event: s.alarmEvents[found.dateKey][idx] });
        }
      }
    }

    return res.status(404).json({ success: false, message: "Event not found" });
  } catch (err) {
    console.error("Error marking event open:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/alarm-events/:id/verify", async (req, res) => {
  try {
    const eventId = req.params.id;
    const verificationTimestampMs = req.body.verificationTimestampMs ? Number(req.body.verificationTimestampMs) : Date.now();
    const status = req.body.status ? String(req.body.status) : 'unknown';
    const location = req.body.location || null;

    // 1) Try old collection
    let ae = null;
    try {
      ae = await AlarmEvent.findOne({ $or: [{ _id: eventId }, { id: eventId }] });
    } catch (_) {
      ae = null;
    }

    if (ae) {
      ae.verificationTimestampMs = verificationTimestampMs;
      ae.verificationStatus = status;
      if (location && typeof location === 'object') {
        ae.location = {
          latitude: Number(location.latitude || null),
          longitude: Number(location.longitude || null)
        };
      }
      await ae.save();
      return res.json({ success: true, event: ae });
    }

    // 2) Try embedded via EventIndex
    const found = await findEmbeddedEventById(eventId);
    if (found) {
      const s = await Sweeper.findById(found.sweeper._id);
      const arr = s.alarmEvents[found.dateKey];
      if (Array.isArray(arr)) {
        const idx = arr.findIndex(x => String(x.id) === String(eventId));
        if (idx !== -1) {
          s.alarmEvents[found.dateKey][idx].verificationTimestampMs = verificationTimestampMs;
          s.alarmEvents[found.dateKey][idx].verificationStatus = status;
          if (location && typeof location === 'object') {
            s.alarmEvents[found.dateKey][idx].location = {
              latitude: Number(location.latitude || null),
              longitude: Number(location.longitude || null)
            };
          }
          await s.save();
          return res.json({ success: true, event: s.alarmEvents[found.dateKey][idx] });
        }
      }
    }

    return res.status(404).json({ success: false, message: "Event not found" });
  } catch (err) {
    console.error("Error recording verification:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  SAVE PARTITIONS (NEW)
//  PUT /sweepers/:id/partitions
//  Body: { dateKey?: string, partitions: [ { startMs: Number, endMs: Number } ] }
//  Stores partitions under sweeper.partitions[dateKey] = array
// =======================================================================
app.put("/sweepers/:id/partitions", async (req, res) => {
  try {
    const sweeperId = req.params.id;
    const { dateKey, partitions } = req.body;

    if (!Array.isArray(partitions) || partitions.length === 0) {
      return res.status(400).json({ success: false, message: "Partitions must be a non-empty array" });
    }

    const s = await Sweeper.findById(sweeperId);
    if (!s) return res.status(404).json({ success: false, message: "Sweeper not found" });

    // Determine date key if not provided (use first partition start)
    let key = dateKey;
    if (!key) {
      const firstStartMs = Number(partitions[0].startMs || Date.now());
      const d = new Date(firstStartMs);
      key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    }

    // Store with createdAt metadata per partition
    const stored = partitions.map(p => ({
      startMs: Number(p.startMs),
      endMs: Number(p.endMs),
      createdAt: new Date(),
    }));

    if (!s.partitions) s.partitions = {};
    s.partitions[key] = stored;

    await s.save();

    // Log to server console only (hidden from UI)
    console.log(`Saved partitions for sweeper=${sweeperId} date=${key} partitions=`, stored);

    // Optionally emit socket for server-side monitoring (not for UI)
    emitEvent("sweeper:partitions-saved", { sweeperId, dateKey: key });

    res.json({ success: true, dateKey: key });
  } catch (err) {
    console.error("Error saving partitions:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  NEW: GET partitions for sweeper/date
//  GET /sweepers/:id/partitions?dateKey=YYYY-MM-DD
//  If dateKey omitted, returns entire partitions object for sweeper
// =======================================================================
app.get("/sweepers/:id/partitions", async (req, res) => {
  try {
    const sweeperId = req.params.id;
    const dateKey = req.query.dateKey;

    const s = await Sweeper.findById(sweeperId).lean();
    if (!s) return res.status(404).json({ success: false, message: "Sweeper not found" });

    if (!s.partitions) return res.json({ success: true, partitions: {} });

    if (dateKey) {
      const partsForDate = s.partitions[dateKey] || [];
      return res.json({ success: true, dateKey, partitions: partsForDate });
    }

    // return all
    return res.json({ success: true, partitions: s.partitions });
  } catch (err) {
    console.error("Error fetching partitions:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  GEOFENCE ROUTES
// =======================================================================
app.post("/geofences", async (req, res) => {
  try {
    const gf = await new Geofence(req.body).save();
    res.json({ success: true, geofence: gf });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.get("/geofences", async (req, res) => {
  try {
    const data = await Geofence.find().lean();
    res.json({ success: true, geofences: data });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.get("/geofences/:id", async (req, res) => {
  try {
    const data = await Geofence.findById(req.params.id).lean();
    if (!data)
      return res.json({ success: false, message: "Geofence not found" });

    res.json({ success: true, geofence: data });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.delete("/geofences/:id", async (req, res) => {
  try {
    const gf = await Geofence.findByIdAndDelete(req.params.id);
    if (!gf)
      return res.json({ success: false, message: "Geofence not found" });

    res.json({ success: true, message: "Geofence deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================================================================
//  START SERVER
// =======================================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 SERVER + SOCKET.IO RUNNING ON http://0.0.0.0:${PORT}`)
);