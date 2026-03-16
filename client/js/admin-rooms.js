let rooms = [];
let editRoomId = null;
document.addEventListener("DOMContentLoaded", function(){

const form = document.getElementById("roomForm");
form.addEventListener("submit", async function(e){

e.preventDefault();

const room = {

room_number: document.getElementById("room_number").value,
floor_id: document.getElementById("floor").value,
capacity: document.getElementById("capacity").value

};

try{

let url = "http://localhost:5000/api/rooms/add";
let method = "POST";

if(editRoomId){   // UPDATE MODE

url = `http://localhost:5000/api/rooms/update/${editRoomId}`;
method = "PUT";

}

const res = await fetch(url,{
method:method,
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(room)
});

const data = await res.json();

if(!res.ok){
showFlash(data.message);
return;
}

showFlash(editRoomId ? "Room Updated Successfully" : "Room Added Successfully");

loadRooms();

form.reset();

editRoomId = null;

document.querySelector("#roomForm button").innerText = "Add Room";

}catch(err){

console.error(err);
showFlash("Server Error");

}

});

loadRooms();

});

function showFlash(message){

const flash=document.getElementById("flashMessage");

document.getElementById("flashText").innerText=message;

flash.classList.remove("d-none");

setTimeout(()=>{
flash.classList.add("d-none");
},3000);

}


async function loadRooms(){

const res = await fetch("http://localhost:5000/api/rooms");

 rooms = await res.json();

const table = document.getElementById("roomTable");

table.innerHTML = "";

rooms.forEach((room, index)=>{

let available = room.capacity - room.occupied;

let status = available === 0 
? `<span class="status-full">Full</span>`
: `<span class="status-available">${available} Beds</span>`;

table.innerHTML += `

<tr>

<td>${index + 1}</td>
<td>${room.room_number}</td>
<td>${room.floor_id}</td>
<td>${room.capacity}</td>
<td>${room.occupied}</td>
<td>${status}</td>

<td>
<button class="btn btn-warning btn-sm"
onclick="editRoom(${room.room_id})">
Edit
</button>

<button class="btn btn-danger btn-sm" onclick="deleteRoom(${room.room_id})">
Delete
</button>

</td>

</tr>

`;

});

}


function editRoom(id){

const room = rooms.find(r => r.room_id === id);

document.getElementById("room_number").value = room.room_number;
document.getElementById("floor").value = room.floor_id;
document.getElementById("capacity").value = room.capacity;

editRoomId = id; // store editing id

document.querySelector("#roomForm button").innerText = "Update Room";

}

async function deleteRoom(id){

if(!confirm("Delete this room?")) return;

try{

const res = await fetch(`http://localhost:5000/api/rooms/delete/${id}`,{
method:"DELETE"
});

const data = await res.json();

if(!res.ok){
showFlash(data.message);
return;
}

showFlash("Room Deleted Successfully");

loadRooms();

}catch(err){

console.error(err);
showFlash("Server Error");

}

}

function searchRoom(){

const input=document.getElementById("searchRoom").value.toLowerCase();

const rows=document.querySelectorAll("#roomTable tr");

rows.forEach(row=>{

const text=row.innerText.toLowerCase();

row.style.display=text.includes(input)?"":"none";

});

}



loadRooms();