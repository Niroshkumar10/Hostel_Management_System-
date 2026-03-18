const Leave = require("../models/Leave");

// ➕ APPLY LEAVE
exports.applyLeave = async (req, res) => {
  try {
    const leave = new Leave(req.body);
    await leave.save();

    res.status(201).json({ message: "Leave applied" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📥 GET ALL (ADMIN)
exports.getLeaves = async (req, res) => {
  const data = await Leave.find().sort({ createdAt: -1 });
  res.json(data);
};


// 📥 GET BY STUDENT
exports.getStudentLeaves = async (req, res) => {
  const data = await Leave.find({
    student_id: req.params.id
  }).sort({ createdAt: -1 });

  res.json(data);
};


// ✏️ UPDATE STATUS (ADMIN)
exports.updateLeave = async (req, res) => {
  try {
    const { status } = req.body;

    await Leave.findByIdAndUpdate(req.params.id, { status });

    res.json({ message: "Leave updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ DELETE (optional)
exports.deleteLeave = async (req, res) => {
  await Leave.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};