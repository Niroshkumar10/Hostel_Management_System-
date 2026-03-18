// API Base URL
const LEAVE_API = "http://localhost:5000/api/leaves";

// Global variables
let leaveList = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentFilter = {
    status: 'all',
    from: null,
    to: null,
    search: ''
};

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
    loadLeaves();
});

// ---------------- LOAD ALL LEAVES ----------------
async function loadLeaves() {
    try {
        const res = await fetch(LEAVE_API);
        leaveList = await res.json();
        
        // Sort by newest first
        leaveList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        updateStats();
        applyFilters();
    } catch (error) {
        console.error('Error loading leaves:', error);
        showFlash('Error loading leave requests', 'danger');
        document.getElementById('leaveTable').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-5">
                    <i class="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
                    Failed to load leave requests. Please try again.
                </td>
            </tr>
        `;
    }
}

// ---------------- APPLY FILTERS ----------------
function applyFilters() {
    let filtered = [...leaveList];

    // Apply status filter
    if (currentFilter.status !== 'all') {
        filtered = filtered.filter(l => l.status === currentFilter.status);
    }

    // Apply date filter
    if (currentFilter.from) {
        const fromDate = new Date(currentFilter.from);
        fromDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(l => new Date(l.from_date) >= fromDate);
    }
    
    if (currentFilter.to) {
        const toDate = new Date(currentFilter.to);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(l => new Date(l.to_date) <= toDate);
    }

    // Apply search filter
    if (currentFilter.search) {
        const searchTerm = currentFilter.search.toLowerCase();
        filtered = filtered.filter(l => 
            (l.student_name && l.student_name.toLowerCase().includes(searchTerm)) ||
            (l.reason && l.reason.toLowerCase().includes(searchTerm))
        );
    }

    displayLeaves(filtered);
    document.getElementById('leaveCount').textContent = `${filtered.length} records`;
}

// ---------------- FILTER LEAVES BY STATUS ----------------
function filterLeaves(status) {
    currentFilter.status = status;
    currentPage = 1;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(status)) {
            tab.classList.add('active');
        }
    });
    
    applyFilters();
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
        status: 'all',
        from: null,
        to: null,
        search: ''
    };
    
    // Reset active tab to 'all'
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes('all')) {
            tab.classList.add('active');
        }
    });
    
    applyFilters();
}

// ---------------- SEARCH LEAVES ----------------
function searchLeaves() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    currentFilter.search = searchTerm;
    currentPage = 1;
    applyFilters();
}

// ---------------- DISPLAY LEAVES ----------------
function displayLeaves(leaves) {
    const tbody = document.getElementById('leaveTable');
    
    if (!leaves || leaves.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    No leave requests found.
                </td>
            </tr>
        `;
        return;
    }

    // Calculate pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedLeaves = leaves.slice(start, end);

    let html = '';
    paginatedLeaves.forEach((leave, index) => {
        const serialNo = start + index + 1;
        
        // Format dates
        const fromDate = new Date(leave.from_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const toDate = new Date(leave.to_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Calculate duration
        const start_date = new Date(leave.from_date);
        const end_date = new Date(leave.to_date);
        const duration = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24)) + 1;
        
        // Status badge class
        const statusClass = 
            leave.status === 'pending' ? 'status-pending' :
            leave.status === 'approved' ? 'status-approved' : 'status-rejected';
        
        // Reason preview
        const reasonPreview = leave.reason.length > 50 
            ? leave.reason.substring(0, 50) + '...' 
            : leave.reason;
        
        html += `
            <tr>
                <td><span class="fw-medium">${serialNo}</span></td>
                <td>
                    <div class="student-info">
                        <div class="student-avatar">
                            <i class="bi bi-person text-primary"></i>
                        </div>
                        <div>
                            <strong>${leave.student_name || 'Unknown'}</strong>
                            <br><small class="text-muted">${duration} day${duration > 1 ? 's' : ''}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <i class="bi bi-calendar3 me-2 text-muted"></i>
                    ${fromDate}
                </td>
                <td>
                    <i class="bi bi-calendar3 me-2 text-muted"></i>
                    ${toDate}
                </td>
                <td>
                    <div class="reason-preview" title="${leave.reason}">
                        ${reasonPreview}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${leave.status}
                    </span>
                </td>
                <td>
                    <div class="action-group">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewLeave('${leave._id}')" title="View Details">
                            <i class="bi bi-eye"></i>
                        </button>
                        
                        ${leave.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="updateLeave('${leave._id}', 'approved')" title="Approve">
                                <i class="bi bi-check-lg"></i> Approve
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="openRejectModal('${leave._id}')" title="Reject">
                                <i class="bi bi-x-lg"></i> Reject
                            </button>
                        ` : `
                            <button class="btn btn-warning btn-sm" onclick="updateLeave('${leave._id}', 'pending')" title="Reset to Pending">
                                <i class="bi bi-arrow-repeat"></i> Reset
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    updatePagination(leaves.length);
}

// ---------------- UPDATE STATISTICS ----------------
function updateStats() {
    const total = leaveList.length;
    const pending = leaveList.filter(l => l.status === 'pending').length;
    const approved = leaveList.filter(l => l.status === 'approved').length;
    const rejected = leaveList.filter(l => l.status === 'rejected').length;
    
    document.getElementById('totalLeaves').textContent = total;
    document.getElementById('pendingLeaves').textContent = pending;
    document.getElementById('approvedLeaves').textContent = approved;
    document.getElementById('rejectedLeaves').textContent = rejected;
}

// ---------------- VIEW LEAVE DETAILS ----------------
function viewLeave(id) {
    const leave = leaveList.find(l => l._id === id);
    
    if (leave) {
        // Format dates
        const fromDate = new Date(leave.from_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const toDate = new Date(leave.to_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const appliedOn = leave.createdAt ? new Date(leave.createdAt).toLocaleString() : 'N/A';
        
        // Calculate duration
        const start_date = new Date(leave.from_date);
        const end_date = new Date(leave.to_date);
        const duration = Math.ceil((end_date - start_date) / (1000 * 60 * 60 * 24)) + 1;
        
        // Status badge
        const statusClass = 
            leave.status === 'pending' ? 'status-pending' :
            leave.status === 'approved' ? 'status-approved' : 'status-rejected';
        
        document.getElementById('viewStudentName').textContent = leave.student_name || 'N/A';
        document.getElementById('viewFromDate').textContent = fromDate;
        document.getElementById('viewToDate').textContent = toDate;
        document.getElementById('viewDuration').textContent = `${duration} day${duration > 1 ? 's' : ''}`;
        document.getElementById('viewReason').textContent = leave.reason || 'No reason provided';
        document.getElementById('viewStatus').innerHTML = 
            `<span class="status-badge ${statusClass}">${leave.status}</span>`;
        document.getElementById('viewAppliedOn').textContent = appliedOn;
        
        new bootstrap.Modal(document.getElementById('viewModal')).show();
    }
}

// ---------------- UPDATE LEAVE STATUS ----------------
async function updateLeave(id, status) {
    try {
        const response = await fetch(`${LEAVE_API}/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            showFlash(`Leave request ${status} successfully`, 'success');
            loadLeaves();
        } else {
            showFlash('Failed to update leave status', 'danger');
        }
    } catch (error) {
        console.error('Error updating leave:', error);
        showFlash('Error updating leave status', 'danger');
    }
}

