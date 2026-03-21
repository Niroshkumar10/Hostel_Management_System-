document.addEventListener("DOMContentLoaded", function() {
    loadProfile();
    loadAdditionalStats();
    loadRecentLeaves();
    loadRecentComplaints();
});

function loadProfile() {
    const student = JSON.parse(localStorage.getItem("student"));

    if (!student) {
        showFlash("Session expired. Please login again.", "danger");
        setTimeout(() => {
            window.location.href = "/client/pages/admin/admin-login.html";
        }, 2000);
        return;
    }

    // Basic Info
    document.getElementById("studentName").innerText = student.name || "Student";
    document.getElementById("studentEmail").innerText = student.email || "N/A";
    document.getElementById("studentReg").innerText = student.registerNumber || "REG-001";
    document.getElementById("studentPhone").innerText = student.phone || "Not provided";
    
    // Department & Year
    document.getElementById("deptName").innerText = student.department || "Not assigned";
    document.getElementById("yearName").innerText = student.year ? student.year + " Year" : "N/A";

    // Date of Birth
    if (student.dob) {
        const date = new Date(student.dob);
        document.getElementById("studentDob").innerText = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Gender
    document.getElementById("studentGender").innerText = student.gender || "Not specified";

    // Address
    document.getElementById("studentAddress").innerText = student.address || "Not provided";

    // Room Details
    let roomNumber = "-";
    let roomFloor = "-";
    let roomStatus = "Not Assigned";

    if (student.room_id) {
        roomNumber = student.room_id.roomNumber || "-";
        roomFloor = student.room_id.floor || "-";
        roomStatus = "Active";
        document.getElementById("roomStatus").innerHTML = 
            `<span class="status-badge status-active">Active</span>`;
    } else {
        document.getElementById("roomStatus").innerHTML = 
            `<span class="status-badge status-pending">Not Assigned</span>`;
    }

    document.getElementById("roomNumber").innerText = roomNumber;
    document.getElementById("roomFloor").innerText = roomFloor;

    // Avatar
    const avatar = document.getElementById("avatarLetter");
    avatar.innerText = student.name ? student.name.charAt(0).toUpperCase() : "S";

    // Member Since
    if (student.createdAt) {
        const joinDate = new Date(student.createdAt);
        document.getElementById("memberSince").innerText = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        });
    }
}

async function loadAdditionalStats() {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student || !student._id) return;

    try {
        await loadAttendanceStats(student._id);
        await loadComplaintStats(student._id);
        await loadLeaveStats(student._id);
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

async function loadAttendanceStats(studentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/attendance/student/${studentId}`);
        const attendance = await response.json();
        
        if (attendance && attendance.length > 0) {
            const present = attendance.filter(a => a.status === 'present').length;
            const percentage = Math.round((present / attendance.length) * 100);
            document.getElementById("statAttendance").innerText = percentage + "%";
        }
    } catch (error) {
        document.getElementById("statAttendance").innerText = "0%";
    }
}

async function loadComplaintStats(studentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/student/${studentId}`);
        const complaints = await response.json();
        
        document.getElementById("statComplaints").innerText = complaints.length || "0";
        document.getElementById("complaintCount").innerText = complaints.length;
    } catch (error) {
        document.getElementById("statComplaints").innerText = "0";
        document.getElementById("complaintCount").innerText = "0";
    }
}

async function loadLeaveStats(studentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/student/${studentId}`);
        const leaves = await response.json();
        
        document.getElementById("statLeaves").innerText = leaves.length || "0";
        document.getElementById("leaveCount").innerText = leaves.length;
    } catch (error) {
        document.getElementById("statLeaves").innerText = "0";
        document.getElementById("leaveCount").innerText = "0";
    }
}

async function loadRecentLeaves() {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student || !student._id) return;

    try {
        const response = await fetch(`http://localhost:5000/api/leaves/student/${student._id}`);
        const leaves = await response.json();
        
        const tbody = document.getElementById("leaveTableBody");
        
        if (!leaves || leaves.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-4 d-block mb-2"></i>
                        No leave applications found
                    </td>
                </tr>
            `;
            return;
        }

        // Show only 3 most recent leaves
        const recentLeaves = leaves.slice(0, 3);
        
        let html = '';
        recentLeaves.forEach(leave => {
            const fromDate = new Date(leave.from_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const toDate = new Date(leave.to_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            const start = new Date(leave.from_date);
            const end = new Date(leave.to_date);
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            const statusClass = 
                leave.status === 'approved' ? 'status-approved' :
                leave.status === 'pending' ? 'status-pending' : 'status-rejected';
            
            html += `
                <tr>
                    <td>${fromDate}</td>
                    <td>${toDate}</td>
                    <td>${duration}d</td>
                    <td>${leave.reason?.substring(0, 20) || 'Not specified'}${leave.reason?.length > 20 ? '...' : ''}</td>
                    <td><span class="status-badge ${statusClass}">${leave.status}</span></td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    } catch (error) {
        console.error("Error loading leaves:", error);
    }
}

async function loadRecentComplaints() {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student || !student._id) return;

    try {
        const response = await fetch(`http://localhost:5000/api/complaints/student/${student._id}`);
        const complaints = await response.json();
        
        const tbody = document.getElementById("complaintTableBody");
        
        if (!complaints || complaints.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-4 d-block mb-2"></i>
                        No complaints found
                    </td>
                </tr>
            `;
            return;
        }

        // Show only 3 most recent complaints
        const recentComplaints = complaints.slice(0, 3);
        
        let html = '';
        recentComplaints.forEach(complaint => {
            const date = new Date(complaint.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            const statusClass = complaint.status === 'resolved' ? 'status-approved' : 'status-pending';
            
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${complaint.title || 'Untitled'}</td>
                    <td><span class="status-badge ${statusClass}">${complaint.status}</span></td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    } catch (error) {
        console.error("Error loading complaints:", error);
    }
}

function enableEdit() {
    showFlash("Edit profile feature coming soon! 🚀", "info");
}

function changePassword() {
    showFlash("Change password feature coming soon! 🔐", "info");
}

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