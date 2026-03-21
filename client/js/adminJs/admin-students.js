let studentList = [];
let editingStudentId = null;

// ---------------------- Add/Update Student ----------------------
const form = document.getElementById("studentForm");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("name").value;
  const registerNumber = document.getElementById("registerNumber").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const department = document.getElementById("department").value;
const year = parseInt(document.getElementById("year").value);
  const dob = document.getElementById("dob").value;
  // const room_id = document.getElementById("room_id").value;

  // Validate required fields
  if (!name || !registerNumber || !email || !department || !year || !dob) {
    showFlash("Please fill in all required fields", "danger");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFlash("Please enter a valid email address", "danger");
    return;
  }

  // Validate phone if provided
  if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    showFlash("Please enter a valid 10-digit phone number", "danger");
    return;
  }

  const student = {
  name: document.getElementById("name").value,
  registerNumber: document.getElementById("registerNumber").value,
  email: document.getElementById("email").value,
  phone: document.getElementById("phone").value,
  department: document.getElementById("department").value,
  year: parseInt(document.getElementById("year").value),
  dob: document.getElementById("dob").value,
  room_id: document.getElementById("room_id").value || null
};

  console.log("Sending student data:", student);

  try {
let url = "http://localhost:5000/api/students";
    let method = "POST";
    
    if (editingStudentId) {
      url = `http://localhost:5000/api/students/${editingStudentId}`;
  method = "PUT";
      console.log("Updating student with ID:", editingStudentId);
    }

    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });

    const data = await res.json();
    console.log("Server response:", data);

    if (!res.ok) {
      showFlash(data.message || `Error ${method === "POST" ? "adding" : "updating"} student`, "danger");
      return;
    }

    showFlash(data.message || `Student ${method === "POST" ? "added" : "updated"} successfully!`, "success");
    
    resetForm();
    await loadStudents();
await loadRoomOptions(); // 🔥 important
    loadStats();

  } catch (err) {
    console.error("Fetch error:", err);
    showFlash("Server error - check console", "danger");
  }
});

// ---------------------- Load Students ----------------------
async function loadStudents() {
  try {
    const response = await fetch("http://localhost:5000/api/students");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    studentList = await response.json();
    console.log("Loaded students:", studentList);

    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    if (studentList.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-5">
            <i class="bi bi-inbox fs-1 d-block mb-3"></i>
            No students found. Add your first student!
          </td>
        </tr>
      `;
    } else {
      studentList.forEach((student, index) => {
        // Format room details
let roomDetails = student.room_id
  ? `Room ${student.room_id.roomNumber} (Floor ${student.room_id.floor})`
  : "Not Assigned";
        // Format year display
        const yearText = student.year ? `${student.year}${getYearSuffix(student.year)} Year` : 'N/A';

        table.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${student.name || 'N/A'}</td>
            <td>${student.registerNumber || 'N/A'}</td>
            <td>${yearText}</td>
            <td>${student.department || 'N/A'}</td>
            <td>${roomDetails}</td>
            <td>
              <button class="btn btn-info btn-sm" onclick="viewStudent('${student._id}')">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-warning btn-sm" onclick="editStudent('${student._id}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="openDeleteModal('${student._id}')">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
    }

    document.getElementById('studentCount').textContent = `${studentList.length} records`;
    loadStats();

  } catch (err) {
    console.error("Error loading students:", err);
    showFlash("Error loading students", "danger");
  }
}

// Helper function to get year suffix
function getYearSuffix(year) {
  if (year === 1) return 'st';
  if (year === 2) return 'nd';
  if (year === 3) return 'rd';
  return 'th';
}

// ---------------------- Delete Student ----------------------
let deleteStudentId = null;

function openDeleteModal(id) {
  deleteStudentId = id;
  new bootstrap.Modal(document.getElementById("deleteModal")).show();
}

async function confirmDelete() {
  try {
const res = await fetch(`http://localhost:5000/api/students/${deleteStudentId}`, {      
  method: "DELETE" 
});

const data = await res.json();
    
    if (!res.ok) {
      showFlash(data.message || "Error deleting student", "danger");
      return;
    }
    
    showFlash("Student deleted and room freed", "success");
    await loadStudents();
await loadRoomOptions(); // 🔥 update availability    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
  } catch (err) {
    console.error("Error deleting student:", err);
    showFlash("Error deleting student", "danger");
  }
}