// ---------------- OPEN REJECT MODAL ----------------
function openRejectModal(id) {
    const leave = leaveList.find(l => l._id === id);
    
    if (leave) {
        const fromDate = new Date(leave.from_date).toLocaleDateString();
        const toDate = new Date(leave.to_date).toLocaleDateString();
        
        document.getElementById('rejectLeaveId').value = leave._id;
        document.getElementById('rejectStudentName').value = leave.student_name || 'Unknown';
        document.getElementById('rejectLeavePeriod').value = `${fromDate} to ${toDate}`;
        document.getElementById('rejectReason').value = '';
        
        new bootstrap.Modal(document.getElementById('rejectModal')).show();
    }
}

// ---------------- CONFIRM REJECT WITH REASON ----------------
async function confirmReject() {
    const id = document.getElementById('rejectLeaveId').value;
    const reason = document.getElementById('rejectReason').value.trim();
    
    if (!reason) {
        showFlash('Please provide a reason for rejection', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${LEAVE_API}/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                status: 'rejected',
                rejectionReason: reason 
            })
        });

        if (response.ok) {
            showFlash('Leave request rejected', 'success');
            bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide();
            loadLeaves();
        } else {
            showFlash('Failed to reject leave request', 'danger');
        }
    } catch (error) {
        console.error('Error rejecting leave:', error);
        showFlash('Error rejecting leave request', 'danger');
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