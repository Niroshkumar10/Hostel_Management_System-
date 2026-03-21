// API Base URLs
const STUDENT_API = "http://localhost:5000/api/students";
const ATTENDANCE_API = "http://localhost:5000/api/attendance";

// Global variables
let studentList = [];
let attendanceList = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentFilter = {
    from: null,
    to: null,
    search: ''
};

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
    loadStudents();
    loadAttendance();
    updateDateTime();
});

// ---------------- LOAD STUDENTS ----------------
async function loadStudents() {
    try {
        const res = await fetch(STUDENT_API);
        studentList = await res.json();

        const dropdown = document.getElementById("student");
        dropdown.innerHTML = '<option value="">-- Select Student --</option>';

        studentList.forEach(s => {
            dropdown.innerHTML += `
                <option value="${s._id}">
                    ${s.name} (${s.registerNumber || 'N/A'})
                </option>
            `;
        });

        document.getElementById('totalStudents').textContent = studentList.length;
    } catch (error) {
        console.error('Error loading students:', error);
        showFlash('Error loading students', 'danger');
    }
}

// ---------------- MARK ATTENDANCE ----------------
async function markAttendance() {
    const student_id = document.getElementById("student").value;
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;

    if (!student_id) {
        showFlash("Please select a student", "warning");
        return;
    }

    if (!date) {
        showFlash("Please select a date", "warning");
        return;
    }

    try {
        const response = await fetch(ATTENDANCE_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ student_id, date, status })
        });

        if (response.ok) {
            showFlash("Attendance marked successfully", "success");
            
            // Reset form
            document.getElementById("student").value = "";
            document.getElementById("status").value = "present";
            
            // Reload attendance
            loadAttendance();
        } else {
            const error = await response.json();
            showFlash(error.message || "Failed to mark attendance", "danger");
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        showFlash("Error marking attendance", "danger");
    }
}

