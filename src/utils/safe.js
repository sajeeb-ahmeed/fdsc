
/**
 * Ensures the value is an array. Returns empty array if undefined or null.
 * @param {any} v 
 * @returns {Array}
 */
export const safeArray = (v) => Array.isArray(v) ? v : [];

/**
 * Ensures the value is a number. Returns 0 if not a number.
 * @param {any} v 
 * @returns {number}
 */
export const safeNumber = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
};
