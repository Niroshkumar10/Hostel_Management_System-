const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoutes");
const roomRoutes = require("./routes/roomRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const reportRoutes = require("./routes/reportRoutes");
const collegeRoutes = require("./routes/collegeRoutes");

const adminRoutes = require("./routes/adminRoutes");


const app = express();

app.use(cors());
app.use(express.json());

// ✅ CONNECT DB FIRST
connectDB();

// ✅ ROUTES
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/college", collegeRoutes);
// ✅ ADMIN LOGIN

app.use("/api/admin", adminRoutes);

// ✅ START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});