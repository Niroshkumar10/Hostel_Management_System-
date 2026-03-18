
const Room = require("../models/Room");

// ➕ ADD ROOM
exports.addRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity } = req.body;

    const room = new Room({ roomNumber, floor, capacity });
    await room.save();

    res.json({ message: "Room added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📥 GET ALL ROOMS
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✏️ UPDATE ROOM
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.roomNumber = roomNumber;
    room.floor = floor;
    room.capacity = capacity;

    // auto update status
    room.status = room.occupied >= room.capacity ? "Full" : "Available";

    await room.save();

    res.json({ message: "Room updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ DELETE ROOM
exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};