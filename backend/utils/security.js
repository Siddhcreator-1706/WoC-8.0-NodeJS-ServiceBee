/**
 * Escapes special characters in a string for use in a regular expression.
 * This prevents ReDoS attacks and regex injection when using user input in regex.
 * 
 * @param {string} string - The string to escape
 * @returns {string} - The escaped string
 */
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = { escapeRegex };
