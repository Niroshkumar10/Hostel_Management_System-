const form = document.getElementById("roomForm");

form.addEventListener("submit", async function(e){

e.preventDefault();

const room = {

room_number: document.getElementById("room_number").value,
floor: document.getElementById("floor").value,
capacity: document.getElementById("capacity").value

};

await fetch("http://localhost:5000/api/rooms/add",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(room)

});

showFlash("Room Added Successfully");

loadRooms();

form.reset();

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

const res=await fetch("http://localhost:5000/api/rooms");

const rooms=await res.json();

const table=document.getElementById("roomTable");

table.innerHTML="";

rooms.forEach(room=>{

let available = room.capacity - room.occupied;

let status = available === 0 
? `<span class="status-full">Full</span>`
: `<span class="status-available">${available} Beds</span>`;

table.innerHTML+=`

<tr>

<td>${room.room_id}</td>
<td>${room.room_number}</td>
<td>${room.floor}</td>
<td>${room.capacity}</td>
<td>${room.occupied}</td>
<td>${status}</td>

<td>

<button class="btn btn-danger btn-sm" onclick="deleteRoom(${room.room_id})">
Delete
</button>

</td>

</tr>

`;

});

}



async function deleteRoom(id){

if(confirm("Delete this room?")){

await fetch(`http://localhost:5000/api/rooms/delete/${id}`,{
method:"DELETE"
});

showFlash("Room Deleted");

loadRooms();

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