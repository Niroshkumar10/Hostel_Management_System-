// API Base URL
const API_URL = "http://localhost:5000/api/complaints";

// Global variables
let allComplaints = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 10;

// Load complaints on page load
document.addEventListener('DOMContentLoaded', () => {
    loadComplaints();
});

// 📥 LOAD COMPLAINTS
async function loadComplaints() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Sort by newest first
        allComplaints = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        updateStats();
        filterComplaints(currentFilter);
        showFlash('Complaints loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading complaints:', error);
        showFlash('Error loading complaints', 'danger');
        document.getElementById('complaintTable').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <i class="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
                    Failed to load complaints. Please try again.
                </td>
            </tr>
        `;
    }
}

// 🔍 FILTER COMPLAINTS
function filterComplaints(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(filter)) {
            tab.classList.add('active');
        }
    });
    
    let filtered = allComplaints;
    if (filter !== 'all') {
        filtered = allComplaints.filter(c => c.status === filter);
    }
    
    displayComplaints(filtered);
    document.getElementById('complaintCount').textContent = `${filtered.length} records`;
}

// 📊 UPDATE STATISTICS
function updateStats() {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'pending').length;
    const resolved = allComplaints.filter(c => c.status === 'resolved').length;
    
    // Count unique students
    const uniqueStudents = new Set(allComplaints.map(c => c.student_id)).size;
    
    document.getElementById('totalComplaints').textContent = total;
    document.getElementById('pendingComplaints').textContent = pending;
    document.getElementById('resolvedComplaints').textContent = resolved;
    document.getElementById('totalStudents').textContent = uniqueStudents;
}

// 📋 DISPLAY COMPLAINTS IN TABLE
function displayComplaints(complaints) {
    const tbody = document.getElementById('complaintTable');
    
    if (!complaints || complaints.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    No complaints found.
                </td>
            </tr>
        `;
        return;
    }
    
    // Calculate pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedComplaints = complaints.slice(start, end);
    
    let html = '';
    paginatedComplaints.forEach((complaint, index) => {
        const serialNo = start + index + 1;
        const statusClass = complaint.status === 'pending' ? 'status-pending' : 'status-resolved';
        
        html += `
            <tr>
                <td><span class="fw-medium">${serialNo}</span></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                            <i class="bi bi-person text-primary" style="font-size: 0.8rem;"></i>
                        </div>
                        <div>
                            <strong>${complaint.student_name || 'Unknown'}</strong>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="fw-medium">${complaint.title || 'No title'}</div>
                    ${complaint.description ? 
                        `<small class="text-muted d-block">${complaint.description.substring(0, 30)}${complaint.description.length > 30 ? '...' : ''}</small>` 
                        : ''
                    }
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${complaint.status}
                    </span>
                </td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="action-btn btn-view" onclick="viewComplaint('${complaint._id}')">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button class="action-btn btn-toggle" onclick="updateStatus('${complaint._id}', '${complaint.status}')">
                            <i class="bi bi-arrow-repeat"></i> Toggle
                        </button>
                        <button class="action-btn btn-delete" onclick="deleteComplaint('${complaint._id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    updatePagination(complaints.length);
}

// 📄 UPDATE PAGINATION
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

// 🔄 GO TO PAGE
function goToPage(page) {
    currentPage = page;
    filterComplaints(currentFilter);
}

// 🔄 UPDATE STATUS
async function updateStatus(id, currentStatus) {
    try {
        const newStatus = currentStatus === "pending" ? "resolved" : "pending";
        
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showFlash(`Complaint marked as ${newStatus}`, 'success');
            loadComplaints(); // Reload the list
        } else {
            showFlash('Failed to update status', 'danger');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showFlash('Error updating status', 'danger');
    }
}

// ❌ DELETE COMPLAINT
async function deleteComplaint(id) {
    if (!confirm('Are you sure you want to delete this complaint?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        
        if (response.ok) {
            showFlash('Complaint deleted successfully', 'success');
            loadComplaints(); // Reload the list
        } else {
            showFlash('Failed to delete complaint', 'danger');
        }
    } catch (error) {
        console.error('Error deleting complaint:', error);
        showFlash('Error deleting complaint', 'danger');
    }
}

// 👁️ VIEW COMPLAINT DETAILS
function viewComplaint(id) {
    const complaint = allComplaints.find(c => c._id === id);
    
    if (complaint) {
        document.getElementById('viewStudentName').textContent = complaint.student_name || 'N/A';
        document.getElementById('viewTitle').textContent = complaint.title || 'N/A';
        document.getElementById('viewDescription').textContent = complaint.description || 'No description provided';
        
        const statusClass = complaint.status === 'pending' ? 'status-pending' : 'status-resolved';
        document.getElementById('viewStatus').innerHTML = 
            `<span class="status-badge ${statusClass}">${complaint.status}</span>`;
        
        const date = complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A';
        document.getElementById('viewDate').textContent = date;
        
        const modal = new bootstrap.Modal(document.getElementById('viewModal'));
        modal.show();
    }
}

// 🔍 SEARCH COMPLAINTS
function searchComplaints() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filterComplaints(currentFilter);
        return;
    }
    
    const filtered = allComplaints.filter(complaint => 
        (complaint.student_name && complaint.student_name.toLowerCase().includes(searchTerm)) ||
        (complaint.title && complaint.title.toLowerCase().includes(searchTerm)) ||
        (complaint.description && complaint.description.toLowerCase().includes(searchTerm))
    );
    
    displayComplaints(filtered);
    document.getElementById('complaintCount').textContent = `${filtered.length} records (filtered)`;
}

// 💬 SHOW FLASH MESSAGE
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