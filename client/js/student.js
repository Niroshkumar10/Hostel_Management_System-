const form = document.getElementById("studentForm");

form.addEventListener("submit", async (e) => {

e.preventDefault();

const data = {

name: document.getElementById("name").value,
email: document.getElementById("email").value,
phone: document.getElementById("phone").value,
department: document.getElementById("department").value,
year: document.getElementById("year").value,
room_id: document.getElementById("room_id").value,
password: document.getElementById("password").value

};

const response = await fetch("http://localhost:5000/api/students/add", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify(data)

});

const result = await response.json();

alert(result.message);

});