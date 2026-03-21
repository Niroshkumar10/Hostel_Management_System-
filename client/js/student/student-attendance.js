let attendanceList = [];
let filteredList = [];

document.addEventListener("DOMContentLoaded", () => {
    loadAttendance();
});

async function loadAttendance() {
    try {
        const student = JSON.parse(localStorage.getItem("student"));

        if (!student) {
            showFlash("Session expired. Please login again.", "danger");
            setTimeout(() => {
                window.location.href = "/client/pages/admin/admin-login.html";
            }, 2000);
            return;
        }

        const res = await fetch(`http://localhost:5000/api/attendance/student/${student._id}`);
        attendanceList = await res.json();
        
        // Sort by date (newest first)
        attendanceList.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Set default filter to current month
        const today = new Date();
        const yearMonth = today.toISOString().slice(0, 7);
        document.getElementById('filterMonth').value = yearMonth;
        
        filterAttendance();

    } catch (err) {
        console.error("Error loading attendance:", err);
        showFlash("Error loading attendance records", "danger");
    }
}

// Filter attendance by month
function filterAttendance() {
    const selectedMonth = document.getElementById("filterMonth").value;

    if (!selectedMonth) {
        filteredList = attendanceList;
    } else {
        filteredList = attendanceList.filter(a => {
            const date = new Date(a.date);
            const month = date.toISOString().slice(0, 7);
            return month === selectedMonth;
        });
    }

    displayAttendance(filteredList);
}

// Reset filter
function resetFilter() {
    // Set to current month
    const today = new Date();
    const yearMonth = today.toISOString().slice(0, 7);
    document.getElementById("filterMonth").value = yearMonth;
    filterAttendance();
}

// Display attendance data
function displayAttendance(data) {
    const table = document.getElementById("attendanceTable");
    
    if (!data || data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    No attendance records found for this period
                </td>
            </tr>
        `;
        
        document.getElementById("totalDays").innerText = "0";
        document.getElementById("presentDays").innerText = "0";
        document.getElementById("percentage").innerText = "0%";
        document.getElementById("recordCount").innerText = "0 records";
        document.getElementById("displayCount").innerText = "0";
        document.getElementById("totalCount").innerText = attendanceList.length;
        return;
    }

    let present = 0;
    let html = '';

    data.forEach(a => {
        if (a.status === "present") present++;
        
        const date = new Date(a.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const statusClass = a.status === 'present' ? 'status-present' : 'status-absent';
        
        html += `
            <tr>
                <td>
                    <div class="date-cell">
                        <i class="bi bi-calendar3"></i>
                        ${formattedDate}
                    </div>
                </td>
                <td>${dayName}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${a.status.toUpperCase()}
                    </span>
                </td>
            </tr>
        `;
    });

    table.innerHTML = html;

    const total = data.length;
    const percentage = total ? ((present / total) * 100).toFixed(1) : 0;

    document.getElementById("totalDays").innerText = total;
    document.getElementById("presentDays").innerText = present;
    document.getElementById("percentage").innerText = percentage + "%";
    document.getElementById("recordCount").innerText = total + " records";
    document.getElementById("displayCount").innerText = total;
    document.getElementById("totalCount").innerText = attendanceList.length;
}

// Show flash message
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