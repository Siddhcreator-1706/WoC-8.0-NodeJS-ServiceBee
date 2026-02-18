# 🎃 Phantom Agency (ServiceBee)

**Phantom Agency** is a modern, full-stack web application designed to connect users with trusted local service providers. Featuring a unique "spooky/phantom" aesthetic, it serves as a marketplace for services ranging from home repairs to beauty treatments.

---

## 1. 🌟 Project Overview

### Key Features
*   **Service Marketplace**: Browse and book services from verified providers.
*   **Real-time Interaction**:
    *   **Live Chat**: Instant messaging using **Socket.IO**.
    *   **Notifications**: Real-time status updates for bookings.
*   **Provider Dashboard**: Manage profiles, services, and bookings.
*   **Admin Control**: Super admin capabilities for system management.

### Tech Stack
| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, GSAP, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, Nodemailer |
| **Database** | MongoDB (Mongoose ODM) |
| **Services** | Cloudinary (Images), Render (Deployment) |

---

## 2. 🏗️ System Architecture

### High-Level Design
The application follows a **Client-Server-Database** architecture with a real-time communication layer.

1.  **Frontend (SPA)**: React app handling UI, routing, and state (Context API).
2.  **Backend (REST API)**: Express server handling business logic and auth.
3.  **Real-Time Layer**: Socket.IO for bidirectional events (chat, notifications).
4.  **Database**: MongoDB for persistent storage.

### Folder Structure
```
├── backend/                # Node.js Server
│   ├── config/             # Configuration (DB, Cloudinary)
│   ├── controllers/        # Business Logic
│   ├── models/             # Database Schemas
│   ├── routes/             # API Endpoints
│   ├── socket/             # Real-time Event Handlers
│   └── seed/               # Data Seeding Scripts
│
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── context/        # Global State (Auth, Socket)
│   │   ├── pages/          # Application Views
│   │   └── hooks/          # Custom Hooks
│
└── render.yaml             # Deployment Configuration
```

---

## 3. 👩‍💻 Developer Guide

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Atlas or Local)
*   Cloudinary Account

### Installation
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/Siddhcreator-1706/WoC-8.0-NodeJS-ServiceBee.git
    cd WoC-8.0-NodeJS-ServiceBee
    ```
2.  **Install Dependencies**:
    ```bash
    npm run install-all
    ```

### Configuration (`backend/.env`)
| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB Connection String |
| `JWT_SECRET` | Secret for Auth Tokens |
| `CLOUDINARY_*` | Cloudinary Credentials |
| `EMAIL_*` | SMTP Credentials for Nodemailer |
| `FRONTEND_URL` | Frontend URL (e.g., `http://localhost:5173`) |

### Seeding Data
Populate the DB with dummy data and a **Super Admin** account:
```bash
npm run seed --prefix backend
```
> **Admin Login**: `admin@servicebee.com` / `adminpassword123`

### Running Locally
*   **Backend**: `npm run dev --prefix backend` (Port 5000)
*   **Frontend**: `npm run dev --prefix frontend` (Port 5173)

---

## 4. 🚀 Deployment

The project is configured for **Render** using Infrastructure as Code (`render.yaml`).

### Deployment Steps
1.  Push code to GitHub.
2.  Create a new **Blueprint** project on [Render](https://render.com/).
3.  Connect your repository.
4.  Render will auto-detect the `backend` (Web Service) and `frontend` (Static Site).
5.  Fill in the environment variables when prompted.

---

## 5. 📡 API Reference

### REST Endpoints
*   **Auth**: `/auth/signup`, `/auth/login`, `/auth/me`
*   **Services**: `/api/services` (GET, POST, PUT, DELETE)
*   **Bookings**: `/api/bookings`
*   **Complaints**: `/api/complaints`

### Socket.IO Events
*   `connection`: User connects (joins room `userId`).
*   `booking:create` → `booking:new`: Notify provider of new booking.
*   `message:send` → `message:receive`: Real-time chat messages.

---

## 6. 🗺️ Roadmap & Support

### Future Enhancements
*   [ ] **Admin Announcements**: Broadcast system-wide alerts.
*   [ ] **Enhanced Auth**: Stricter password policies & session controls.
*   [ ] **UI Polish**: Advanced GSAP ScrollTrigger animations.
*   [ ] **DB Refactor**: Improve Provider-Company data relation.
*   [ ] **Payments**: Secure gateway integration.

### Contributing
1.  Fork & Branch (`feature/NewFeature`).
2.  Commit & Push.
3.  Open a Pull Request.

*Verified "Phantom Agency" codebase - 2026*
