async function loadDashboard(){

try{

// ---------------- STUDENTS ----------------

const studentRes = await fetch("http://localhost:5000/api/students");
const students = await studentRes.json();

document.getElementById("totalStudents").innerText = students.length;


// ---------------- ROOMS ----------------

const roomRes = await fetch("http://localhost:5000/api/rooms");
const rooms = await roomRes.json();

document.getElementById("totalRooms").innerText = rooms.length;

let totalBeds = 0;
let occupiedBeds = 0;

rooms.forEach(room => {

totalBeds += room.capacity;
occupiedBeds += room.occupied;

});

const availableBeds = totalBeds - occupiedBeds;

document.getElementById("availableBeds").innerText = availableBeds;


// ---------------- RECENT STUDENTS ----------------

const studentTable = document.getElementById("recentStudents");

if(studentTable){

studentTable.innerHTML = "";

students.slice(-5).reverse().forEach((student,index)=>{

studentTable.innerHTML += `
<tr>
<td>${index+1}</td>
<td>${student.name}</td>
<td>${student.department}</td>
<td>${student.room_number ? "Room "+student.room_number : "Not Assigned"}</td>
</tr>
`;

});

}


// ---------------- ROOM OVERVIEW ----------------

const roomTable = document.getElementById("recentRooms");

if(roomTable){

roomTable.innerHTML = "";

rooms.slice(0,5).forEach(room=>{

let available = room.capacity - room.occupied;

let status = available === 0
? `<span style="color:red;font-weight:bold">Full</span>`
: `<span style="color:green">${available} Beds</span>`;

roomTable.innerHTML += `
<tr>
<td>${room.room_number}</td>
<td>${room.floor_id}</td>
<td>${status}</td>
</tr>
`;

});

}

}catch(err){

console.error("Dashboard Load Error:",err);

}

}

loadDashboard();