const csurf = require('csurf');

// CSURF protection middleware
// Stores the token in a cookie, accessible by the frontend
const csrfProtection = csurf({
    cookie: {
        key: 'x-csrf-token', // The name of the cookie to be used
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    }
});


module.exports = {
    csrfProtection
};
