document.addEventListener("DOMContentLoaded", function () {
    loadStudentDashboard();
    loadAdditionalStats();
});

function loadStudentDashboard() {
    const studentData = JSON.parse(localStorage.getItem("student"));

    if (!studentData) {
        showFlash("Session expired. Please login again.", "danger");
        setTimeout(() => {
            window.location.href = "/client/pages/admin/admin-login.html";
        }, 2000);
        return;
    }

    console.log("Student Data:", studentData);
    updateStudentInfo(studentData);
}

function updateStudentInfo(student) {
    // Basic Info - Compact display
    document.getElementById("studentName").innerText = student.name || "Student";
    document.getElementById("fullName").innerText = student.name || "N/A";
    document.getElementById("registerNumber").innerText = student.registerNumber || "N/A";
    document.getElementById("studentEmail").innerText = student.email || "N/A";
    document.getElementById("studentPhone").innerText = student.phone || "N/A";

    // Department & Year - Compact
    document.getElementById("deptName").innerText = student.department || "N/A";
    
    const yearText = student.year ? student.year + " Year" : "N/A";
    document.getElementById("yearName").innerText = yearText;
    document.getElementById("yearDetail").innerText = yearText;

    // Room Details - Compact
    let roomNumber = "-";
    let roomFloor = "-";
    let roomStatus = "-";

    if (student.room_id) {
        roomNumber = student.room_id.roomNumber || "-";
        roomFloor = student.room_id.floor || "-";
        roomStatus = "Active";
        
        document.getElementById("roomDetail").innerText = `Room ${roomNumber}`;
        document.getElementById("roomFloor").innerText = `Floor ${roomFloor}`;
    } else {
        document.getElementById("roomDetail").innerText = "Not Assigned";
        document.getElementById("roomFloor").innerText = "-";
    }

    document.getElementById("roomNumber").innerText = roomNumber;
    document.getElementById("roomStatus").innerText = roomStatus;
}

async function loadAdditionalStats() {
    const studentData = JSON.parse(localStorage.getItem("student"));
    
    if (!studentData || !studentData._id) return;

    try {
        await Promise.all([
            loadComplaintCount(studentData._id),
            loadAttendancePercentage(studentData._id),
            loadLeaveStatus(studentData._id),
            loadFeeStatus(studentData._id)
        ]);
    } catch (error) {
        console.error("Error loading additional stats:", error);
    }
}

async function loadComplaintCount(studentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/student/${studentId}`);
        const complaints = await response.json();
        
        const pendingCount = complaints.filter(c => c.status === 'pending').length;
        document.getElementById("complaintCount").innerText = pendingCount;
        
        if (pendingCount > 0) {
            document.getElementById("complaintCount").style.background = "#fef3c7";
            document.getElementById("complaintCount").style.color = "#92400e";
        } else {
            document.getElementById("complaintCount").style.background = "#d1fae5";
            document.getElementById("complaintCount").style.color = "#065f46";
        }
    } catch (error) {
        document.getElementById("complaintCount").innerText = "0";
    }
}

async function loadAttendancePercentage(studentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/attendance/student/${studentId}`);
        const attendance = await response.json();
        
        if (attendance && attendance.length > 0) {
            const present = attendance.filter(a => a.status === 'present').length;
            const percentage = Math.round((present / attendance.length) * 100);
            document.getElementById("attendancePercent").innerText = percentage + "%";
            
            if (percentage >= 75) {
                document.getElementById("attendancePercent").style.background = "#d1fae5";
                document.getElementById("attendancePercent").style.color = "#065f46";
            } else if (percentage >= 60) {
                document.getElementById("attendancePercent").style.background = "#fef3c7";
                document.getElementById("attendancePercent").style.color = "#92400e";
            } else {
                document.getElementById("attendancePercent").style.background = "#fee2e2";
                document.getElementById("attendancePercent").style.color = "#991b1b";
            }
        } else {
            document.getElementById("attendancePercent").innerText = "0%";
        }
    } catch (error) {
        document.getElementById("attendancePercent").innerText = "0%";
    }
}

async function loadLeaveStatus(studentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/student/${studentId}`);
        const leaves = await response.json();
        
        const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
        
        if (pendingLeaves > 0) {
            document.getElementById("leaveStatus").innerText = pendingLeaves;
            document.getElementById("leaveStatus").style.background = "#fef3c7";
            document.getElementById("leaveStatus").style.color = "#92400e";
        } else {
            document.getElementById("leaveStatus").innerText = "✓";
            document.getElementById("leaveStatus").style.background = "#d1fae5";
            document.getElementById("leaveStatus").style.color = "#065f46";
        }
    } catch (error) {
        document.getElementById("leaveStatus").innerText = "✓";
    }
}

async function loadFeeStatus(studentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/payments/student/${studentId}`);
        const payments = await response.json();
        
        const pendingPayments = payments.filter(p => p.status === 'pending').length;
        
        if (pendingPayments > 0) {
            document.getElementById("feeStatus").innerText = "Due";
            document.getElementById("feeStatus").style.background = "#fee2e2";
            document.getElementById("feeStatus").style.color = "#991b1b";
        } else {
            document.getElementById("feeStatus").innerText = "Paid";
            document.getElementById("feeStatus").style.background = "#d1fae5";
            document.getElementById("feeStatus").style.color = "#065f46";
        }
    } catch (error) {
        document.getElementById("feeStatus").innerText = "Due";
    }
}

function showFlash(message, type = 'success') {
    const flashDiv = document.getElementById('flashMessage');
    const flashText = document.getElementById('flashText');
    
    let icon = 'bi-check-circle-fill';
    if(type === 'danger') icon = 'bi-exclamation-triangle-fill';
    if(type === 'warning') icon = 'bi-exclamation-circle-fill';
    
    flashDiv.innerHTML = `<i class="bi ${icon} me-2"></i><span id="flashText">${message}</span>`;
    flashDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-4 shadow-lg`;
    flashDiv.classList.remove('d-none');
    
    setTimeout(() => {
        flashDiv.classList.add('d-none');
    }, 3000);
}