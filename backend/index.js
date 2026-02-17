const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('./middleware/mongoSanitize');
const connectDB = require('./config/db');
const socketAuth = require('./middleware/socketAuth');
const { initializeSocket } = require('./socket/socketHandler');
const AppError = require('./utils/AppError');

// Load env vars
dotenv.config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const companyRoutes = require('./routes/companyRoutes');
const bookingRoutes = require('./routes/bookingRoutes'); // Added booking routes

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Security Middleware
// Set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Disable for development
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/auth', limiter); // Apply stricter rate limiting to auth routes

// Rate limiting for API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // More lenient for API
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// CORS configuration
const allowedOrigins =
    process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL].filter(Boolean)
        : ["http://localhost:5173"];

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST']
    }
});

// Socket authentication middleware
io.use(socketAuth);

// Initialize socket event handlers
initializeSocket(io);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const { csrfProtection } = require('./middleware/csrfMiddleware');

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// CSRF Protection
// Must be used after cookie-parser
// Skip CSRF for Socket.IO polling requests (they use JWT auth via socketAuth middleware)
app.use((req, res, next) => {
    if (req.path.startsWith('/socket.io')) {
        return next();
    }
    csrfProtection(req, res, next);
});

// CSRF Token Endpoint
// Frontend calls this to get the token and include it in subsequent mutation requests
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});



// Request logging in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Routes
app.use('/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/bookings', bookingRoutes); // Mount booking routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'ServiceBee Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    // AppError — known operational errors
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Duplicate field value entered' });
    }

    // MongoDB validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }

    // CSRF errors
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    // Default error with Spooky Touch
    const statusCode = err.statusCode || 500;
    const response = {
        message: err.message || 'Server Error',
        spookyMessage: 'The spirits are confused... something went wrong in the shadows.'
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
});

app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API Route not found' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    // Serve static files from frontend/dist
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // Catch-all to serve index.html for SPA client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
} else {
    // Development 404
    app.use((req, res) => {
        res.status(404).json({ message: 'Route not found' });
    });
}

// Start the server
server.listen(PORT, () => {
    console.log(`🎃 ServiceBee Server running on port ${PORT}`);
    console.log(`🔌 Socket.IO ready for connections`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };

