const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

router.post("/", markAttendance);
router.get("/", getAttendance);
router.get("/student/:id", getStudentAttendance);

router.put("/:id", updateAttendance);     // ✅ ADD
router.delete("/:id", deleteAttendance);  // ✅ ADD

module.exports = router;