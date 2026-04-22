/**
 * Canonical API Paths as defined in Step 1 Contract Freeze
 */
export const API_PATHS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',

    // Members
    MEMBERS: '/members',
    MEMBER_DETAILS: (id) => `/members/${id}`,

    // Shareholders & Shares
    SHAREHOLDERS: '/shares',
    SHAREHOLDER_DETAILS: (id) => `/shares/${id}`,
    ISSUE_SHARES: '/shares/issue',
    TRANSFER_SHARES: '/shares/transfer',
    DIRECTORS: '/shares/directors',

    // Inventory
    INVENTORY_ITEMS: '/inventory/items',
    INVENTORY_PURCHASES: '/inventory/purchases',

    // Loans
    LOANS: '/loans',
    LOAN_DETAILS: (id) => `/loans/${id}`,
    LOAN_COLLECT: (id) => `/loans/${id}/collect`,

    // Reports & Ledger
    LEDGER: '/ledger',
    EXPENSES: '/reports/expenses', // Hardened endpoint
    SUMMARY: '/reports/summary',
    BALANCE_SHEET: '/reports/balance-sheet',
    PROFIT_LOSS: '/reports/profit-loss',
    CASH_SHEET: '/reports/cash-sheet',

    // Dividends
    DIVIDENDS_COMPUTE: '/dividends/compute',
    DIVIDENDS_WITHDRAW: '/dividends/withdraw',
};

export default API_PATHS;
