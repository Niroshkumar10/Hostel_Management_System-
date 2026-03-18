const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  student_name: String,

  title: {
    type: String,
    required: true
  },

  description: String,

  status: {
    type: String,
    enum: ["pending", "resolved"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);