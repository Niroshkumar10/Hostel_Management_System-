const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");

router.post("/add", studentController.addStudent);
router.post("/login", studentController.loginStudent);

router.get("/", studentController.getStudents);
router.delete("/delete/:id", studentController.deleteStudent);

module.exports = router;