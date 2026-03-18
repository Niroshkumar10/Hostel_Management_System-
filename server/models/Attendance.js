const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["present", "absent"],
    required: true
  }

}, { timestamps: true });

// 🔥 Prevent duplicate attendance for same student + date
attendanceSchema.index({ student_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);