const express = require("express");
const router = express.Router();

const {
    getCollege,
    saveCollege
} = require("../controllers/collegeController");

// GET
router.get("/", getCollege);

// POST (Save / Update)
router.post("/", saveCollege);

module.exports = router;