// ---------------------- View Student ----------------------
function viewStudent(id) {
  const student = studentList.find(s => s._id === id);
  if (!student) {
    console.log("Student not found with ID:", id);
    return;
  }

  document.getElementById("viewRegisterNumber").innerText = student.registerNumber || 'N/A';
  document.getElementById("viewName").innerText = student.name || 'N/A';
  document.getElementById("viewEmail").innerText = student.email || 'N/A';
  document.getElementById("viewPhone").innerText = student.phone || 'N/A';
  document.getElementById("viewDept").innerText = student.department || 'N/A';
  document.getElementById("viewYear").innerText = student.year ? `${student.year}${getYearSuffix(student.year)} Year` : 'N/A';
  document.getElementById("viewDob").innerText = student.dob ? formatDate(student.dob) : 'N/A';
let roomText = student.room_id
  ? `Room ${student.room_id.roomNumber} (Floor ${student.room_id.floor})`
  : "Not Assigned";  document.getElementById("viewRoom").innerText = roomText;

  new bootstrap.Modal(document.getElementById("viewModal")).show();
}

// Helper function to format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// ---------------------- Edit Student ----------------------
function editStudent(id) {
  const student = studentList.find(s => s._id === id);
  document.getElementById("room_id").value = student.room_id?._id || "";
  if (!student) {
    console.log("Student not found with ID:", id);
    return;
  }

  editingStudentId = id;

  document.getElementById("name").value = student.name || '';
  document.getElementById("registerNumber").value = student.registerNumber || '';
  document.getElementById("email").value = student.email || '';
  document.getElementById("phone").value = student.phone || '';
  document.getElementById("department").value = student.department || '';
  document.getElementById("year").value = student.year || '';
document.getElementById("dob").value = student.dob 
  ? student.dob.split("T")[0] 
  : '';  

  document.querySelector('.col-lg-4').scrollIntoView({ behavior: 'smooth' });
  
  const submitBtn = document.querySelector("#studentForm button[type='submit']");
  submitBtn.innerHTML = '<i class="bi bi-pencil me-2"></i>Update Student';
  
  showFlash("Edit mode: Update student details and click Update", "info");
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

// ---------------------- Load Rooms for Dropdown ----------------------
async function loadRoomOptions() {
  try {
    const res = await fetch("http://localhost:5000/api/rooms");
    const rooms = await res.json();

    const dropdown = document.getElementById("room_id");
    dropdown.innerHTML = `<option value="">-- Select Room --</option>`;

    rooms.forEach(room => {
      const available = room.capacity - (room.occupied || 0);

      if (available <= 0) return;

      dropdown.innerHTML += `
        <option value="${room._id}">
          Room ${room.roomNumber} (Floor ${room.floor}) - ${available} bed(s)
        </option>
      `;
    });

    // 🚨 No rooms case
    if (dropdown.options.length === 1) {
      dropdown.innerHTML += `<option disabled>No rooms available</option>`;
    }

  } catch (err) {
    console.error("Error loading rooms:", err);
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

async function loadStats() {
  try {
    const studentRes = await fetch("http://localhost:5000/api/students");
    const students = await studentRes.json();

    const assignedCount = students.filter(s => s.room_id).length;
    const departments = new Set(students.map(s => s.department).filter(Boolean));

    document.getElementById('totalStudentsCount').textContent = students.length;
    document.getElementById('assignedRoomsCount').textContent = assignedCount;
    document.getElementById('departmentsCount').textContent = departments.size;

  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ---------------------- Reset Form ----------------------
function resetForm() {
  document.getElementById("studentForm").reset();
  const submitBtn = document.querySelector("#studentForm button[type='submit']");
  submitBtn.innerHTML = '<i class="bi bi-person-plus me-2"></i>Add Student';
  editingStudentId = null;
}

// ---------------------- Initialize ----------------------
document.addEventListener("DOMContentLoaded", function() {
  loadStudents();
  loadRoomOptions(); // ✅ IMPORTANT
  loadStats();
  
  // Add reset button
  const formCard = document.querySelector('.card .p-4');
  if (formCard) {
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn-outline-secondary w-100 mt-2';
    resetBtn.innerHTML = '<i class="bi bi-arrow-counterclockwise me-2"></i>Reset Form';
    resetBtn.onclick = resetForm;
    document.getElementById("studentForm").appendChild(resetBtn);
  }
});