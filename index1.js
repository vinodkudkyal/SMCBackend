const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // body-parser

// ---------------- MONGOOSE CONNECTION ----------------
const MONGO_URI = "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------------- SCHEMAS & MODELS ----------------

// User schema (admins)
const userSchema = new mongoose.Schema({
  email: String,
  password: String, // ⚠️ Hash in production
  role: String,
  name: String,
});
const User = mongoose.model("User", userSchema);

// Sweeper schema
const sweeperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  geofence: { type: Array, default: [] },
  checkpoints: { type: Array, default: [] },
  dutyTime: {
    start: { type: String, default: null },
    end: { type: String, default: null },
  },
});
const Sweeper = mongoose.model("Sweeper", sweeperSchema);

// Face data schema
const faceDataSchema = new mongoose.Schema({
  sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
  name: { type: String, required: true },
  faceData: { type: String, required: true }, // JSON embeddings
  createdAt: { type: Date, default: Date.now },
});
const FaceData = mongoose.model("FaceData", faceDataSchema);

// Attendance schema
const attendanceSchema = new mongoose.Schema({
  sweeperId: { type: mongoose.Schema.Types.ObjectId, ref: "Sweeper", required: true },
  date: { type: Date, required: true },
  location: {
    latitude: Number,
    longitude: Number,
  },
  createdAt: { type: Date, default: Date.now },
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

// ✅ NEW: Geofence schema
const geofenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  zone: { type: String, default: "" },
  landmark: { type: String, default: "" },
  geofence: { type: Array, default: [] }, // polygon points [{lat,lng}]
  checkpoints: { type: Array, default: [] }, // [{lat,lng}]
  createdAt: { type: Date, default: Date.now },
});
const Geofence = mongoose.model("Geofence", geofenceSchema);

// ---------------- ROUTES ----------------

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "Sweeper Tracker API running" });
});

// LOGIN (Admin + Sweeper)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email, password }).lean();
    if (user) return res.json({ success: true, role: user.role, name: user.name, id: user._id });

    let sweeper = await Sweeper.findOne({ email, password }).lean();
    if (sweeper) return res.json({ success: true, role: "sweeper", name: sweeper.name, id: sweeper._id });

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- SWEEPER ROUTES ----------------

// GET ALL SWEEPERS
app.get("/sweepers", async (req, res) => {
  try {
    const sweepers = await Sweeper.find().lean();
    return res.json({ success: true, sweepers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ADD SWEEPER
app.post("/sweepers", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Sweeper.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

    const sweeper = new Sweeper({ name, email, password });
    await sweeper.save();
    return res.json({ success: true, sweeper });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE SWEEPER
app.delete("/sweepers/:id", async (req, res) => {
  try {
    const sweeper = await Sweeper.findByIdAndDelete(req.params.id);
    if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

    await FaceData.deleteOne({ sweeperId: req.params.id });
    await Attendance.deleteMany({ sweeperId: req.params.id });
    return res.json({ success: true, message: "Sweeper deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET ASSIGNMENT
app.get("/sweepers/:id/assignment", async (req, res) => {
  try {
    const sweeper = await Sweeper.findById(req.params.id).lean();
    if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

    return res.json({ success: true, geofence: sweeper.geofence || [], checkpoints: sweeper.checkpoints || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE ASSIGNMENT
app.put("/sweepers/:id/assignment", async (req, res) => {
  const { geofence, checkpoints } = req.body;
  try {
    const sweeper = await Sweeper.findByIdAndUpdate(
      req.params.id,
      { geofence: geofence || [], checkpoints: checkpoints || [] },
      { new: true, runValidators: true }
    ).lean();

    if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });
    return res.json({ success: true, sweeper });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE DUTY TIME
app.put("/sweepers/:id/duty-time", async (req, res) => {
  const { start, end } = req.body;
  try {
    const sweeper = await Sweeper.findByIdAndUpdate(
      req.params.id,
      { dutyTime: { start: start || null, end: end || null } },
      { new: true }
    ).lean();

    if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });
    return res.json({ success: true, dutyTime: sweeper.dutyTime });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- FACE DATA ----------------
app.get("/sweepers/facedata/:id", async (req, res) => {
  try {
    const faceData = await FaceData.findOne({ sweeperId: req.params.id }).lean();
    return res.json({
      success: true,
      hasFaceData: !!faceData,
      faceData: faceData ? faceData.faceData : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/sweepers/facedata/:id", async (req, res) => {
  const { name, faceData } = req.body;
  try {
    const sweeper = await Sweeper.findById(req.params.id);
    if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

    let existing = await FaceData.findOne({ sweeperId: req.params.id });
    if (existing) {
      existing.name = name || existing.name;
      existing.faceData = faceData;
      await existing.save();
      return res.json({ success: true, message: "Face data updated", faceData: existing });
    } else {
      const fd = new FaceData({ sweeperId: req.params.id, name, faceData });
      await fd.save();
      return res.json({ success: true, message: "Face data saved", faceData: fd });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- ATTENDANCE ----------------
app.post("/sweepers/attendance", async (req, res) => {
  const { sweeperId, date, location } = req.body;
  try {
    const sweeper = await Sweeper.findById(sweeperId);
    if (!sweeper) return res.status(404).json({ success: false, message: "Sweeper not found" });

    const providedDate = date ? new Date(date) : new Date();
    const dayStart = new Date(providedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const existing = await Attendance.findOne({
      sweeperId,
      date: { $gte: dayStart, $lt: dayEnd },
    }).lean();

    if (existing) return res.json({ success: true, message: "Attendance already marked", attendance: existing });

    const attendance = new Attendance({ sweeperId, date: providedDate, location: location || {} });
    await attendance.save();
    return res.json({ success: true, attendance });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/sweepers/:id/attendance", async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = { sweeperId: req.params.id };

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const attendanceHistory = await Attendance.find(query).sort({ date: -1 }).lean();
    return res.json({ success: true, attendanceHistory });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- GEOFENCE ROUTES ----------------

// CREATE geofence
app.post("/geofences", async (req, res) => {
  try {
    const gf = new Geofence(req.body);
    await gf.save();
    return res.json({ success: true, geofence: gf });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET all geofences
app.get("/geofences", async (req, res) => {
  try {
    const geofences = await Geofence.find().lean();
    return res.json({ success: true, geofences });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET single geofence
app.get("/geofences/:id", async (req, res) => {
  try {
    const gf = await Geofence.findById(req.params.id).lean();
    if (!gf) return res.status(404).json({ success: false, message: "Geofence not found" });
    return res.json({ success: true, geofence: gf });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- USERS (ADMINS) ----------------
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().lean();
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


// DELETE geofence
app.delete("/geofences/:id", async (req, res) => {
  try {
    const gf = await Geofence.findByIdAndDelete(req.params.id);
    if (!gf) return res.status(404).json({ success: false, message: "Geofence not found" });
    return res.json({ success: true, message: "Geofence deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on http://0.0.0.0:${PORT}`));
