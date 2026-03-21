// 🔒 Get logged-in student
const student = JSON.parse(localStorage.getItem("student"));

if (!student) {
    showFlash("Please login first", "danger");
    setTimeout(() => {
        window.location.href = "/client/pages/admin/admin-login.html";
    }, 2000);
}

// 🚀 LOAD EVERYTHING
async function loadRoomDetails() {
    const roomContainer = document.getElementById("roomInfo");

    if (!student.room_id) {
        roomContainer.innerHTML = `
            <div class="room-header-card">
                <div class="room-header-content">
                    <div class="room-icon">
                        <i class="bi bi-house-exclamation"></i>
                    </div>
                    <div class="room-info">
                        <h2>No Room Assigned</h2>
                        <p><i class="bi bi-info-circle"></i> Please contact admin for room allocation</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById("roommatesList").innerHTML = `
            <div class="empty-state">
                <i class="bi bi-people"></i>
                <p>No roommates to display</p>
            </div>
        `;
        
        document.getElementById("roomComplaints").innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <p>No complaints to display</p>
            </div>
        `;
        
        document.getElementById("roommateCount").innerText = "0";
        document.getElementById("complaintCount").innerText = "0";
        return;
    }

    const room = student.room_id;
    const available = room.capacity - (room.occupied || 0);

    // ---------------- ROOM INFO ----------------
    roomContainer.innerHTML = `
        <div class="room-header-card">
            <div class="room-header-content">
                <div class="room-icon">
                    <i class="bi bi-door-open"></i>
                </div>
                <div class="room-info">
                    <h2>Room ${room.roomNumber}</h2>
                    <p><i class="bi bi-geo-alt"></i> Floor ${room.floor}</p>
                </div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-item">
                <h6>Floor</h6>
                <h3>${room.floor}</h3>
            </div>
            <div class="stat-item">
                <h6>Total Capacity</h6>
                <h3>${room.capacity}</h3>
            </div>
            <div class="stat-item">
                <h6>Occupied</h6>
                <h3>${room.occupied || 0}</h3>
            </div>
            <div class="stat-item">
                <h6>Available</h6>
                <h3>${available}</h3>
            </div>
        </div>
    `;

    // ---------------- ROOMMATES ----------------
    loadRoommates(room._id);

    // ---------------- COMPLAINTS ----------------
    loadRoomComplaints();
}

// 👥 ROOMMATES
async function loadRoommates(roomId) {
    const container = document.getElementById("roommatesList");

    try {
        const res = await fetch(`http://localhost:5000/api/students/roommates/${roomId}`);
        const data = await res.json();

        document.getElementById("roommateCount").innerText = data.length;

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-people"></i>
                    <p>No roommates found</p>
                </div>
            `;
            return;
        }

        let html = '';
        data.forEach((s) => {
            const initial = s.name ? s.name.charAt(0).toUpperCase() : 'S';
            
            html += `
                <div class="roommate-card">
                    <div class="roommate-avatar">${initial}</div>
                    <div class="roommate-info">
                        <h6>${s.name || 'Unknown'}</h6>
                        <p>${s.department || 'N/A'} • Year ${s.year || 'N/A'}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle text-danger"></i>
                <p class="text-danger">Error loading roommates</p>
            </div>
        `;
    }
}

// ⚠️ ROOM COMPLAINTS
async function loadRoomComplaints() {
    const container = document.getElementById("roomComplaints");

    try {
        const res = await fetch(`http://localhost:5000/api/complaints/student/${student._id}`);
        const data = await res.json();

        document.getElementById("complaintCount").innerText = data.length;

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>No complaints found</p>
                </div>
            `;
            return;
        }

        // Get only last 3 complaints
        const recentComplaints = data.slice(0, 3);

        let html = '';
        recentComplaints.forEach(complaint => {
            const statusClass = complaint.status === 'resolved' ? 'status-resolved' : 'status-pending';
            const date = new Date(complaint.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            html += `
                <div class="complaint-item">
                    <div class="complaint-header">
                        <h6>
                            <i class="bi bi-exclamation-circle"></i>
                            ${complaint.title || 'Untitled'}
                        </h6>
                        <span class="status-badge ${statusClass}">${complaint.status}</span>
                    </div>
                    <div class="complaint-text">
                        ${complaint.description || 'No description'}
                    </div>
                    <div class="complaint-date">
                        <i class="bi bi-clock"></i>
                        ${date}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle text-danger"></i>
                <p class="text-danger">Error loading complaints</p>
            </div>
        `;
    }
}

// Show flash message
function showFlash(message, type) {
    const flashDiv = document.getElementById('flashMessage');
    const flashText = document.getElementById('flashText');
    
    flashDiv.className = `alert alert-${type} position-fixed top-0 end-0 m-4 shadow`;
    flashText.textContent = message;
    flashDiv.classList.remove('d-none');
    
    setTimeout(() => {
        flashDiv.classList.add('d-none');
    }, 3000);
}

// INIT
document.addEventListener("DOMContentLoaded", loadRoomDetails);