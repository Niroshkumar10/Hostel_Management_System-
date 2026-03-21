async function loadSidebar(activePage) {
  try {
    const res = await fetch("/client/components/student-sidebar.html");
    const data = await res.text();

    document.getElementById("sidebar-container").innerHTML = data;

    // ✅ Highlight active menu
    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => {
      if (link.dataset.page === activePage) {
        link.classList.add("active");
      }
    });

  } catch (err) {
    console.error("Sidebar load error:", err);
  }
}

async function loadSidebar(activePage) {
  try {
    const res = await fetch("/client/components/student-sidebar.html");
    const data = await res.text();

    document.getElementById("sidebar-container").innerHTML = data;

    // ✅ Highlight active menu
    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => {
      if (link.dataset.page === activePage) {
        link.classList.add("active");
      }
    });

    // ✅ 🔥 SET STUDENT NAME
    const student = JSON.parse(localStorage.getItem("student"));

    if (student && student.name) {
      document.getElementById("sidebarStudentName").innerHTML = `
        <i class="bi bi-person-circle"></i> ${student.name}
      `;
    }

  } catch (err) {
    console.error("Sidebar load error:", err);
  }
}