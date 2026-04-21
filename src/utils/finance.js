/**
 * Finance utilities for Friends Dream Society
 */

/**
 * Calculates penalty for overdue installments
 * @param {number} dueAmount 
 * @param {number} installmentAmount 
 * @returns {number}
 */
export const calculatePenalty = (dueAmount, installmentAmount) => {
    // Basic logic: 1% of the installment amount if overdue
    // This can be made more complex based on days overdue if needed
    if (!dueAmount || dueAmount <= 0 || !installmentAmount) return 0;

    // For now, returning a fixed 1% of installment as mocked in the UI
    const amount = parseFloat(installmentAmount);
    return isNaN(amount) ? 0 : Math.round(amount * 0.01);
};

// Development guard
if (import.meta.env.DEV) {
    console.assert(typeof calculatePenalty === "function", "calculatePenalty must be a function");
}
