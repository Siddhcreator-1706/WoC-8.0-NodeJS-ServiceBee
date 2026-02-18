const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketAuth = require('./middleware/socketAuth');
const mongoSanitize = require('./middleware/mongoSanitize');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { initializeSocket } = require('./socket/socketHandler');
const http = require('http');
const AppError = require('./utils/AppError');

dotenv.config();

const companyRoutes = require('./routes/companyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

connectDB();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Disable for development
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/auth', limiter);

// Rate limiting for API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // More lenient for API
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

app.use('/api', apiLimiter);

const allowedOrigins =
    process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL].filter(Boolean)
        : ["http://localhost:5173"];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST']
    }
});

io.use(socketAuth);

initializeSocket(io);

app.use(cors({
    origin: function (origin, callback) {
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

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const { csrfProtection } = require('./middleware/csrfMiddleware');

app.use(mongoSanitize());

// CSRF Protection
app.use((req, res, next) => {
    if (req.path.startsWith('/socket.io')) {
        return next();
    }
    csrfProtection(req, res, next);
});

app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});



if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

app.use('/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', require('./routes/uploadRoutes'));

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

app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }

    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    const statusCode = err.statusCode || 500;
    const response = {
        message: err.message || 'Server Error',
        spookyMessage: 'The spirits are confused... something went wrong in the shadows.'
    };

    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
});

app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API Route not found' });
});

if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
} else {
    // Development 404
    app.use((req, res) => {
        res.status(404).json({ message: 'Route not found' });
    });
}

server.listen(PORT, () => {
    console.log(`🎃 ServiceBee Server running on port ${PORT}`);
    console.log(`🔌 Socket.IO ready for connections`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };

