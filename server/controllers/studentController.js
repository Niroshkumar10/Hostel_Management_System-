const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const Student = require("../models/studentModel");
const Room = require("../models/Room");

// ADD STUDENT
exports.addStudent = async (req, res) => {
  try {
    const { name, registerNumber, email, phone, department, year, dob, room_id } = req.body;

    // check duplicate
    const existing = await Student.findOne({ registerNumber });
    if (existing) {
      return res.status(400).json({ message: "Register number exists" });
    }

    let assignedRoom = null;

    // ROOM ASSIGN
    if (room_id) {
      const room = await Room.findById(room_id);

      if (!room) return res.status(404).json({ message: "Room not found" });

      if (room.occupied >= room.capacity) {
        return res.status(400).json({ message: "Room full" });
      }

      room.occupied += 1;
      await room.save();

      assignedRoom = room._id;
    }

    const student = new Student({
      name,
      registerNumber,
      email,
      phone,
      department,
      year,
      dob,
      room_id: assignedRoom
    });

    await student.save();

    res.json({ message: "Student added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ALL STUDENTS
// exports.getStudents = async (req, res) => {
//   try {
//     const db = getDB();

//     const students = await db.collection("students")
//       .find()
//       .sort({ createdAt: -1 })
//       .toArray();

//     res.json(students);

//   } catch (err) {
//     res.status(500).json({ message: "Error fetching students" });
//   }
// };
exports.getStudents = async (req, res) => {
  const students = await Student.find().populate("room_id");
  res.json(students);
};


// ✅ GET SINGLE STUDENT
exports.getStudentById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const student = await db.collection("students")
      .findOne({ _id: new ObjectId(id) });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);

  } catch (err) {
    res.status(500).json({ message: "Error fetching student" });
  }
};



// ✅ UPDATE STUDENT
exports.updateStudent = async (req, res) => {
  try {
    const { room_id } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const oldRoomId = student.room_id?.toString();
    const newRoomId = room_id;

    // ROOM CHANGE
    if (oldRoomId !== newRoomId) {

      // REMOVE FROM OLD ROOM
      if (oldRoomId) {
        await Room.findByIdAndUpdate(oldRoomId, {
          $inc: { occupied: -1 }
        });
      }

      // ADD TO NEW ROOM
      if (newRoomId) {
        const newRoom = await Room.findById(newRoomId);

        if (!newRoom) return res.status(404).json({ message: "Room not found" });

        if (newRoom.occupied >= newRoom.capacity) {
          return res.status(400).json({ message: "Room full" });
        }

        await Room.findByIdAndUpdate(newRoomId, {
          $inc: { occupied: 1 }
        });
      }
    }

    await Student.findByIdAndUpdate(req.params.id, req.body);

    res.json({ message: "Student updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ DELETE STUDENT
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) return res.status(404).json({ message: "Student not found" });

    // reduce room count
    if (student.room_id) {
      await Room.findByIdAndUpdate(student.room_id, {
        $inc: { occupied: -1 }
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: "Student deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};