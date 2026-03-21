// const express = require("express");
// const router = express.Router();

// const studentController = require("../controllers/studentController");
// router.post("/login", studentController.loginStudent);

// router.post("/", studentController.addStudent);
// router.get("/", studentController.getStudents);
// router.get("/:id", studentController.getStudentById);
// router.put("/:id", studentController.updateStudent);
// router.delete("/:id", studentController.deleteStudent);
// router.get("/roommates/:roomId", getRoommates);
// module.exports = router;

const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");

// LOGIN
router.post("/login", studentController.loginStudent);

// CRUD
router.post("/", studentController.addStudent);
router.get("/", studentController.getStudents);

// ⚠️ IMPORTANT: put this BEFORE "/:id"
router.get("/roommates/:roomId", studentController.getRoommates);

router.get("/:id", studentController.getStudentById);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;