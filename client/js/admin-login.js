// SWITCH FORMS
function showAdmin(){
  document.getElementById("adminForm").style.display="block";
  document.getElementById("studentForm").style.display="none";
  
  // Update toggle button active states
  document.getElementById("adminToggle").classList.add("active");
  document.getElementById("studentToggle").classList.remove("active");
}

function showStudent(){
  document.getElementById("adminForm").style.display="none";
  document.getElementById("studentForm").style.display="block";
  
  // Update toggle button active states
  document.getElementById("studentToggle").classList.add("active");
  document.getElementById("adminToggle").classList.remove("active");
}

// ADMIN LOGIN
const adminForm = document.getElementById("adminForm");

adminForm.addEventListener("submit", async function(e){
  e.preventDefault();

  // Get values - using username instead of email
  const username = document.getElementById("adminEmail").value; // This field contains username
  const password = document.getElementById("adminPassword").value;

  console.log("Attempting admin login with:", { username, password }); // Debug log

  try {
    const response = await fetch("http://localhost:5000/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password }) // Send as username, not email
    });

    const data = await response.json();
    console.log("Server response:", data); // Debug log

    if (data.success) {
      localStorage.setItem("adminLoggedIn", "true");
      showFlash("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1000);
    } else {
      showFlash(data.message || "Invalid credentials", "danger");
    }
  } catch (err) {
    console.error("Login error:", err);
    showFlash("Server error - please try again", "danger");
  }
});

// STUDENT LOGIN
document.getElementById('studentForm').addEventListener('submit', async function(e){
  e.preventDefault();

  const email = document.getElementById('studentEmail').value;
  const password = document.getElementById('studentPassword').value;

  console.log("Attempting student login with:", { email }); // Debug log

  try {
    const response = await fetch("http://localhost:5000/api/students/login", { // Fixed endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log("Server response:", data); // Debug log

    if (data.success) {
      localStorage.setItem("studentLoggedIn", "true");
      localStorage.setItem("student", JSON.stringify(data.student));
      showFlash("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "student-dashboard.html";
      }, 1000);
    } else {
      showFlash(data.message || "Invalid login", "danger");
    }
  } catch (err) {
    console.error("Login error:", err);
    showFlash("Server error - please try again", "danger");
  }
});

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const type = input.type === 'password' ? 'text' : 'password';
  input.type = type;
}

// Initialize - show admin form by default
document.addEventListener('DOMContentLoaded', function() {
  showAdmin();
});