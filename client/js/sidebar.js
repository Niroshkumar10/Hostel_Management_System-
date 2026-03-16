async function loadSidebar(){

const res = await fetch("/client/components/sidebar.html");
const data = await res.text();

document.getElementById("sidebar-container").innerHTML = data;

}

loadSidebar();

function logout(){

localStorage.removeItem("adminLoggedIn");

window.location.href="/client/pages/admin-login.html";

}