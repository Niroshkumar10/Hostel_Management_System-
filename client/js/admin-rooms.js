let rooms = [];
let editRoomId = null;

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("roomForm");
    if (form) {
        form.addEventListener("submit", async function(e) {
            e.preventDefault();

            // Get form values
            const room_number = document.getElementById("room_number").value;
            const floor_id = document.getElementById("floor").value;
            const capacity = document.getElementById("capacity").value;

            // Validate inputs
            if (!room_number || !floor_id || !capacity) {
                showFlash("Please fill in all fields", "danger");
                return;
            }

           const room = {
                            roomNumber: room_number,
                            floor: parseInt(floor_id),
                            capacity: parseInt(capacity)
                        };

            console.log("Sending room data:", room);

            try {
                let url = "http://localhost:5000/api/rooms";
                let method = "POST";

                if (editRoomId) {
                    url = `http://localhost:5000/api/rooms/${editRoomId}`;
                    method = "PUT";
                }

                const res = await fetch(url, {
                    method: method,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(room)
                });

                const data = await res.json();
                console.log("Server response:", data);

                if (!res.ok) {
                    showFlash(data.message || "Error occurred", "danger");
                    return;
                }

                showFlash(editRoomId ? "Room Updated Successfully" : "Room Added Successfully", "success");

                await loadRooms();

                form.reset();
                editRoomId = null;
                const submitBtn = document.querySelector("#roomForm button");
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Add Room';
                }

            } catch (err) {
                console.error("Fetch error:", err);
                showFlash("Server Error - Check console", "danger");
            }
        });
    }

    // Initial load
    loadRooms();
});

function showFlash(message, type = "success") {
    const flash = document.getElementById("flashMessage");
    const flashText = document.getElementById("flashText");
    
    if (!flash || !flashText) return;
    
    flashText.innerText = message;
    flash.className = `alert alert-${type} position-fixed top-0 end-0 m-4 shadow`;
    flash.classList.remove("d-none");

    setTimeout(() => {
        flash.classList.add("d-none");
    }, 3000);
}

async function loadRooms() {
    try {
        const res = await fetch("http://localhost:5000/api/rooms");
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        rooms = await res.json();
        console.log("Loaded rooms:", rooms);

        const table = document.getElementById("roomTable");
        if (!table) return;
        
        table.innerHTML = "";

        if (rooms.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-5">
                        <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                        No rooms found. Add your first room!
                    </td>
                </tr>
            `;
        } else {
            rooms.forEach((room, index) => {
                // Safely access properties with defaults
                const roomNumber = room.roomNumber || 'N/A';
                const floorId = room.floor !== undefined ? room.floor : 'N/A';
                const capacity = room.capacity !== undefined ? room.capacity : 0;
                const occupied = room.occupied !== undefined ? room.occupied : 0;
                
                const available = capacity - occupied;
                let status = available <= 0 
                    ? `<span class="badge bg-danger">Full</span>`
                    : `<span class="badge bg-success">${available} Bed${available !== 1 ? 's' : ''}</span>`;
                
                table.innerHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${roomNumber}</td>
                        <td>${floorId}</td>
                        <td>${capacity}</td>
                        <td>${occupied}</td>
                        <td>${status}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editRoom('${room._id}')">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteRoom('${room._id}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        // Update room count
        const roomCountEl = document.getElementById('roomCount');
        if (roomCountEl) {
            roomCountEl.textContent = `${rooms.length} record${rooms.length !== 1 ? 's' : ''}`;
        }
        
        updateStats();

    } catch (err) {
        console.error('Error loading rooms:', err);
        showFlash("Error loading rooms - Check console", "danger");
    }
}

function updateStats() {
    try {
        let totalBeds = 0;
        let occupiedBeds = 0;
        let fullRooms = 0;
        const floors = new Set();

        rooms.forEach(room => {
            const capacity = room.capacity || 0;
            const occupied = room.occupied || 0;
            
            totalBeds += capacity;
            occupiedBeds += occupied;
            
            if (room.floor_id !== undefined) {
                floors.add(room.floor_id);
            }
            
            if (occupied >= capacity && capacity > 0) {
                fullRooms++;
            }
        });

        const availableBeds = totalBeds - occupiedBeds;
        const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

        // Update stats elements
        const statsMap = {
            'totalRooms': rooms.length,
            'totalBeds': totalBeds,
            'occupiedBeds': occupiedBeds,
            'availableBeds': availableBeds,
            'totalFloors': floors.size,
            'fullRooms': fullRooms
        };

        for (const [id, value] of Object.entries(statsMap)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
        
        const occupancyEl = document.getElementById('occupancyPercentage');
        if (occupancyEl) occupancyEl.textContent = `${occupancyPercent}%`;
        
        const barEl = document.getElementById('occupancyBar');
        if (barEl) barEl.style.width = `${occupancyPercent}%`;

    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

function editRoom(id) {
    const room = rooms.find(r => r._id === id);
    if (room) {
        document.getElementById("room_number").value = room.room_number || '';
        document.getElementById("floor").value = room.floor_id || '';
        document.getElementById("capacity").value = room.capacity || '';

        editRoomId = id;
        const submitBtn = document.querySelector("#roomForm button");
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="bi bi-pencil me-2"></i>Update Room';
        }
        
        // Scroll to form
        const formSection = document.querySelector('.col-lg-4');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

async function deleteRoom(id) {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok) {
            showFlash(data.message || "Error deleting room", "danger");
            return;
        }

        showFlash("Room Deleted Successfully", "success");
        await loadRooms();

    } catch (err) {
        console.error("Error deleting room:", err);
        showFlash("Server Error - Check console", "danger");
    }
}

function searchRoom() {
    const input = document.getElementById("searchRoom");
    if (!input) return;
    
    const searchTerm = input.value.toLowerCase();
    const rows = document.querySelectorAll("#roomTable tr");

    rows.forEach(row => {
        // Skip the "No rooms found" row
        if (row.cells.length === 1 && row.cells[0].colSpan === 7) return;
        
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
    });
}

// Reset form function
function resetForm() {
    document.getElementById("roomForm").reset();
    editRoomId = null;
    const submitBtn = document.querySelector("#roomForm button");
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Add Room';
    }
}