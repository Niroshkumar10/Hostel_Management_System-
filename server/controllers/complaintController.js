const Complaint = require("../models/Complaint");

// ➕ ADD COMPLAINT
exports.addComplaint = async (req, res) => {
  try {
    const { student_id, student_name, title, description } = req.body;

    const complaint = new Complaint({
      student_id,
      student_name,
      title,
      description
    });

    await complaint.save();

    res.json({ message: "Complaint submitted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📥 GET ALL COMPLAINTS (Admin)
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📥 GET STUDENT COMPLAINTS
exports.getStudentComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      student_id: req.params.id
    }).sort({ createdAt: -1 });

    res.json(complaints);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔄 UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Complaint.findByIdAndUpdate(req.params.id, { status });

    res.json({ message: "Status updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ DELETE
exports.deleteComplaint = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};