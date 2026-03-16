const db = require("../config/db");

// ---------------------- Add Room ----------------------
exports.addRoom = (req, res) => {
  const { room_number, capacity, floor_id } = req.body;

  if (!room_number || !capacity || !floor_id) {
    return res.status(400).json({ message: "Room number, capacity, and floor are required" });
  }

  const sql = "INSERT INTO rooms (room_number, capacity, floor_id) VALUES (?,?,?)";

  db.query(sql, [room_number, capacity, floor_id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Room added successfully",
      roomId: result.insertId
    });
  });
};

// ---------------------- Get All Rooms ----------------------
exports.getRooms = (req, res) => {
  const sql = "SELECT room_id, room_number, floor_id, capacity, occupied FROM rooms ORDER BY floor_id ASC, room_number ASC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
};

// ---------------------- Update Room ----------------------

exports.updateRoom = (req,res)=>{

const id = req.params.id;

const { room_number, capacity, floor_id } = req.body;

const sql = `
UPDATE rooms
SET room_number=?, capacity=?, floor_id=?
WHERE room_id=?
`;

db.query(sql,[room_number,capacity,floor_id,id],(err,result)=>{

if(err) return res.status(500).json(err);

res.json({message:"Room updated successfully"});

});

};

// ---------------------- Delete Room ----------------------
exports.deleteRoom = (req, res) => {
  const id = req.params.id;

  // Optional: Check if any students are assigned to this room
  const checkSql = "SELECT COUNT(*) as count FROM students WHERE room_id = ?";
  db.query(checkSql, [id], (err, rows) => {
    if (err) return res.status(500).json(err);

    if (rows[0].count > 0) {
      return res.status(400).json({ message: "Cannot delete room. Students are assigned to this room." });
    }

    const sql = "DELETE FROM rooms WHERE room_id=?";
    db.query(sql, [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      res.json({ message: "Room deleted successfully" });
    });
  });
};