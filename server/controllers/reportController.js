const Student = require("../models/studentModel");
const Room = require("../models/Room");
const Attendance = require("../models/Attendance");
const Complaint = require("../models/Complaint");
const Leave = require("../models/Leave");

exports.getReport = async (req, res) => {
  try {

    const totalStudents = await Student.countDocuments();
    const totalRooms = await Room.countDocuments();

    const rooms = await Room.find();

    let totalBeds = 0;
    let occupiedBeds = 0;

    rooms.forEach(r => {
      totalBeds += r.capacity;
      occupiedBeds += r.occupied;
    });

    const availableBeds = totalBeds - occupiedBeds;

    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: "pending" });

    const totalLeaves = await Leave.countDocuments();
    const approvedLeaves = await Leave.countDocuments({ status: "approved" });

    const attendance = await Attendance.find();

    let present = attendance.filter(a => a.status === "present").length;
    let total = attendance.length;

    const attendancePercentage = total === 0 ? 0 : ((present / total) * 100).toFixed(1);

    res.json({
      totalStudents,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      totalComplaints,
      pendingComplaints,
      totalLeaves,
      approvedLeaves,
      attendancePercentage
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};