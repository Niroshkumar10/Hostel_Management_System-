const express = require("express");
const router = express.Router();

const {
  addComplaint,
  getComplaints,
  getStudentComplaints,
  updateStatus,
  deleteComplaint
} = require("../controllers/complaintController");

router.post("/", addComplaint);
router.get("/", getComplaints);
router.get("/student/:id", getStudentComplaints);
router.put("/:id", updateStatus);
router.delete("/:id", deleteComplaint);

module.exports = router;