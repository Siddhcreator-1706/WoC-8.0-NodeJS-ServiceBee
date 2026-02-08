# 🎃 Phantom Agency (ServiceBee)

**Phantom Agency** is a modern, full-stack web application designed to connect users with trusted local service providers. Featuring a unique "spooky/phantom" aesthetic, it serves as a marketplace for services ranging from home repairs to beauty treatments, offering a seamless booking experience for customers and a robust management dashboard for providers.

---

## 🚀 Tech Stack

### Frontend
*   **Framework:** [React 19](https://react.dev/) (via [Vite](https://vitejs.dev/))
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with PostCSS
*   **Routing:** [React Router DOM](https://reactrouter.com/)
*   **State Management:** React Context API
*   **Animations:** [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
*   **HTTP Client:** Axios
*   **UX Enhancements:** Lenis (smooth scrolling)

### Backend
*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens) & Cookies
*   **Security:** Helmet, CORS, Rate Limiting, MongoSanitize, Double CSRF protection
*   **File Storage:** Cloudinary (via Multer)
*   **Email Service:** Nodemailer

---

## 🏗️ Architecture Overview

The application follows a standard **Client-Server architecture**:

1.  **Frontend (SPA)**: A React-based Single Page Application that consumes the RESTful API. It handles user interactions, routing, animations, and state management.
2.  **Backend (REST API)**: A modular Node/Express server that handles business logic, database operations, and authentication. It exposes endpoints under the `/api` prefix and handles auth via `/auth`.
3.  **Database**: MongoDB stores all relational data (users, services, bookings, companies, etc.).
4.  **External Services**:
    *   **Cloudinary**: Stores uploaded images (profiles, service thumbnails).
    *   **Email Provider**: Sends verification and notification emails.

---

## 📂 Folder Structure

```
├── backend/                # Node.js Server
│   ├── config/             # DB & Cloudinary configuration
│   ├── controllers/        # Request handlers (business logic)
│   ├── middleware/         # Auth, Security, Error handling
│   ├── models/             # Mongoose schemas (User, Service, Booking, etc.)
│   ├── routes/             # API route definitions
│   ├── utils/              # Helper functions (Email, etc.)
│   └── index.js            # Entry point
│
├── frontend/               # React Client
│   ├── public/             # Static assets (Manifest, Icons)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── config/         # App-wide vars (API URL)
│   │   ├── context/        # React Context (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Main route views (Services, Profile, etc.)
│   │   └── main.jsx        # Entry point
│   └── vite.config.js      # Vite configuration
│
└── .github/                # GitHub workflows (CI/CD)
```

---

## 🛠️ Prerequisites

*   **Node.js** (v18+ recommended)
*   **npm** or **yarn**
*   **MongoDB** (Local instance or Atlas connection)
*   **Cloudinary Account** (for image uploads)

---

## ⚡ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Siddhcreator-1706/WoC-8.0-NodeJS-ServiceBee.git
cd WoC-8.0-NodeJS-ServiceBee
```

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in `backend/` and populate it (see **Configuration** section below).
4.  Start the server:
    ```bash
    npm run dev
    # Functions on http://localhost:5000
    ```

### 3. Frontend Setup
1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  (Optional) Create a `.env` file if needed for environment-specific variables.
4.  Start the development server:
    ```bash
    npm run dev
    # Runs on http://localhost:5173
    ```

---

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)
Create this file to configure the server.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for signing tokens | `your_super_secret_key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `phantom-agency` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdef...` |
| `EMAIL_USER` | SMTP Username/Email | `ghost@phantom.agency` |
| `EMAIL_PASS` | SMTP Password | `spooky_password` |
| `FRONTEND_URL` | URL of frontend (for CORS) | `http://localhost:5173` |

---

## 📜 Scripts & Commands

### Backend (`/backend`)
*   `npm run dev`: Starts the server with Nodemon (auto-restart on changes).
*   `npm start`: Starts the server in production mode.


### Frontend (`/frontend`)
*   `npm run dev`: Starts Vite development server.
*   `npm run build`: Compiles the app for production.
*   `npm run preview`: Previews the production build locally.
*   `npm run lint`: Runs ESLint check.

---

## 📡 API Overview

The API is structured around resources. All endpoints are prefixed with `/api` (except auth).

*   **Auth** (`/auth/*`): Signup, Login, Logout, Session management.
*   **Services** (`/api/services/*`): CRUD operations for services offered.
*   **Users** (`/api/users/*`): Profile management.
*   **Bookings** (`/api/bookings/*`): Create and manage service appointments.
*   **Companies** (`/api/companies/*`): Provider profile and analytics.
*   **Complaints** (`/api/complaints/*`): User grievance redressal system.
*   **Bookmarks** (`/api/bookmarks/*`): Save/favorite services.

---

## 🧩 Frontend Notes

*   **Authentication**: The app uses a `AuthContext` to manage user state globally. It persists login state via cookies (Double Cookie pattern) to ensure security and persistence across reloads.
*   **Styling**: Pure Tailwind CSS is used for styling. Dark mode/phantom theme is default.
*   **Animations**: Complex entry and exit animations are handled using `Framer Motion` and `GSAP`.

## 🛡️ Backend Notes

*   **Security First**: The backend implements strict security headers (`helmet`), rate limiting to prevent abuse, and sanitizes all inputs against NoSQL injection.
*   **Error Handling**: A centralized error handling middleware catches operational errors and returns standardized JSON responses (often with a "spooky" twist).
*   **Validation**: Inputs are validated at the controller level.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 🐞 Common Issues

*   **CORS Errors**: Ensure `FRONTEND_URL` in backend `.env` matches your running frontend URL exactly.
*   **Image Upload Failures**: Check Cloudinary credentials.
*   **Database Connection**: Ensure your IP is whitelisted if using MongoDB Atlas.

---

*Verified "Phantom Agency" codebase - 2026*
