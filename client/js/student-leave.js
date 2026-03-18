const studentId = localStorage.getItem("studentId");
const studentName = localStorage.getItem("studentName");


// ➕ APPLY LEAVE
async function applyLeave() {
  const from_date = document.getElementById("from_date").value;
  const to_date = document.getElementById("to_date").value;
  const reason = document.getElementById("reason").value;

  if (!from_date || !to_date) {
    alert("Select dates");
    return;
  }

  await fetch("http://localhost:5000/api/leaves", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      student_id: studentId,
      student_name: studentName,
      from_date,
      to_date,
      reason
    })
  });

  alert("Leave Applied");
  loadLeaves();
}


// 📥 LOAD LEAVES
async function loadLeaves() {
  const res = await fetch(`http://localhost:5000/api/leaves/student/${studentId}`);
  const data = await res.json();

  const table = document.getElementById("leaveTable");
  table.innerHTML = "";

  data.forEach((l, index) => {
    table.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${new Date(l.from_date).toLocaleDateString()}</td>
        <td>${new Date(l.to_date).toLocaleDateString()}</td>
        <td>
          <span style="
            padding:5px 10px;
            border-radius:5px;
            color:white;
            background:
              ${l.status === 'pending' ? 'orange' :
                l.status === 'approved' ? 'green' : 'red'}
          ">
            ${l.status}
          </span>
        </td>
      </tr>
    `;
  });
}

document.addEventListener("DOMContentLoaded", loadLeaves);