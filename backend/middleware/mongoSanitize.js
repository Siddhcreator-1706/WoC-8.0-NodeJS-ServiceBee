const sanitize = (obj) => {
    if (obj instanceof Date) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }
    if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                // Skip potentially unsafe keys
                // Intentionally do not copy this key into the sanitized object
                // to avoid introducing prototype pollution or query operators.
                // eslint-disable-next-line no-continue
                continue;
            }
            newObj[key] = sanitize(value);
        }
        return newObj;
    }
    return obj;
};

// Express 5 compatible middleware
// It modifies properties of req.query instead of replacing the object
const mongoSanitize = () => {
    return (req, res, next) => {
        if (req.body) {
            req.body = sanitize(req.body);
        }
        if (req.params) {
            req.params = sanitize(req.params);
        }
        if (req.query) {
            const sanitizedQuery = sanitize(req.query);
            // In Express 5, req.query is a getter, so we can't reassign it.
            // We need to mutate the existing object or define properties if possible.
            // However, the query parser usually returns a plain object prototype.
            // If it's a getter, we might not be able to clear it easily without iterating.

            for (const key in req.query) {
                delete req.query[key];
            }
            Object.assign(req.query, sanitizedQuery);
        }
        next();
    };
};

module.exports = mongoSanitize;
