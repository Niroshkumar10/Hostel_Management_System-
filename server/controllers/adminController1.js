const { getDB } = require("../config/db");


const Admin = require("../models/AdminModel");

// Admin login


// ✅ CREATE ADMIN
exports.createAdmin = async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      username,
      password,
      name,
      email
    });

    await admin.save();

    res.json({ message: "Admin created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ADMIN LOGIN (DB BASED)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username, password });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      admin
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create default admin (run once)
exports.createDefaultAdmin = async () => {
  const db = getDB();
  try {
    const existingAdmin = await db.collection("admins").findOne({ username: "admin" });
    if (!existingAdmin) {
      await db.collection("admins").insertOne({
        username: "admin",
        password: "admin123",
        name: "Administrator",
        email: "admin@hostel.com",
        role: "super_admin",
        createdAt: new Date()
      });
      console.log("Default admin created");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }
};