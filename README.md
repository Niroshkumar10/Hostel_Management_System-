# Hostel Management System (HMS)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%3E%3D4.0-brightgreen)](https://www.mongodb.com/)

A comprehensive web-based Hostel Management System designed to streamline hostel operations including student registration, room allocation, attendance tracking, complaint handling, leave management, fee collection, and reporting. Built with the MERN stack (MongoDB, Express.js, Node.js) and vanilla JavaScript frontend.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Student)
- Secure password hashing with bcrypt

### 🏠 Room Management
- Add, edit, delete rooms
- Room capacity and occupancy tracking
- Room assignment to students

### 👨‍🎓 Student Management
- Student registration with personal details
- Room allocation
- View student profiles, contact, academic info

### 💰 Fee Management
- Fee payment records
- Monthly/semester tracking
- Payment status (paid/pending)

### 🍽️ Attendance Management
- Mark daily attendance (present/absent)
- Filter by date and month
- Attendance percentage calculation

### 🛎️ Complaint Management
- Students raise complaints (Plumbing, Electricity, Cleaning, etc.)
- Status tracking (pending, resolved, rejected)
- Admin resolution

### 🌴 Leave Management
- Students apply for leave
- Admin approval/rejection workflow
- Leave history with reason

### 📊 Dashboard & Reports
- Real-time statistics (total students, rooms, complaints, leaves, fees)
- Recent activities feed
- Export reports (PDF/Excel)

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | HTML5, CSS3, Bootstrap 5, JavaScript, Font Awesome |
| Backend        | Node.js, Express.js                 |
| Database       | MongoDB, Mongoose ODM               |
| Authentication | JSON Web Tokens (JWT), bcrypt       |
| Development    | Nodemon, Postman                    |
| Version Control| Git                                 |

## 📦 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher) – local or cloud (MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hostel-management-system.git
   cd hostel-management-system
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies** (if any)
   ```bash
   cd ../client
   # No npm install needed for static files
   ```

4. **Set up environment variables** (see next section)

5. **Start MongoDB** (local installation or use MongoDB Atlas)

6. **Seed initial data** (optional – create default admin and test data)
   ```bash
   cd server
   node seed.js   # if provided
   ```

## 🌐 Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/hostel_db

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this-in-production
```

> **Note:** Replace `your-super-secret-key-change-this-in-production` with a strong, unique secret.

## 🚀 Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

2. **Access the frontend**
   - Serve the `client` folder via a web server (e.g., Live Server extension in VS Code).
   - Or place the `client` folder under a web server like Apache or Nginx.

3. **Login**
   - Admin: `admin` / `admin123`
   - Student: `student@hostel.com` / `student123`

## 📡 API Documentation

The REST API is organized by module. All endpoints (except login) require a Bearer token in the `Authorization` header.

### Authentication
- `POST /api/auth/login` – Login
- `GET /api/auth/profile` – Get current user
- `POST /api/auth/change-password` – Change password

### Students
- `GET /api/students` – List all students
- `POST /api/students` – Add student
- `GET /api/students/:id` – Get student by ID
- `PUT /api/students/:id` – Update student
- `DELETE /api/students/:id` – Delete student
- `GET /api/students/roommates/:roomId` – Get roommates

### Rooms
- `GET /api/rooms` – List all rooms
- `POST /api/rooms` – Add room
- `GET /api/rooms/:id` – Get room details
- `PUT /api/rooms/:id` – Update room
- `DELETE /api/rooms/:id` – Delete room

### Complaints
- `GET /api/complaints` – List all complaints
- `GET /api/complaints/student/:studentId` – Get student complaints
- `POST /api/complaints` – Submit complaint
- `PUT /api/complaints/:id` – Update status
- `DELETE /api/complaints/:id` – Delete complaint

### Leaves
- `GET /api/leaves` – List all leave requests
- `GET /api/leaves/student/:studentId` – Get student leaves
- `POST /api/leaves` – Apply for leave
- `PUT /api/leaves/:id` – Update status (approve/reject)
- `DELETE /api/leaves/:id` – Delete leave

### Attendance
- `GET /api/attendance` – List all attendance
- `GET /api/attendance/student/:studentId` – Get student attendance
- `POST /api/attendance` – Mark attendance
- `PUT /api/attendance/:id` – Update attendance
- `DELETE /api/attendance/:id` – Delete attendance

### Payments
- `GET /api/payments` – List all payments
- `GET /api/payments/student/:studentId` – Get student payments
- `POST /api/payments` – Record payment
- `PUT /api/payments/:id` – Update payment
- `DELETE /api/payments/:id` – Delete payment

### Reports
- `GET /api/reports` – Dashboard statistics
- `GET /api/reports/attendance` – Attendance report
- `GET /api/reports/complaints` – Complaints report
- `GET /api/reports/leaves` – Leaves report
- `GET /api/reports/payments` – Payments report

For full request/response details, see the `server/routes/` directory.

## 📁 Project Structure

```
hostel-management-system/
├── server/
│   ├── models/          # MongoDB models
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & role checks
│   ├── config/          # Database connection
│   └── server.js        # Entry point
├── client/
│   ├── pages/           # HTML pages
│   │   ├── admin/       # Admin dashboard pages
│   │   └── student/     # Student pages
│   ├── components/      # Reusable components (sidebar.js)
│   ├── js/              # JavaScript files
│   │   ├── adminJs/     # Admin-specific JS
│   │   └── student/     # Student-specific JS
│   ├── css/             # Stylesheets
│   └── index.html       # Entry page
└── README.md
```

## 📊 Database Schema

### Collections
- **students**: name, registerNumber, email, phone, department, year, room_id, etc.
- **rooms**: roomNumber, floor, capacity, occupied
- **complaints**: student_id, title, description, status
- **leaves**: student_id, from_date, to_date, reason, status
- **attendance**: student_id, date, status

For full schema details, see the `models/` directory.

## 👥 User Roles

| Role   | Default Credentials       | Permissions |
|--------|---------------------------|-------------|
| Admin  | `admin` / `admin123`      | Full system access: manage all records, approve leaves, resolve complaints, view reports |
| Student| `student@hostel.com` / `student123` | View own profile, room details, raise complaints, apply for leave, view attendance and fee status |

## 📸 Screenshots

*(Add actual screenshots here)*

| Login Page | Admin Dashboard |
|------------|-----------------|
| ![Login](https://via.placeholder.com/400x250?text=Login+Page) | ![Admin Dashboard](https://via.placeholder.com/400x250?text=Admin+Dashboard) |

| Student Dashboard | Room Management |
|-------------------|-----------------|
| ![Student Dashboard](https://via.placeholder.com/400x250?text=Student+Dashboard) | ![Room Management](https://via.placeholder.com/400x250?text=Room+Management) |

| Complaint Management | Leave Management |
|----------------------|------------------|
| ![Complaints](https://via.placeholder.com/400x250?text=Complaints) | ![Leaves](https://via.placeholder.com/400x250?text=Leaves) |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code adheres to the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Bootstrap](https://getbootstrap.com/) for the UI framework
- [Font Awesome](https://fontawesome.com/) for icons
- [MongoDB](https://www.mongodb.com/) for the database
- [Express.js](https://expressjs.com/) for the web framework
- [Node.js](https://nodejs.org/) for the runtime

---

**Developed by:** [Niroshkumar ,
                    Full Stack Developer]  
