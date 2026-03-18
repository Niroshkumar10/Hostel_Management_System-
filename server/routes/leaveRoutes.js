const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getLeaves,
  getStudentLeaves,
  updateLeave,
  deleteLeave
} = require("../controllers/leaveController");

router.post("/", applyLeave);
router.get("/", getLeaves);
router.get("/student/:id", getStudentLeaves);
router.put("/:id", updateLeave);
router.delete("/:id", deleteLeave);

module.exports = router;