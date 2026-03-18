const { getDB } = require("../config/db");

// Admin login
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Hardcoded admin credentials (you can move this to database later)
    if (username === "admin" && password === "admin123") {
      res.json({ 
        success: true, 
        message: "Login successful" 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ message: "Internal server error" });
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