// models/College.js
const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  email: String
});

module.exports = mongoose.model("College", collegeSchema);