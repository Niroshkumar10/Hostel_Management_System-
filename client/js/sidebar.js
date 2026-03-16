// /client/js/sidebar.js

async function loadSidebar() {
    try {
        const res = await fetch("/client/components/sidebar.html");
        const data = await res.text();
        
        // Insert sidebar into container
        const container = document.getElementById("sidebar-container");
        if (container) {
            container.innerHTML = data;
            
            // Highlight current page after sidebar is loaded
            highlightCurrentPage();
        }
    } catch (error) {
        console.error("Error loading sidebar:", error);
    }
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.sidebar-link');
    
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
        
        // Also check if current page ends with the href (for relative paths)
        if (currentPath.endsWith(href) && href !== '/') {
            link.classList.add('active');
        }
    });
}

// Logout function
function logout() {
    // Clear all auth data
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    
    // Redirect to login
    window.location.href = "/client/pages/admin-login.html";
}

// Load sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadSidebar();
});

// Optional: Add active class on click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('sidebar-link') || e.target.closest('.sidebar-link')) {
        const link = e.target.closest('.sidebar-link');
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
});