// API Base URL
const REPORTS_API = "http://localhost:5000/api/reports";
const STUDENTS_API = "http://localhost:5000/api/students";
const ATTENDANCE_API = "http://localhost:5000/api/attendance";
const COMPLAINTS_API = "http://localhost:5000/api/complaints";
const LEAVES_API = "http://localhost:5000/api/leaves";
const COLLEGE_API = "http://localhost:5000/api/college";

// Global variables
let reportsData = {};
let studentsData = [];
let attendanceData = [];
let complaintsData = [];
let leavesData = [];
let collegeData = {};

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
    loadCollegeData();
    loadReports();
    loadAdditionalData();
});
// ---------------- LOAD REPORTS ----------------
async function loadReports() {
    try {
        const res = await fetch(REPORTS_API);
        reportsData = await res.json();
        
        // Update main stats
        updateMainStats();
        
        // Update last updated time
        updateLastUpdated();
        
        showFlash('Reports data refreshed successfully', 'success');
    } catch (error) {
        console.error('Error loading reports:', error);
        showFlash('Error loading reports data', 'danger');
    }
}

async function loadCollegeData() {
    try {
        const res = await fetch(COLLEGE_API);
        collegeData = await res.json();
    } catch (err) {
        console.error("Error loading college data", err);
    }
}
// ---------------- LOAD ADDITIONAL DATA ----------------
async function loadAdditionalData() {
    try {
        // Load students for detailed stats
        const studentsRes = await fetch(STUDENTS_API);
        studentsData = await studentsRes.json();
        
        // Load attendance
        const attendanceRes = await fetch(ATTENDANCE_API);
        attendanceData = await attendanceRes.json();
        
        // Load complaints
        const complaintsRes = await fetch(COMPLAINTS_API);
        complaintsData = await complaintsRes.json();
        
        // Load leaves
        const leavesRes = await fetch(LEAVES_API);
        leavesData = await leavesRes.json();
        
        // Update detailed stats
        updateDetailedStats();
        updateDepartmentStats();
        updateRecentActivity();
        
    } catch (error) {
        console.error('Error loading additional data:', error);
    }
}

// ---------------- UPDATE MAIN STATS ----------------
function updateMainStats() {
    // Basic stats
    document.getElementById("totalStudents").innerText = reportsData.totalStudents || 0;
    document.getElementById("activeStudents").innerText = reportsData.activeStudents || 0;
    document.getElementById("totalRooms").innerText = reportsData.totalRooms || 0;
    document.getElementById("occupiedBeds").innerText = reportsData.occupiedBeds || 0;
    document.getElementById("availableBeds").innerText = reportsData.availableBeds || 0;
    
    // Calculate occupancy percentage
    const totalBeds = (reportsData.occupiedBeds || 0) + (reportsData.availableBeds || 0);
    const occupancyPercent = totalBeds > 0 ? Math.round((reportsData.occupiedBeds / totalBeds) * 100) : 0;
    document.getElementById("occupancyProgress").style.width = occupancyPercent + '%';
    
    // Complaints stats
    document.getElementById("totalComplaints").innerText = reportsData.totalComplaints || 0;
    document.getElementById("pendingComplaints").innerText = reportsData.pendingComplaints || 0;
    document.getElementById("resolvedComplaints").innerText = 
        (reportsData.totalComplaints - reportsData.pendingComplaints) || 0;
    
    // Leaves stats
    document.getElementById("totalLeaves").innerText = reportsData.totalLeaves || 0;
    document.getElementById("pendingLeaves").innerText = reportsData.pendingLeaves || 0;
    document.getElementById("approvedLeaves").innerText = reportsData.approvedLeaves || 0;
    
    // Attendance stats
    document.getElementById("attendancePercentage").innerText = (reportsData.attendancePercentage || 0) + '%';
    document.getElementById("attendanceProgress").style.width = (reportsData.attendancePercentage || 0) + '%';
    
    // Payment stats (if available from backend)
    document.getElementById("totalPayments").innerText = '₹' + (reportsData.totalPayments || 0).toLocaleString();
    document.getElementById("paidPayments").innerText = reportsData.paidPayments || 0;
    document.getElementById("pendingPayments").innerText = reportsData.pendingPayments || 0;
    
    // Department stats
    document.getElementById("totalDepartments").innerText = reportsData.totalDepartments || 6;
    const avgPerDept = Math.round((reportsData.totalStudents || 0) / 6);
    document.getElementById("avgStudentsPerDept").innerText = avgPerDept;
    
    // Today's attendance (if available)
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(a => 
        new Date(a.date).toISOString().split('T')[0] === today
    );
    document.getElementById("todayPresent").innerText = todayAttendance.filter(a => a.status === 'present').length;
    document.getElementById("todayAbsent").innerText = todayAttendance.filter(a => a.status === 'absent').length;
}

