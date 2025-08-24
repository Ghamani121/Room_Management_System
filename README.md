# Room Booking System  

A comprehensive **meeting room management system** designed for modern office environments. This system streamlines room reservations, eliminates booking conflicts, and provides efficient resource scheduling for organizations.  

---

## Features  

### Core Functionality  
- **Room Management**: Create, view, update, and delete meeting rooms with detailed specifications  
- **Booking System**: Intuitive reservation system with conflict detection  
- **User Authentication**: Secure JWT-based authentication system  
- **Role-Based Access**: Different permissions for admins and employees  
- **Validation**: Comprehensive input validation for all operations  

### User Roles  
- **Admin**: Full system access including room management and user administration  
- **Employee**: Self-service booking capabilities with access to personal bookings  

---

## Getting Started  

### Prerequisites  
- **Node.js** (v14 or higher)  
- **MongoDB** (v4.4 or higher)  
- **npm** or **yarn**  

---

### Installation  

1. **Clone the repository**  
   ```bash
   git clone <repository-url>
   cd room-booking-system

2. Install dependencies
```bash
npm install
```

### Environment Setup

Create a .env file in the root directory with the following variables:


```.env
PORT=5000
DATABASE_URL=mongodb://localhost:27017/room_management_system
JWT_SECRET=your-super-secret-jwt-key
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-specific-password
```

### Run the Application

Start the development server:

```bash
npm start
