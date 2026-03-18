const API = "http://localhost:5000/api/college";

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    updateLastUpdated();
});

// 🔹 Load existing data
async function loadSettings() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        if (!data) return;

        document.getElementById("collegeName").value = data.name || "";
        document.getElementById("collegeAddress").value = data.address || "";
        document.getElementById("collegePhone").value = data.phone || "";
        document.getElementById("collegeEmail").value = data.email || "";
        
        // Optional fields
        document.getElementById("collegeWebsite").value = data.website || "";
        document.getElementById("establishedYear").value = data.establishedYear || "";
        
        // Update college name display in topbar
        if (data.name) {
            document.getElementById("collegeNameDisplay").innerHTML = 
                `<i class="bi bi-building me-1"></i>${data.name}`;
        }
        
        // Update last updated time from data or set current
        if (data.updatedAt) {
            const updated = new Date(data.updatedAt);
            document.getElementById("lastUpdated").textContent = 
                updated.toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit'
                });
        }

    } catch (err) {
        console.error("Error loading settings:", err);
        showFlash("Error loading settings", "danger");
    }
}

// 🔹 Save / Update
document.getElementById("settingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get required fields
    const name = document.getElementById("collegeName").value.trim();
    const address = document.getElementById("collegeAddress").value.trim();
    
    // Validate required fields
    if (!name || !address) {
        showFlash("College Name and Address are required", "warning");
        return;
    }

    const payload = {
        name: name,
        address: address,
        phone: document.getElementById("collegePhone").value.trim(),
        email: document.getElementById("collegeEmail").value.trim(),
        website: document.getElementById("collegeWebsite").value.trim(),
        establishedYear: document.getElementById("establishedYear").value
    };

    // Optional: Email validation
    if (payload.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            showFlash("Please enter a valid email address", "warning");
            return;
        }
    }

    // Optional: Phone validation
    if (payload.phone) {
        const phoneRegex = /^[\d\s\-+()]{10,}$/;
        if (!phoneRegex.test(payload.phone.replace(/\s/g, ''))) {
            showFlash("Please enter a valid phone number", "warning");
            return;
        }
    }

    try {
        const res = await fetch(API, {
            method: "POST", // can use PUT if you prefer
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            showFlash("Settings saved successfully", "success");
            
            // Update last updated time
            const now = new Date();
            document.getElementById("lastUpdated").textContent = 
                now.toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit'
                });
            
            // Update college name in topbar
            if (payload.name) {
                document.getElementById("collegeNameDisplay").innerHTML = 
                    `<i class="bi bi-building me-1"></i>${payload.name}`;
            }
            
            // Reload to get updated data
            loadSettings();
        } else {
            showFlash(data.error || "Error saving settings", "danger");
        }

    } catch (err) {
        console.error(err);
        showFlash("Server error. Please try again.", "danger");
    }
});

// 🔹 Reset Form
function resetForm() {
    if (confirm("Reset all changes? Any unsaved data will be lost.")) {
        loadSettings(); // Reload original data
        showFlash("Form reset to saved values", "info");
    }
}

// 🔹 Update last updated display
function updateLastUpdated() {
    const lastUpdated = document.getElementById("lastUpdated");
    if (lastUpdated.textContent === "Never") {
        // Try to load from localStorage or keep as Never
        const saved = localStorage.getItem("lastSettingsUpdate");
        if (saved) {
            lastUpdated.textContent = saved;
        }
    }
}

// 🔹 Flash Message
function showFlash(message, type) {
    const flash = document.getElementById("flashMessage");
    const text = document.getElementById("flashText");
    const icon = type === 'success' ? 'bi-check-circle-fill' : 
                 type === 'danger' ? 'bi-exclamation-triangle-fill' :
                 type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';

    // Set icon based on message type
    flash.innerHTML = `<i class="bi ${icon} me-2"></i><span id="flashText">${message}</span>`;
    
    flash.className = `alert alert-${type} position-fixed top-0 end-0 m-4 shadow-lg`;
    flash.classList.remove("d-none");

    // Save last update time on success
    if (type === 'success') {
        const now = new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
        localStorage.setItem("lastSettingsUpdate", now);
    }

    setTimeout(() => {
        flash.classList.add("d-none");
    }, 3000);
}

// Make resetForm available globally
window.resetForm = resetForm;