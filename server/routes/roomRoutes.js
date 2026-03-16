const express = require("express");

const router = express.Router();

const roomController = require("../controllers/roomController");

router.post("/add",roomController.addRoom);

router.get("/",roomController.getRooms);

router.delete("/delete/:id",roomController.deleteRoom);

module.exports = router;