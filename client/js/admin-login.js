// SWITCH FORMS

function showAdmin(){

document.getElementById("adminForm").style.display="block";
document.getElementById("studentForm").style.display="none";

}

function showStudent(){

document.getElementById("adminForm").style.display="none";
document.getElementById("studentForm").style.display="block";

}



// ADMIN LOGIN

const adminForm = document.getElementById("adminForm");

adminForm.addEventListener("submit", async function(e){

e.preventDefault();

const email = document.getElementById("adminEmail").value;
const password = document.getElementById("adminPassword").value;

const response = await fetch("http://localhost:5000/api/admin/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({email,password})

});

const data = await response.json();

if(data.success){

localStorage.setItem("adminLoggedIn","true");

window.location.href="admin-dashboard.html";

}else{

alert(data.message);

}

});



// STUDENT LOGIN

document.getElementById('studentForm').addEventListener('submit', async function(e){

e.preventDefault();

const email = document.getElementById('studentEmail').value;
const password = document.getElementById('studentPassword').value;

const response = await fetch("http://localhost:5000/api/student/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
email: email,
password: password
})
});

const data = await response.json();

if(data.success){

localStorage.setItem("studentLoggedIn","true");

// SAVE STUDENT DATA
localStorage.setItem("student", JSON.stringify(data.student));

window.location.href="student-dashboard.html";

}else{

alert("Invalid Login");

}

});