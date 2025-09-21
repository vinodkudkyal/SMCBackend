const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Replace with your own MongoDB Atlas connection string
mongoose.connect("mongodb+srv://adarshanna69_db_user:nvr53vg7ZicinMRc@cluster0.obkoytt.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ---------------- User Schema ----------------
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  name: String,
});
const User = mongoose.model("User", userSchema);

// ---------------- Sweeper Schema ----------------
const sweeperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  geofence: { type: Array, default: [] },
  checkpoints: { type: Array, default: [] },
});
const Sweeper = mongoose.model("Sweeper", sweeperSchema);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check admin user first
    let user = await User.findOne({ email, password });
    if (user) {
      return res.json({ success: true, role: user.role, name: user.name, id: user._id });
    }

    // Check sweeper user
    let sweeper = await Sweeper.findOne({ email, password });
    if (sweeper) {
      return res.json({ success: true, role: "sweeper", name: sweeper.name, id: sweeper._id });
    }

    return res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/sweepers", async (req, res) => {
  try {
    const sweepers = await Sweeper.find().lean(); // 👈 keep raw _id
    res.json({ success: true, sweepers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete sweeper
app.delete("/sweepers/:id", async (req, res) => {
  try {
    const sweeper = await Sweeper.findByIdAndDelete(req.params.id);
    if (!sweeper) {
      return res.status(404).json({ success: false, message: "Sweeper not found" });
    }
    res.json({ success: true, message: "Sweeper deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Add sweeper
app.post("/sweepers", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await Sweeper.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    const sweeper = new Sweeper({
      name,
      email,
      password, // ⚠️ In production, hash this with bcrypt
      geofence: [],
      checkpoints: [],
    });
    await sweeper.save();
    res.json({ success: true, sweeper });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get sweeper assignment (geofence + checkpoints)
app.get("/sweepers/:id/assignment", async (req, res) => {
  try {
    const sweeper = await Sweeper.findById(req.params.id).lean();
    if (!sweeper) {
      return res.status(404).json({ success: false, message: "Sweeper not found" });
    }
    res.json({
      success: true,
      geofence: sweeper.geofence || [],
      checkpoints: sweeper.checkpoints || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update sweeper geofence & checkpoints
app.put("/sweepers/:id/assignment", async (req, res) => {
  const { geofence, checkpoints } = req.body;
  try {
    const sweeper = await Sweeper.findByIdAndUpdate(
      req.params.id,
      { geofence, checkpoints },
      { new: true }
    );
    if (!sweeper) {
      return res.status(404).json({ success: false, message: "Sweeper not found" });
    }
    res.json({ success: true, sweeper });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ---------------- Server ----------------
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on http://localhost:${PORT}`));
