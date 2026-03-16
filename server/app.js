const express = require("express");
const cors = require("cors");

require("./config/db");   // IMPORTANT

const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roomRoutes = require("./routes/roomRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/rooms",roomRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});