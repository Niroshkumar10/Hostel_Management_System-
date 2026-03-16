
// Add student with automatic room assignment
const db = require("../config/db");

exports.addStudent = (req, res) => {

  const { name, email, phone, department, year, password, room_id } = req.body;

  // Step 1: Check room capacity
  const checkRoomSql = "SELECT capacity, occupied FROM rooms WHERE room_id = ?";

  db.query(checkRoomSql, [room_id], (err, rooms) => {

    if (err) return res.status(500).json(err);

    if (rooms.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const room = rooms[0];

    // Step 2: Check if room is full
    if (room.occupied >= room.capacity) {
      return res.status(400).json({
        message: "Room is already full. Please select another room."
      });
    }

    // Step 3: Insert student
    const insertSql = `
    INSERT INTO students (name,email,phone,department,year,room_id,password)
    VALUES (?,?,?,?,?,?,?)`;

    db.query(insertSql,
      [name, email, phone, department, year, room_id, password],
      (err2, result) => {

        if (err2) return res.status(500).json(err2);

        // Step 4: Increase occupied count
        const updateRoomSql =
          "UPDATE rooms SET occupied = occupied + 1 WHERE room_id = ?";

        db.query(updateRoomSql, [room_id], (err3) => {

          if (err3) return res.status(500).json(err3);

          res.json({
            message: "Student added successfully"
          });

        });

      });

  });

};

// Get all students
exports.getStudents = (req, res) => {
  const sql = `
    SELECT s.*, r.room_number, r.floor_id
    FROM students s
    LEFT JOIN rooms r ON s.room_id = r.room_id
    ORDER BY s.student_id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

// Delete student and update room occupancy
exports.deleteStudent = (req, res) => {
  const id = req.params.id;

  // Step 1: Get student to know their room_id
  const getStudentSql = "SELECT room_id FROM students WHERE student_id = ?";
  db.query(getStudentSql, [id], (err, students) => {
    if(err) return res.status(500).json(err);

    if(students.length === 0){
      return res.status(404).json({ message: "Student not found" });
    }

    const roomId = students[0].room_id;

    // Step 2: Delete the student
    const deleteSql = "DELETE FROM students WHERE student_id = ?";
    db.query(deleteSql, [id], (err2) => {
      if(err2) return res.status(500).json(err2);

      // Step 3: Decrease the room's occupied count
      if(roomId){
        const updateRoomSql = "UPDATE rooms SET occupied = occupied - 1 WHERE room_id = ?";
        db.query(updateRoomSql, [roomId], (err3) => {
          if(err3) return res.status(500).json(err3);

          res.json({ message: "Student deleted and room freed successfully" });
        });
      } else {
        res.json({ message: "Student deleted successfully" });
      }
    });
  });
};

// Student login
exports.loginStudent = (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM students WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0)
      return res.json({ success: false, message: "Student not found" });

    const student = result[0];
    if (student.password !== password)
      return res.json({ success: false, message: "Incorrect password" });

    res.json({ success: true, message: "Login successful", student });
  });
};