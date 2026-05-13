const csurf = require('csurf');

// CSURF protection middleware
// Stores the token in a cookie, accessible by the frontend
const csrfProtection = csurf({
    cookie: {
        key: 'x-csrf-token', // The name of the cookie to be used
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
        secure: process.env.NODE_ENV === 'production', // Secure is required for SameSite=None
        path: '/'
    }
});


module.exports = {
    csrfProtection
};
