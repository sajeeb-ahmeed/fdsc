import React from 'react';
import useStore from '../store/useStore';
import { TrendingUp, Users, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import clsx from 'clsx';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';
import { safeArray, safeNumber } from '../utils/safe';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className={clsx("rounded-xl p-6 text-white shadow-lg", colorClass)}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-emerald-50/80 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
                <p className="text-emerald-50/70 text-xs mt-2">{subtext}</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const TransactionItem = ({ transaction }) => {
    const amount = safeNumber(transaction.amount);
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                )}>
                    {amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                    <p className="font-semibold text-slate-800">{transaction.member?.name || transaction.shareholder?.name || 'System'}</p>
                    <p className="text-xs text-slate-500">{transaction.type || 'Transaction'} • {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
            <span className={clsx(
                "font-bold",
                amount > 0 ? "text-emerald-600" : "text-red-600"
            )}>
                {amount > 0 ? '+' : ''}{amount} ৳
            </span>
        </div>
    );
};

const Dashboard = () => {
    const { members, stats, transactions, fetchMembers, fetchLoans, fetchShareholders, fetchTransactions, fetchSummary, loading, error } = useStore();

    React.useEffect(() => {
        fetchMembers();
        fetchLoans();
        fetchShareholders();
        fetchTransactions();
        fetchSummary();
    }, [fetchMembers, fetchLoans, fetchShareholders, fetchTransactions, fetchSummary]);

    const sMembers = safeArray(members);
    const sTransactions = safeArray(transactions);
    const sStats = stats || {};

    if (loading && sMembers.length === 0) return <LoadingSpinner />;
    if (error && sMembers.length === 0) return <ErrorBanner message={error} onRetry={fetchMembers} />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">ড্যাশবোর্ড</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="আজকের কালেকশন"
                    value={`৳ ${safeNumber(sStats.todayCollection).toLocaleString()}`}
                    subtext="কিস্তি আদায়"
                    icon={TrendingUp}
                    colorClass="bg-emerald-700"
                />
                <StatCard
                    title="মোট সঞ্চয়"
                    value={`৳ ${safeNumber(sStats.totalSavings).toLocaleString()}`}
                    subtext="শেয়ার ও সঞ্চয়"
                    icon={Users}
                    colorClass="bg-blue-600"
                />
                <StatCard
                    title="নিট মুনাফা"
                    value={`৳ ${safeNumber(sStats.netProfit).toLocaleString()}`}
                    subtext="মোট আয় - ব্যয়"
                    icon={AlertCircle}
                    colorClass="bg-red-500"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">সাম্প্রতিক লেনদেন</h3>
                    <button className="text-sm text-emerald-600 font-medium hover:underline">সব দেখুন</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {sTransactions.slice(0, 5).map((txn) => (
                        <TransactionItem key={txn.id || txn._id} transaction={txn} />
                    ))}
                    {sTransactions.length === 0 && (
                        <div className="p-8 text-center text-slate-500">কোনো লেনদেন পাওয়া যায়নি</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
