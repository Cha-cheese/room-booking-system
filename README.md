# Room Booking System - web application project

A full-stack web application for students, staff, and lecturers to manage room booking efficiently.

# 📱 Features

 - Role-based login : Student, Staff, Lecturer
 - Room browsing & booking : Students can browse rooms, book only available rooms, and view booking details.
 - Approval workflow : Lecturers can approve or reject booking requests and status updates automatically.
 - Room management : Staff can add, edit, or disable rooms (only available rooms).
 - Dashborad & History : View summary of room usage, booking history, and status tracking.

## 🛠️ Tech Stack

 - Frontend : HTML, CSS, JavaScript
 - Backend : Node.js + Express 
 - Database : MySQL (XAMPP)
 - API : RESTful 

## ⚙️ Quick Start

 1. Clone the repository
 `git clone https://github.com/your-username/mobileproject.git
cd webproject`

 2. Install dependencies
 `npm install` 
 
 3. Setup Database
	- Start MySQL /XAMPP
	- Import SQL file `webpro_complete.sql`
	- Ensure database credentials in `config/` match your setup
	
 4. Run the server
	`nodemon app.js`
	
	- Server will run at : http://localhost:3000

 5. Open Frontend
	 - Access in browser : http://localhost:3000 
