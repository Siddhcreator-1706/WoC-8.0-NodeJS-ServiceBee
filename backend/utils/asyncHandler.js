/**
 * Wraps an async Express route handler to catch rejected promises
 * and forward errors to Express error-handling middleware.
 *
 * Usage:  router.get('/example', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
