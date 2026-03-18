const express = require("express");
const router = express.Router();

const {
  addRoom,
  getRooms,
  updateRoom,
  deleteRoom
} = require("../controllers/roomController");


// ➕ ADD ROOM
router.post("/", addRoom);

// 📥 GET ALL ROOMS
router.get("/", getRooms);

// ✏️ UPDATE ROOM
router.put("/:id", updateRoom);

// ❌ DELETE ROOM
router.delete("/:id", deleteRoom);


module.exports = router;