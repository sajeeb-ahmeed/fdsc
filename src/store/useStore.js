import { create } from 'zustand';
import http from '../lib/http';
import { API_PATHS } from '../config/apiPaths';
import { calculatePenalty } from '../utils/finance';

const useStore = create((set, get) => ({
    // Auth State
    currentUser: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    members: [],
    shareholders: [],
    inventory: [],
    inventoryPurchases: [],
    creditPurchases: [], // Matches Loan records in UI
    transactions: [],
    stats: {
        todayCollection: 0,
        totalSavings: 0,
        netProfit: 0,
        totalTransactions: 0
    },
    balanceSheetData: null,
    profitLossData: null,
    dailyCashData: null,
    pagination: null,

    settings: {
        shareValue: 50000,
        directorMinShares: 5,
        penaltyRate: 1,
        dividendDirectorSplit: 25,
        dividendShareholderSplit: 75,
    },

    calculatePenalty,

    // Auth Actions
    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.LOGIN, credentials);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            set({ currentUser: data, isAuthenticated: true, loading: false });
            return true;
        } catch (error) {
            set({ error: error.message, loading: false });
            return false;
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            await http.post(API_PATHS.REGISTER, userData);
            set({ loading: false });
            return true;
        } catch (error) {
            set({ error: error.message, loading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ currentUser: null, isAuthenticated: false });
    },

    // Member Actions
    fetchMembers: async (page = 1, limit = 10) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(`${API_PATHS.MEMBERS}?page=${page}&limit=${limit}`);
            set({
                members: data.docs || [],
                pagination: data.pagination || null,
                loading: false
            });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addMember: async (memberData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.MEMBERS, memberData);
            set((state) => ({
                members: [data, ...state.members],
                loading: false
            }));
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    transferDirectorship: async (id, newName, newMemberId) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.TRANSFER_SHARES, { id, newName, newMemberId });
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    sellDirectorship: async (id, newDirectorData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.TRANSFER_SHARES, { id, ...newDirectorData, isSale: true });
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },
    fetchShareholders: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.SHAREHOLDERS);
            set({ shareholders: data.docs || data.data || [], loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addShareholder: async (shareholderData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.SHAREHOLDERS, shareholderData);
            await get().fetchShareholders();
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    issueShares: async (shareData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.ISSUE_SHARES, shareData);
            await get().fetchShareholders();
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    transferShares: async (transferData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.TRANSFER_SHARES, transferData);
            await get().fetchShareholders();
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    // Inventory Actions
    fetchInventory: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.INVENTORY_ITEMS);
            set({ inventory: data.docs || data.data || [], loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchInventoryPurchases: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.INVENTORY_PURCHASES);
            set({ inventoryPurchases: data.docs || data.data || [], loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addInventoryPurchase: async (purchaseData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.INVENTORY_PURCHASES, purchaseData);
            await get().fetchInventory();
            await get().fetchInventoryPurchases();
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    // Loan Actions
    fetchLoans: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.LOANS);
            set({ creditPurchases: data.docs || data.data || [], loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createLoan: async (loanData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.LOANS, loanData);
            await get().fetchLoans();
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    collectInstallment: async (loanId, collectionData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.post(API_PATHS.LOAN_COLLECT(loanId), collectionData);
            await get().fetchLoans();
            set({ loading: false });
            return data;
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
        }
    },

    // Reports & Ledger
    fetchTransactions: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.LEDGER);
            set({ transactions: data.docs || data.data || [], loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchSummary: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.SUMMARY);
            set({ stats: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchBalanceSheet: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.BALANCE_SHEET);
            set({ balanceSheetData: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchProfitLoss: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.PROFIT_LOSS);
            set({ profitLossData: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchDailyCash: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await http.get(API_PATHS.CASH_SHEET);
            set({ dailyCashData: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    }
}));

export default useStore;
