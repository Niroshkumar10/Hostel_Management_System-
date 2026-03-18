const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({

  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  student_name: String,

  from_date: {
    type: Date,
    required: true
  },

  to_date: {
    type: Date,
    required: true
  },

  reason: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);