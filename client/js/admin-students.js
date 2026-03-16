let studentList = [];

// ---------------------- Add Student ----------------------
const form = document.getElementById("studentForm");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const student = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    department: document.getElementById("department").value,
    year: document.getElementById("year").value,
    password: document.getElementById("password").value
    // room_id is removed because backend auto-assigns
  };

  try {
    await fetch("http://localhost:5000/api/students/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });

    showFlash("Student added and room assigned successfully");
    form.reset();
    loadStudents();
  } catch (err) {
    console.error(err);
    showFlash("Error adding student", "danger");
  }
});

// ---------------------- Load Students ----------------------
async function loadStudents() {
  try {
    const response = await fetch("http://localhost:5000/api/students");
    studentList = await response.json();

    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    studentList.forEach(student => {
     table.innerHTML += `
<tr>
  <td>${student.student_id}</td>
  <td>${student.name}</td>
  <td>${student.email}</td>
  <td>${student.department}</td>
  <td>${student.room_number ? `Room ${student.room_number} (Floor ${student.floor_id})` : "Not Assigned"}</td>
  <td>
    <button class="btn btn-info btn-sm" onclick="viewStudent(${student.student_id})">View</button>
    <button class="btn btn-warning btn-sm" onclick="editStudent(${student.student_id})">Edit</button>
    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${student.student_id})">Delete</button>
  </td>
</tr>
`;
    });
  } catch (err) {
    console.error(err);
  }
}

// ---------------------- Delete Student ----------------------
let deleteStudentId = null;

function openDeleteModal(id) {
  deleteStudentId = id;
  new bootstrap.Modal(document.getElementById("deleteModal")).show();
}

async function confirmDelete() {
  try {
    await fetch(`http://localhost:5000/api/students/delete/${deleteStudentId}`, { method: "DELETE" });
    showFlash("Student deleted and room freed", "danger");
    loadStudents();
    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
  } catch (err) {
    console.error(err);
  }
}

// ---------------------- View Student ----------------------
function viewStudent(id) {
  const student = studentList.find(s => s.student_id == id);
  if (!student) return;

  document.getElementById("viewId").innerText = student.student_id;
  document.getElementById("viewName").innerText = student.name;
  document.getElementById("viewEmail").innerText = student.email;
  document.getElementById("viewPhone").innerText = student.phone;
  document.getElementById("viewDept").innerText = student.department;
  document.getElementById("viewRoom").innerText = student.room_number ? `Room ${student.room_number} (Floor ${student.floor_id})` : "Not Assigned";

  new bootstrap.Modal(document.getElementById("viewModal")).show();
}

// ---------------------- Edit Student ----------------------
function editStudent(id) {
  const student = studentList.find(s => s.student_id == id);
  if (!student) return;

  document.getElementById("name").value = student.name;
  document.getElementById("email").value = student.email;
  document.getElementById("phone").value = student.phone;
  document.getElementById("department").value = student.department;
  document.getElementById("year").value = student.year;
  document.getElementById("password").value = student.password;

  // Room should not be editable manually to prevent occupancy issues
  // document.getElementById("room_id").value = student.room_id || "";
}

// ---------------------- Search Student ----------------------
function searchStudent() {
  const input = document.getElementById("searchStudent").value.toLowerCase();
  const rows = document.querySelectorAll("#studentTable tr");

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(input) ? "" : "none";
  });
}

// ---------------------- Load Rooms for Dropdown (Optional) ----------------------
async function loadRooms() {
  try {
    const res = await fetch("http://localhost:5000/api/rooms");
    const rooms = await res.json();

    const select = document.getElementById("room_id");
    select.innerHTML = "<option value=''>Select Room (Optional)</option>";

    rooms.forEach(room => {
      select.innerHTML += `<option value="${room.room_id}">Room ${room.room_number} (Floor ${room.floor_id})</option>`;
    });
  } catch (err) {
    console.error(err);
  }
}

// ---------------------- Flash Message ----------------------
function showFlash(message, type = "success") {
  const flash = document.getElementById("flashMessage");
  flash.className = `alert alert-${type} position-fixed top-0 end-0 m-4 shadow`;
  document.getElementById("flashText").innerText = message;
  flash.classList.remove("d-none");

  setTimeout(() => {
    flash.classList.add("d-none");
  }, 3000);
}

// ---------------------- Initialize ----------------------
window.onload = function() {
  loadStudents();
  loadRooms();
};