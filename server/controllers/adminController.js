const db = require("../config/db");

exports.loginAdmin = (req, res) => {

    const { email, password } = req.body;
const sql = "SELECT * FROM admin WHERE email = ?";

db.query(sql, [email], (err, result) => {

if(result.length === 0){
 return res.json({success:false,message:"Admin not found"});
}

if(result[0].password !== password){
 return res.json({success:false,message:"Incorrect password"});
}

res.json({success:true,message:"Login successful"});

});
};