// ---------------- LOAD ATTENDANCE ----------------
async function loadAttendance() {
    try {
        const res = await fetch(ATTENDANCE_API);
        attendanceList = await res.json();
        
        // Sort by date (newest first)
        attendanceList.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        updateStats();
        applyFilters();
    } catch (error) {
        console.error('Error loading attendance:', error);
        showFlash('Error loading attendance records', 'danger');
        document.getElementById('attendanceTable').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <i class="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
                    Failed to load attendance records.
                </td>
            </tr>
        `;
    }
}

// ---------------- APPLY FILTERS ----------------
function applyFilters() {
    let filtered = [...attendanceList];

    // Apply date filter
    if (currentFilter.from) {
        const fromDate = new Date(currentFilter.from);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(a => new Date(a.date) >= fromDate);
    }
    
    if (currentFilter.to) {
        const toDate = new Date(currentFilter.to);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(a => new Date(a.date) <= toDate);
    }

    // Apply search filter
    if (currentFilter.search) {
        const searchTerm = currentFilter.search.toLowerCase();
        filtered = filtered.filter(a => 
            a.student_id?.name?.toLowerCase().includes(searchTerm) ||
            a.student_id?.registerNumber?.toLowerCase().includes(searchTerm)
        );
    }

    displayAttendance(filtered);
    document.getElementById('attendanceCount').textContent = `${filtered.length} records`;
}

// ---------------- FILTER BY DATE ----------------
function filterByDate() {
    const from = document.getElementById('filterFrom').value;
    const to = document.getElementById('filterTo').value;
    
    currentFilter.from = from || null;
    currentFilter.to = to || null;
    
    applyFilters();
}

// ---------------- CLEAR FILTER ----------------
function clearFilter() {
    document.getElementById('filterFrom').value = '';
    document.getElementById('filterTo').value = '';
    document.getElementById('searchInput').value = '';
    
    currentFilter = {
        from: null,
        to: null,
        search: ''
    };
    
    applyFilters();
}

// ---------------- SEARCH ATTENDANCE ----------------
function searchAttendance() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    currentFilter.search = searchTerm;
    currentPage = 1;
    applyFilters();
}

// ---------------- DISPLAY ATTENDANCE ----------------
function displayAttendance(attendance) {
    const tbody = document.getElementById('attendanceTable');
    
    if (!attendance || attendance.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    No attendance records found.
                </td>
            </tr>
        `;
        return;
    }

    // Calculate pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedAttendance = attendance.slice(start, end);

    let html = '';
    paginatedAttendance.forEach((record, index) => {
        const serialNo = start + index + 1;
        const studentName = record.student_id?.name || "Unknown Student";
        const studentReg = record.student_id?.registerNumber || "";
        const date = new Date(record.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const statusClass = record.status === 'present' ? 'status-present' : 'status-absent';
        
        html += `
            <tr>
                <td><span class="fw-medium">${serialNo}</span></td>
                <td>
                    <div class="student-info">
                        <div class="student-avatar">
                            <i class="bi bi-person text-primary"></i>
                        </div>
                        <div>
                            <strong>${studentName}</strong>
                            ${studentReg ? `<br><small class="text-muted">${studentReg}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <i class="bi bi-calendar3 me-2 text-muted"></i>
                    ${date}
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${record.status}
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary" onclick="editAttendance('${record._id}')">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAttendance('${record._id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    updatePagination(attendance.length);
}

// ---------------- UPDATE STATISTICS ----------------
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayRecords = attendanceList.filter(a => 
        new Date(a.date).toISOString().split('T')[0] === today
    );
    
    const presentToday = todayRecords.filter(a => a.status === 'present').length;
    const absentToday = todayRecords.filter(a => a.status === 'absent').length;
    
    // Calculate average attendance rate
    let totalRate = 0;
    if (attendanceList.length > 0) {
        const presentCount = attendanceList.filter(a => a.status === 'present').length;
        totalRate = Math.round((presentCount / attendanceList.length) * 100);
    }
    
    document.getElementById('todayPresent').textContent = presentToday;
    document.getElementById('todayAbsent').textContent = absentToday;
    document.getElementById('attendanceRate').textContent = totalRate + '%';
}

// ---------------- EDIT ATTENDANCE ----------------
function editAttendance(id) {
    const record = attendanceList.find(a => a._id === id);
    
    if (record) {
        document.getElementById('editAttendanceId').value = record._id;
        document.getElementById('editStudentName').value = record.student_id?.name || 'Unknown';
        
        // Format date for input
        const date = new Date(record.date);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('editDate').value = formattedDate;
        
        document.getElementById('editStatus').value = record.status;
        
        new bootstrap.Modal(document.getElementById('editModal')).show();
    }
}

// ---------------- UPDATE ATTENDANCE ----------------
async function updateAttendance() {
    const id = document.getElementById('editAttendanceId').value;
    const date = document.getElementById('editDate').value;
    const status = document.getElementById('editStatus').value;

    try {
        const response = await fetch(`${ATTENDANCE_API}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ date, status })
        });

        if (response.ok) {
            showFlash("Attendance updated successfully", "success");
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            loadAttendance();
        } else {
            showFlash("Failed to update attendance", "danger");
        }
    } catch (error) {
        console.error('Error updating attendance:', error);
        showFlash("Error updating attendance", "danger");
    }
}

// ---------------- DELETE ATTENDANCE ----------------
let deleteId = null;

function deleteAttendance(id) {
    deleteId = id;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function confirmDelete() {
    try {
        const response = await fetch(`${ATTENDANCE_API}/${deleteId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showFlash("Attendance record deleted successfully", "success");
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            loadAttendance();
        } else {
            showFlash("Failed to delete attendance", "danger");
        }
    } catch (error) {
        console.error('Error deleting attendance:', error);
        showFlash("Error deleting attendance", "danger");
    }
}

// ---------------- PAGINATION ----------------
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <span class="page-link" onclick="goToPage(${i})">${i}</span>
            </li>
        `;
    }
    
    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    applyFilters();
}

// ---------------- SHOW FLASH MESSAGE ----------------
function showFlash(message, type = 'success') {
    const flashDiv = document.getElementById('flashMessage');
    const flashText = document.getElementById('flashText');
    
    flashDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-4 shadow`;
    flashText.textContent = message;
    flashDiv.classList.remove('d-none');
    
    setTimeout(() => {
        flashDiv.classList.add('d-none');
    }, 3000);
}

// ---------------- UPDATE DATE TIME ----------------
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('en-US', options);
}