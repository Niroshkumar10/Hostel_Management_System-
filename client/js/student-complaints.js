const studentId = "PUT_STUDENT_ID_HERE"; // replace dynamically later
const studentName = "Nirosh"; // replace dynamically later


// ➕ SUBMIT
async function submitComplaint() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  await fetch("http://localhost:5000/api/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId,
      student_name: studentName,
      title,
      description
    })
  });

  loadMyComplaints();
}


// 📥 LOAD MY COMPLAINTS
async function loadMyComplaints() {
  const res = await fetch(`http://localhost:5000/api/complaints/student/${studentId}`);
  const data = await res.json();

  const list = document.getElementById("myComplaints");
  list.innerHTML = "";

  data.forEach(c => {
    list.innerHTML += `
      <li>
        ${c.title} - 
        <b style="color:${c.status === 'pending' ? 'red' : 'green'}">
          ${c.status}
        </b>
      </li>
    `;
  });
}

loadMyComplaints();