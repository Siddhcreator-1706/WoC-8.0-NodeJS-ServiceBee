const { doubleCsrf } = require("double-csrf");

const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateToken, // Use this in your routes to provide a CSRF hash cookie and token.
    validateRequest, // Also a convenience if you need more control.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
    getSecret: () => process.env.JWT_SECRET || "complex_secrety_secret", // A function that optionally takes the request and returns a secret
    cookieName: "x-csrf-token", // The name of the cookie to be used, recommend using x-csrf-token
    cookieOptions: {
        httpOnly: true,
        sameSite: "strict", // Recommend strict
        secure: process.env.NODE_ENV === "production",
        path: "/",
    },
    size: 64, // The size of the generated tokens in bits
    ignoredMethods: ["GET", "HEAD", "OPTIONS"], // A list of request methods that will not be checked.
    getTokenFromRequest: (req) => req.headers["x-csrf-token"], // A function that returns the tokenjz from the request
});

module.exports = {
    doubleCsrfProtection,
    generateToken,
};
