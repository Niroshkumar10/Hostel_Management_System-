

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registerNumber: { type: String, required: true, unique: true },
  email: String,
  phone: String,
  department: String,
  year: Number,
  dob: Date,

  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);