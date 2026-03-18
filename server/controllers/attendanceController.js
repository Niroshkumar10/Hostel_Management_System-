const Attendance = require("../models/Attendance");

// ➕ MARK ATTENDANCE
exports.markAttendance = async (req, res) => {
  try {
    const { student_id, date, status } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      { student_id, date },
      { status },
      { upsert: true, new: true }
    );

    res.json({ message: "Attendance marked" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📥 GET ALL (ADMIN)
exports.getAttendance = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate("student_id")
      .sort({ date: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📥 GET BY STUDENT
exports.getStudentAttendance = async (req, res) => {
  try {
    const data = await Attendance.find({
      student_id: req.params.id
    }).sort({ date: -1 });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ UPDATE ATTENDANCE
exports.updateAttendance = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json({ message: "Attendance updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ DELETE ATTENDANCE
exports.deleteAttendance = async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: "Attendance deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};