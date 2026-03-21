// Get logged-in student
const student = JSON.parse(localStorage.getItem("student"));
let allComplaints = [];
let currentPage = 1;
const itemsPerPage = 5;
let deleteId = null;

if (!student) {
    window.location.href = "/client/pages/admin/admin-login.html";
}

// Load complaints on page load
document.addEventListener("DOMContentLoaded", () => {
    loadComplaints();
});

// Load complaints from API
async function loadComplaints() {
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/student/${student._id}`);
        allComplaints = await response.json();
        
        // Sort by newest first
        allComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        updateStats();
        displayComplaints();
    } catch (error) {
        console.error('Error loading complaints:', error);
        showFlash('Error loading complaints', 'danger');
    }
}

// Update statistics
function updateStats() {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'pending').length;
    const resolved = allComplaints.filter(c => c.status === 'resolved').length;
    
    document.getElementById('totalComplaints').textContent = total;
    document.getElementById('pendingComplaints').textContent = pending;
    document.getElementById('resolvedComplaints').textContent = resolved;
    document.getElementById('complaintCount').textContent = `${total} records`;
}

// Display complaints in table
function displayComplaints() {
    const tbody = document.getElementById('complaintTable');
    
    if (allComplaints.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    No complaints found. Raise your first complaint!
                </td>
            </tr>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // Pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedComplaints = allComplaints.slice(start, end);
    
    let html = '';
    paginatedComplaints.forEach((complaint, index) => {
        const serialNo = start + index + 1;
        const date = new Date(complaint.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const statusClass = complaint.status === 'pending' ? 'status-pending' : 
                           complaint.status === 'resolved' ? 'status-resolved' : 'status-rejected';
        
        const description = complaint.description?.length > 50 
            ? complaint.description.substring(0, 50) + '...' 
            : complaint.description || 'No description';

        html += `
            <tr>
                <td>${serialNo}</td>
                <td class="fw-medium">${complaint.title || 'Untitled'}</td>
                <td>
                    <span title="${complaint.description || ''}">${description}</span>
                </td>
                <td>${date}</td>
                <td>
                    <span class="${statusClass}">${complaint.status}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary action-btn" onclick="viewComplaint('${complaint._id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${complaint.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-danger action-btn delete" onclick="deleteComplaint('${complaint._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(allComplaints.length / itemsPerPage);
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
    displayComplaints();
}

// Submit complaint
async function submitComplaint() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title || !description) {
        showFlash('Please fill in all fields', 'warning');
        return;
    }

    if (title.length < 5) {
        showFlash('Title must be at least 5 characters', 'warning');
        return;
    }

    if (description.length < 10) {
        showFlash('Description must be at least 10 characters', 'warning');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Submitting...';
    submitBtn.disabled = true;

    try {
        const response = await fetch("http://localhost:5000/api/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_id: student._id,
                student_name: student.name,
                title,
                description,
                status: "pending"
            })
        });

        if (response.ok) {
            showFlash('Complaint submitted successfully', 'success');
            document.getElementById('title').value = '';
            document.getElementById('description').value = '';
            await loadComplaints();
        } else {
            showFlash('Failed to submit complaint', 'danger');
        }
    } catch (error) {
        console.error('Error submitting complaint:', error);
        showFlash('Error submitting complaint', 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// View complaint
function viewComplaint(id) {
    const complaint = allComplaints.find(c => c._id === id);
    
    if (complaint) {
        document.getElementById('viewTitle').textContent = complaint.title || 'Untitled';
        document.getElementById('viewDescription').textContent = complaint.description || 'No description provided';
        document.getElementById('viewDate').textContent = new Date(complaint.createdAt).toLocaleString();
        
        const statusClass = complaint.status === 'pending' ? 'status-pending' : 
                           complaint.status === 'resolved' ? 'status-resolved' : 'status-rejected';
        document.getElementById('viewStatus').innerHTML = 
            `<span class="${statusClass}">${complaint.status}</span>`;
        
        new bootstrap.Modal(document.getElementById('viewModal')).show();
    }
}

// Delete complaint
function deleteComplaint(id) {
    deleteId = id;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function confirmDelete() {
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/${deleteId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            showFlash('Complaint deleted successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            await loadComplaints();
        } else {
            showFlash('Failed to delete complaint', 'danger');
        }
    } catch (error) {
        console.error('Error deleting complaint:', error);
        showFlash('Error deleting complaint', 'danger');
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