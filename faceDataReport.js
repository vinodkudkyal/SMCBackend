// const mongoose = require("mongoose");
// const ExcelJS = require("exceljs");

// // ===============================
// // MongoDB URI
// // ===============================
// const MONGO_URI =
//   "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// // ===============================
// // Schemas (force collections)
// // ===============================
// const sweeperSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: String,
//   },
//   { collection: "sweepers" }
// );

// const faceDataSchema = new mongoose.Schema(
//   {
//     sweeperId: mongoose.Schema.Types.ObjectId,
//     faceData: String,
//   },
//   { collection: "facedatas" }
// );

// const Sweeper = mongoose.model("Sweeper", sweeperSchema);
// const FaceData = mongoose.model("FaceData", faceDataSchema);

// // ===============================
// // Main Logic
// // ===============================
// async function run() {
//   try {
//     console.log("⏳ Connecting to MongoDB...");
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ MongoDB Connected\n");

//     // Get all sweepers
//     const sweepers = await Sweeper.find({}, { name: 1, email: 1 }).lean();

//     // Get all face data
//     const faceRecords = await FaceData.find({}, { sweeperId: 1 }).lean();
//     const faceSet = new Set(faceRecords.map(f => String(f.sweeperId)));

//     const withFace = [];
//     const withoutFace = [];

//     for (const s of sweepers) {
//       if (faceSet.has(String(s._id))) {
//         withFace.push(s);
//       } else {
//         withoutFace.push(s);
//       }
//     }

//     // ===============================
//     // Terminal Output
//     // ===============================
//     console.log("📋 USERS WITH FACE DATA:");
//     withFace.forEach((u, i) =>
//       console.log(`${i + 1}. ${u.name} | ${u.email}`)
//     );

//     console.log(`\n✅ Count (With Face Data): ${withFace.length}\n`);

//     console.log("📋 USERS WITHOUT FACE DATA:");
//     withoutFace.forEach((u, i) =>
//       console.log(`${i + 1}. ${u.name} | ${u.email}`)
//     );

//     console.log(`\n✅ Count (Without Face Data): ${withoutFace.length}\n`);

//     // ===============================
//     // Excel Export
//     // ===============================
//     const workbook = new ExcelJS.Workbook();

//     const sheetWith = workbook.addWorksheet("With_Face_Data");
//     const sheetWithout = workbook.addWorksheet("Without_Face_Data");

//     sheetWith.columns = [
//       { header: "Name", key: "name", width: 30 },
//       { header: "Email", key: "email", width: 30 },
//     ];

//     sheetWithout.columns = [
//       { header: "Name", key: "name", width: 30 },
//       { header: "Email", key: "email", width: 30 },
//     ];

//     withFace.forEach(u => sheetWith.addRow(u));
//     withoutFace.forEach(u => sheetWithout.addRow(u));

//     await workbook.xlsx.writeFile("face_data_report.xlsx");

//     console.log("📁 Excel file generated: face_data_report.xlsx");
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
const ExcelJS = require("exceljs");

// ===============================
// MongoDB URI
// ===============================
const MONGO_URI =
  "mongodb+srv://nagarshuddhismc_db_user:KU0RkVNSLcm23rkc@cluster0.7h8qa0n.mongodb.net/nagarshuddhi?retryWrites=true&w=majority&appName=Cluster0";

// ===============================
// Schemas (force correct collections)
// ===============================
const sweeperSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
  },
  { collection: "sweepers" }
);

const faceDataSchema = new mongoose.Schema(
  {
    sweeperId: mongoose.Schema.Types.ObjectId,
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

    // Fetch all sweepers
    const sweepers = await Sweeper.find(
      {},
      { name: 1, email: 1, password: 1 }
    ).lean();

    // Fetch all face data
    const faceRecords = await FaceData.find(
      {},
      { sweeperId: 1 }
    ).lean();

    const faceSet = new Set(faceRecords.map(f => String(f.sweeperId)));

    const withFace = [];
    const withoutFace = [];

    for (const s of sweepers) {
      if (faceSet.has(String(s._id))) {
        withFace.push(s);
      } else {
        withoutFace.push(s);
      }
    }

    // ===============================
    // Terminal Output
    // ===============================
    console.log("📋 USERS WITH FACE DATA:\n");
    withFace.forEach((u, i) => {
      console.log(
        `${i + 1}. Name: ${u.name} | Email: ${u.email} | Password: ${u.password}`
      );
    });
    console.log(`\n✅ Count (With Face Data): ${withFace.length}\n`);

    console.log("📋 USERS WITHOUT FACE DATA:\n");
    withoutFace.forEach((u, i) => {
      console.log(
        `${i + 1}. Name: ${u.name} | Email: ${u.email} | Password: ${u.password}`
      );
    });
    console.log(`\n✅ Count (Without Face Data): ${withoutFace.length}\n`);

    // ===============================
    // Excel Export
    // ===============================
    const workbook = new ExcelJS.Workbook();

    const sheetWith = workbook.addWorksheet("With_Face_Data");
    const sheetWithout = workbook.addWorksheet("Without_Face_Data");

    const columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Password", key: "password", width: 25 },
    ];

    sheetWith.columns = columns;
    sheetWithout.columns = columns;

    withFace.forEach(u =>
      sheetWith.addRow({
        name: u.name,
        email: u.email,
        password: u.password,
      })
    );

    withoutFace.forEach(u =>
      sheetWithout.addRow({
        name: u.name,
        email: u.email,
        password: u.password,
      })
    );

    await workbook.xlsx.writeFile("face_data_report_with_passwords.xlsx");

    console.log("📁 Excel file generated: face_data_report_with_passwords.xlsx");
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