// ---------------- UPDATE DETAILED STATS ----------------
function updateDetailedStats() {
    if (!studentsData.length) return;
    
    // Year distribution
    const years = {1:0, 2:0, 3:0, 4:0};
    let maleCount = 0;
    let femaleCount = 0;
    const departments = {
        'CSE': 0, 'AIDS': 0, 'ECE': 0, 
        'EEE': 0, 'MECH': 0, 'CIVIL': 0
    };
    
    studentsData.forEach(student => {
        // Year count
        if (student.year && years[student.year] !== undefined) {
            years[student.year]++;
        }
        
        // Gender count (if gender field exists)
        if (student.gender === 'male') maleCount++;
        else if (student.gender === 'female') femaleCount++;
        
        // Department count
        if (student.department && departments[student.department] !== undefined) {
            departments[student.department]++;
        }
    });
    
    document.getElementById("firstYear").innerText = years[1];
    document.getElementById("secondYear").innerText = years[2];
    document.getElementById("thirdYear").innerText = years[3];
    document.getElementById("fourthYear").innerText = years[4];
    
    // Gender stats
    document.getElementById("maleStudents").innerText = maleCount;
    document.getElementById("femaleStudents").innerText = femaleCount;
    
    const ratio = maleCount > 0 && femaleCount > 0 ? 
        (maleCount / femaleCount).toFixed(1) : 
        (maleCount > 0 ? '1:0' : '0:0');
    document.getElementById("genderRatio").innerText = ratio;
    
    // Top departments
    document.getElementById("cseCount").innerText = departments['CSE'] || 0;
    document.getElementById("eceCount").innerText = departments['ECE'] || 0;
    document.getElementById("mechCount").innerText = departments['MECH'] || 0;
    
    // Monthly stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyLeaves = leavesData.filter(l => {
        const leaveDate = new Date(l.createdAt);
        return leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
    });
    
    const monthlyComplaints = complaintsData.filter(c => {
        const complaintDate = new Date(c.createdAt);
        return complaintDate.getMonth() === currentMonth && complaintDate.getFullYear() === currentYear;
    });
    
    document.getElementById("monthlyLeaves").innerText = monthlyLeaves.length;
    document.getElementById("monthlyComplaints").innerText = monthlyComplaints.length;
    
    // Monthly attendance average
    const monthlyAttendance = attendanceData.filter(a => {
        const attDate = new Date(a.date);
        return attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
    });
    
    const presentCount = monthlyAttendance.filter(a => a.status === 'present').length;
    const avgAttendance = monthlyAttendance.length > 0 ? 
        Math.round((presentCount / monthlyAttendance.length) * 100) : 0;
    document.getElementById("monthlyAttendance").innerText = avgAttendance + '%';
}

