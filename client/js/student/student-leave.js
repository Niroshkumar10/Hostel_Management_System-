// Get logged-in student
const student = JSON.parse(localStorage.getItem("student"));
let allLeaves = [];
let currentPage = 1;
const itemsPerPage = 5;
let currentFilter = 'all';
let deleteId = null;

if (!student) {
    window.location.href = "/client/pages/admin/admin-login.html";
}

// Load leaves on page load
document.addEventListener("DOMContentLoaded", () => {
    loadLeaves();
});

// Load leaves from API
async function loadLeaves() {
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/student/${student._id}`);
        allLeaves = await response.json();
        
        // Sort by newest first
        allLeaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        updateStats();
        filterLeaves(currentFilter);
    } catch (error) {
        console.error('Error loading leaves:', error);
        showFlash('Error loading leave requests', 'danger');
    }
}

// Update statistics
function updateStats() {
    const total = allLeaves.length;
    const pending = allLeaves.filter(l => l.status === 'pending').length;
    const approved = allLeaves.filter(l => l.status === 'approved').length;
    const rejected = allLeaves.filter(l => l.status === 'rejected').length;
    
    document.getElementById('totalLeaves').textContent = total;
    document.getElementById('pendingLeaves').textContent = pending;
    document.getElementById('approvedLeaves').textContent = approved;
    document.getElementById('rejectedLeaves').textContent = rejected;
    document.getElementById('leaveCount').textContent = `${total} records`;
}

// Calculate duration between dates
function calculateDuration(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// Update duration display
function updateDuration() {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const durationInfo = document.getElementById("durationInfo");
    
    if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        if (to >= from) {
            const days = calculateDuration(fromDate, toDate);
            document.getElementById("durationDays").innerText = days + ' day' + (days > 1 ? 's' : '');
            durationInfo.style.display = 'block';
        } else {
            showFlash("To date must be after from date", "warning");
            durationInfo.style.display = 'none';
        }
    } else {
        durationInfo.style.display = 'none';
    }
}

// Add event listeners for date inputs
document.getElementById("fromDate")?.addEventListener('change', updateDuration);
document.getElementById("toDate")?.addEventListener('change', updateDuration);

// Filter leaves by status
function filterLeaves(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase() === filter) {
            tab.classList.add('active');
        }
    });

    let filteredLeaves = allLeaves;
    if (filter !== 'all') {
        filteredLeaves = allLeaves.filter(l => l.status === filter);
    }

    displayLeaves(filteredLeaves);
}

// Display leaves in table
function displayLeaves(leaves) {
    const tbody = document.getElementById('leaveTable');
    
    if (leaves.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    No leave requests found. Apply for your first leave!
                </td>
            </tr>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // Pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedLeaves = leaves.slice(start, end);
    
    let html = '';
    paginatedLeaves.forEach((leave, index) => {
        const serialNo = start + index + 1;
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
        const duration = calculateDuration(leave.from_date, leave.to_date);
        
        const statusClass = leave.status === 'approved' ? 'status-approved' : 
                           leave.status === 'pending' ? 'status-pending' : 'status-rejected';
        
        const reason = leave.reason?.length > 30 
            ? leave.reason.substring(0, 30) + '...' 
            : leave.reason || 'No reason';

        html += `
            <tr>
                <td>${serialNo}</td>
                <td>${fromDate}</td>
                <td>${toDate}</td>
                <td>${duration} day${duration > 1 ? 's' : ''}</td>
                <td>
                    <span title="${leave.reason || ''}">${reason}</span>
                </td>
                <td>
                    <span class="${statusClass}">${leave.status}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary action-btn" onclick="viewLeave('${leave._id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${leave.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-danger action-btn delete" onclick="deleteLeave('${leave._id}')">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    updatePagination(leaves.length);
}

// Update pagination
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
                <button class="page-link" onclick="goToPage(${i})">${i}</button>
            </li>
        `;
    }
    
    pagination.innerHTML = html;
}

// Go to page
function goToPage(page) {
    currentPage = page;
    filterLeaves(currentFilter);
}

// Submit leave request
async function submitLeave() {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const reason = document.getElementById("leaveReason").value.trim();

    if (!fromDate || !toDate || !reason) {
        showFlash('Please fill in all fields', 'warning');
        return;
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (from < today) {
        showFlash('From date cannot be in the past', 'warning');
        return;
    }

    if (to < from) {
        showFlash('To date must be after from date', 'warning');
        return;
    }

    if (reason.length < 10) {
        showFlash('Please provide a detailed reason (minimum 10 characters)', 'warning');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch("http://localhost:5000/api/leaves", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id: student._id,
                student_name: student.name,
                from_date: fromDate,
                to_date: toDate,
                reason,
                status: "pending"
            })
        });

        if (response.ok) {
            showFlash('Leave request submitted successfully', 'success');
            document.getElementById('fromDate').value = '';
            document.getElementById('toDate').value = '';
            document.getElementById('leaveReason').value = '';
            document.getElementById('durationInfo').style.display = 'none';
            await loadLeaves();
        } else {
            showFlash('Failed to submit leave request', 'danger');
        }
    } catch (error) {
        console.error('Error submitting leave:', error);
        showFlash('Error submitting leave request', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// View leave details
function viewLeave(id) {
    const leave = allLeaves.find(l => l._id === id);
    
    if (leave) {
        document.getElementById('viewFromDate').textContent = new Date(leave.from_date).toLocaleDateString();
        document.getElementById('viewToDate').textContent = new Date(leave.to_date).toLocaleDateString();
        document.getElementById('viewDuration').textContent = calculateDuration(leave.from_date, leave.to_date) + ' days';
        document.getElementById('viewReason').textContent = leave.reason || 'No reason provided';
        document.getElementById('viewDate').textContent = new Date(leave.createdAt).toLocaleString();
        
        const statusClass = leave.status === 'approved' ? 'status-approved' : 
                           leave.status === 'pending' ? 'status-pending' : 'status-rejected';
        document.getElementById('viewStatus').innerHTML = 
            `<span class="${statusClass}">${leave.status}</span>`;
        
        new bootstrap.Modal(document.getElementById('viewModal')).show();
    }
}

// Delete/Cancel leave request
function deleteLeave(id) {
    deleteId = id;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function confirmDelete() {
    try {
        const response = await fetch(`http://localhost:5000/api/leaves/${deleteId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showFlash('Leave request cancelled successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            await loadLeaves();
        } else {
            showFlash('Failed to cancel leave request', 'danger');
        }
    } catch (error) {
        console.error('Error cancelling leave:', error);
        showFlash('Error cancelling leave request', 'danger');
    }
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