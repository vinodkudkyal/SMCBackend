
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
});
const Sweeper = mongoose.model("Sweeper", sweeperSchema);

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
  note: String,
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

// app.post("/sweepers", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const exists = await Sweeper.findOne({ email });
//     if (exists)
//       return res.json({
//         success: false,
//         message: "Email already exists",
//       });

//     const sweeper = await new Sweeper({ name, email, password }).save();
//     emitEvent("sweeper:added", { sweeper });

//     res.json({ success: true, sweeper });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
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
app.post("/alarm-events", async (req, res) => {
  try {
    const { sweeperId, alarmTimestampMs, location } = req.body;

    const s = await Sweeper.findById(sweeperId);
    if (!s)
      return res.json({ success: false, message: "Sweeper not found" });

    const dateKey = yyyymmddFromMs(alarmTimestampMs);
    const id = new mongoose.Types.ObjectId().toString();

    const evt = {
      id,
      alarmTimestampMs,
      opened: false,
      openedTimestampMs: null,
      responseMs: null,
      verificationTimestampMs: null,
      verificationStatus: null,
      location: location || null,
    };

    if (!s.alarmEvents[dateKey]) s.alarmEvents[dateKey] = [];
    s.alarmEvents[dateKey].push(evt);

    await s.save();

    res.json({ success: true, event: evt, dateKey });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

/**
 * BACKWARD COMPATIBLE ALARM EVENTS ENDPOINT
 * React UI expects: GET /sweepers/:id/alarmevents
 */
app.get("/sweepers/:id/alarmevents", async (req, res) => {
  try {
    const sweeperId = req.params.id;
    const { from, to } = req.query;

    let fromMs = from ? Number(from) : null;
    let toMs = to ? Number(to) : null;

    // -------------------------
    // 1️⃣ FETCH OLD AlarmEvent COLLECTION
    // -------------------------
    const oldEvents = await AlarmEvent.find({ sweeperId })
      .lean()
      .catch(() => []);

    // Apply time filtering
    const filteredOld = oldEvents.filter(ev => {
      const t = Number(ev.alarmTimestampMs || 0);
      if (fromMs && t < fromMs) return false;
      if (toMs && t > toMs) return false;
      return true;
    });

    // -------------------------
    // 2️⃣ FETCH NEW EMBEDDED EVENTS FROM SWEEPER DOCUMENT
    // -------------------------
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
            _id: ev.id,   // so React table can use key
            sweeperId
          });
        });
      }
    }

    // -------------------------
    // 3️⃣ MERGE BOTH SYSTEMS
    // -------------------------
    const merged = [...filteredOld, ...embeddedEvents];

    // Sort latest first
    merged.sort((a, b) => (b.alarmTimestampMs || 0) - (a.alarmTimestampMs || 0));

    return res.json(merged);

  } catch (err) {
    console.error("Error fetching merged alarm events:", err);
    return res.status(500).json({ error: err.message });
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
    res.json({ success: false, message: err.message });
  }
});

// =======================================================================
//  START SERVER
// =======================================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 SERVER + SOCKET.IO RUNNING ON http://0.0.0.0:${PORT}`)
);