// ---------------- UPDATE DEPARTMENT STATS ----------------
function updateDepartmentStats() {
    if (!studentsData.length) return;
    
    const deptStats = {};
    studentsData.forEach(student => {
        const dept = student.department || 'Other';
        deptStats[dept] = (deptStats[dept] || 0) + 1;
    });
    
    // Sort departments by count
    const sortedDepts = Object.entries(deptStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    let html = '';
    sortedDepts.forEach(([dept, count]) => {
        const percentage = Math.round((count / studentsData.length) * 100);
        html += `
            <div class="report-item">
                <span class="label">${dept}</span>
                <span class="value">
                    ${count} 
                    <small class="text-muted">(${percentage}%)</small>
                </span>
            </div>
        `;
    });
    
    document.getElementById("departmentStats").innerHTML = html;
}

// ---------------- UPDATE RECENT ACTIVITY ----------------
function updateRecentActivity() {
    // Combine and sort recent activities
    const activities = [];
    
    // Add recent complaints
    complaintsData.slice(0, 3).forEach(c => {
        activities.push({
            type: 'complaint',
            title: c.title,
            student: c.student_name,
            date: c.createdAt,
            status: c.status,
            icon: 'bi-exclamation-triangle',
            color: 'text-warning'
        });
    });
    
    // Add recent leaves
    leavesData.slice(0, 3).forEach(l => {
        activities.push({
            type: 'leave',
            title: 'Leave Request',
            student: l.student_name,
            date: l.createdAt,
            status: l.status,
            icon: 'bi-calendar-plus',
            color: 'text-info'
        });
    });
    
    // Add recent attendance
    attendanceData.slice(0, 2).forEach(a => {
        activities.push({
            type: 'attendance',
            title: a.status === 'present' ? 'Present' : 'Absent',
            student: a.student_id?.name,
            date: a.date,
            status: a.status,
            icon: a.status === 'present' ? 'bi-check-circle' : 'bi-x-circle',
            color: a.status === 'present' ? 'text-success' : 'text-danger'
        });
    });
    
    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    activities.slice(0, 5).forEach(activity => {
        const date = new Date(activity.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = activity.status === 'pending' ? 'badge-pending' : 
                           activity.status === 'approved' || activity.status === 'present' ? 'badge-approved' :
                           'badge-rejected';
        
        html += `
            <div class="report-item">
                <div>
                    <i class="bi ${activity.icon} ${activity.color} me-2" style="font-size: 0.8rem;"></i>
                    <strong style="font-size: 0.85rem;">${activity.student || 'Unknown'}</strong>
                    <br>
                    <small class="text-muted" style="font-size: 0.7rem;">${activity.title}</small>
                </div>
                <div class="text-end">
                    <small class="d-block" style="font-size: 0.65rem;">${date}</small>
                    <span class="${statusClass}" style="font-size: 0.6rem;">${activity.status}</span>
                </div>
            </div>
        `;
    });
    
    if (activities.length === 0) {
        html = '<div class="text-center text-muted py-2" style="font-size: 0.85rem;">No recent activity</div>';
    }
    
    document.getElementById("recentActivity").innerHTML = html;
}

// ---------------- EXPORT TO PDF ----------------
function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();

        // ---------------- HEADER ----------------
        const collegeName = collegeData?.name || "Your College Name";
        const collegeAddress = collegeData?.address || "College Address";

        // College Name (CENTER)
        doc.setFontSize(18);
        doc.setFont(undefined, "bold");
        doc.text(collegeName, pageWidth / 2, 15, { align: "center" });

        // Address (MULTI LINE SUPPORT)
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");

        const addressLines = doc.splitTextToSize(collegeAddress, 160);
        doc.text(addressLines, pageWidth / 2, 22, { align: "center" });

        // Line
        doc.setLineWidth(0.5);
        doc.line(14, 30, 196, 30);

        // ---------------- TITLE ----------------
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.setFont(undefined, "bold");
        doc.text("HOSTEL MANAGEMENT REPORT", pageWidth / 2, 40, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont(undefined, "normal");
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 48);

        // ---------------- TABLE ----------------
        const summaryData = [
            ['Metric', 'Value'],
            ['Total Students', document.getElementById('totalStudents').innerText],
            ['Total Rooms', document.getElementById('totalRooms').innerText],
            ['Occupied Beds', document.getElementById('occupiedBeds').innerText],
            ['Available Beds', document.getElementById('availableBeds').innerText],
            ['Attendance', document.getElementById('attendancePercentage').innerText],
            ['Total Complaints', document.getElementById('totalComplaints').innerText],
            ['Pending Complaints', document.getElementById('pendingComplaints').innerText],
            ['Total Leaves', document.getElementById('totalLeaves').innerText],
            ['Approved Leaves', document.getElementById('approvedLeaves').innerText]
        ];

        doc.autoTable({
            startY: 55,
            head: [summaryData[0]],
            body: summaryData.slice(1),

            theme: 'grid',

            styles: {
                fontSize: 10,
                cellPadding: 4
            },

            headStyles: {
                fillColor: [37, 99, 235],
                textColor: [255, 255, 255],
                halign: 'center'
            },

            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'center' }
            }
        });

        // ---------------- FOOTER ----------------
        const pageCount = doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            doc.setFontSize(9);
            doc.setTextColor(120);

            // Footer line
            doc.line(14, 285, 196, 285);

            // Left
            doc.text("Hostel Management System", 14, 290);

            // Center (optional)
            doc.text("Confidential Report", pageWidth / 2, 290, { align: "center" });

            // Right
            doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: "right" });
        }

        // ---------------- SAVE ----------------
        doc.save("hostel-report.pdf");

        showFlash("Professional PDF downloaded ✅", "success");

    } catch (error) {
        console.error("Error generating PDF:", error);
        showFlash("Error generating PDF", "danger");
    }
}
// ---------------- EXPORT TO EXCEL ----------------
function exportToExcel() {
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Summary sheet data
        const summaryData = [
            ['Hostel Management System - Reports'],
            [`Generated on: ${new Date().toLocaleString()}`],
            [],
            ['Summary Statistics'],
            ['Metric', 'Value'],
            ['Total Students', document.getElementById('totalStudents').innerText],
            ['Total Rooms', document.getElementById('totalRooms').innerText],
            ['Occupied Beds', document.getElementById('occupiedBeds').innerText],
            ['Available Beds', document.getElementById('availableBeds').innerText],
            ['Average Attendance', document.getElementById('attendancePercentage').innerText],
            ['Total Complaints', document.getElementById('totalComplaints').innerText],
            ['Pending Complaints', document.getElementById('pendingComplaints').innerText],
            ['Resolved Complaints', document.getElementById('resolvedComplaints').innerText],
            ['Total Leaves', document.getElementById('totalLeaves').innerText],
            ['Pending Leaves', document.getElementById('pendingLeaves').innerText],
            ['Approved Leaves', document.getElementById('approvedLeaves').innerText],
            ['Total Payments', document.getElementById('totalPayments').innerText],
            ['Paid Payments', document.getElementById('paidPayments').innerText],
            ['Pending Payments', document.getElementById('pendingPayments').innerText]
        ];
        
        // Year distribution sheet
        const yearData = [
            ['Year Distribution'],
            ['Year', 'Count'],
            ['1st Year', document.getElementById('firstYear').innerText],
            ['2nd Year', document.getElementById('secondYear').innerText],
            ['3rd Year', document.getElementById('thirdYear').innerText],
            ['4th Year', document.getElementById('fourthYear').innerText]
        ];
        
        // Department distribution
        const deptData = [
            ['Department Distribution'],
            ['Department', 'Count']
        ];
        
        // Add department data from the displayed stats
        const deptElements = document.querySelectorAll('#departmentStats .report-item');
        deptElements.forEach(item => {
            const label = item.querySelector('.label')?.innerText || '';
            const value = item.querySelector('.value')?.innerText || '';
            deptData.push([label, value]);
        });
        
        // Create sheets
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        const yearSheet = XLSX.utils.aoa_to_sheet(yearData);
        const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
        
        // Add sheets to workbook
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
        XLSX.utils.book_append_sheet(wb, yearSheet, 'Year Distribution');
        XLSX.utils.book_append_sheet(wb, deptSheet, 'Department Distribution');
        
        // Save the file
        XLSX.writeFile(wb, 'hostel-reports.xlsx');
        showFlash('Excel file downloaded successfully', 'success');
    } catch (error) {
        console.error('Error generating Excel:', error);
        showFlash('Error generating Excel file', 'danger');
    }
}

// ---------------- UPDATE LAST UPDATED ----------------
function updateLastUpdated() {
    const now = new Date();
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const timeStr = now.toLocaleTimeString('en-US', options);
    document.getElementById('lastUpdated').innerHTML = 
        `<i class="bi bi-clock me-1"></i>Last updated: ${timeStr}`;
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

// Auto-refresh every 5 minutes
setInterval(() => {
    loadReports();
    loadAdditionalData();
}, 300000);