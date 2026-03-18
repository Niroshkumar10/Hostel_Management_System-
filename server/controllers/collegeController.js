const College = require("../models/College");

// 🔹 GET College Data
exports.getCollege = async (req, res) => {
    try {
        const college = await College.findOne();
        res.json(college);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔹 CREATE / UPDATE (Single Record)
exports.saveCollege = async (req, res) => {
    try {
        const updated = await College.findOneAndUpdate(
            {}, // only one record
            req.body,
            { new: true, upsert: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};