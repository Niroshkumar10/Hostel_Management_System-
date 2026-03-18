async function loadDashboard() {
  try {

    // ---------------- STUDENTS ----------------
    const studentRes = await fetch("http://localhost:5000/api/students");
    const students = await studentRes.json();

    document.getElementById("totalStudents").innerText = students.length;


    // ---------------- ROOMS ----------------
    const roomRes = await fetch("http://localhost:5000/api/rooms");
    const rooms = await roomRes.json();

    document.getElementById("totalRooms").innerText = rooms.length;

    let totalBeds = 0;
    let occupiedBeds = 0;

    rooms.forEach(room => {
      totalBeds += room.capacity || 0;
      occupiedBeds += room.occupied || 0;
    });

    const availableBeds = totalBeds - occupiedBeds;
    document.getElementById("availableBeds").innerText = availableBeds;


    // ---------------- RECENT STUDENTS ----------------
    const studentTable = document.getElementById("recentStudents");

    if (studentTable) {
      studentTable.innerHTML = "";

      students.slice(-5).reverse().forEach((student, index) => {

        let roomText = student.room_id
          ? `Room ${student.room_id.roomNumber} (Floor ${student.room_id.floor})`
          : "Not Assigned";

        studentTable.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${student.name || "N/A"}</td>
            <td>${student.department || "N/A"}</td>
            <td>${roomText}</td>
          </tr>
        `;
      });
    }


    // ---------------- ROOM OVERVIEW ----------------
    const roomTable = document.getElementById("recentRooms");

    if (roomTable) {
      roomTable.innerHTML = "";

      rooms.slice(0, 5).forEach(room => {

        const occupied = room.occupied || 0;
        const available = (room.capacity || 0) - occupied;

        let status = available === 0
          ? `<span class="text-danger fw-bold">Full</span>`
          : `<span class="text-success">${available} Beds</span>`;

        roomTable.innerHTML += `
          <tr>
            <td>Room ${room.roomNumber}</td>
            <td>Floor ${room.floor}</td>
            <td>${status}</td>
          </tr>
        `;
      });
    }

  } catch (err) {
    console.error("Dashboard Load Error:", err);
  }
}

loadDashboard();