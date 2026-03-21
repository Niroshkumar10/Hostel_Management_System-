const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/login", adminController.loginAdmin);
router.post("/create", adminController.createAdmin); // ✅ NEW
module.exports = router;