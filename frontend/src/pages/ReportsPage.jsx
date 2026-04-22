
import React, { useState } from 'react';
import useStore from '../store/useStore';
import { FileText, PieChart, TrendingUp, Download, Scale, ClipboardList } from 'lucide-react';
import clsx from 'clsx';
import { safeArray, safeNumber } from '../utils/safe';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';

const ReportsPage = () => {
    const { transactions, members, shareholders, stats, distributeDividends, loading, error, fetchTransactions, fetchMembers, fetchShareholders, fetchSummary } = useStore();
    const [activeTab, setActiveTab] = useState('cash');
    const [filterType, setFilterType] = useState('All');

    React.useEffect(() => {
        fetchTransactions();
        fetchMembers();
        fetchShareholders();
        fetchSummary();
    }, [fetchTransactions, fetchMembers, fetchShareholders, fetchSummary]);

    if (loading && safeArray(transactions).length === 0) return <LoadingSpinner />;
    if (error) return <ErrorBanner message={error} />;

    const sTransactions = safeArray(transactions);
    const sMembers = safeArray(members);
    const sShareholders = safeArray(shareholders);
    const sStats = stats || {};

    // Trial Balance Data (Aggregated from DB)
    const trialBalance = [
        { head: "হাতে নগদ (Cash in Hand)", debit: safeNumber(sStats.cashInHand), credit: 0 },
        { head: "মোট বিনিয়োগ (Credit Due)", debit: safeNumber(sStats.totalCreditDue), credit: 0 },
        { head: "শেয়ার মূলধন (Share Capital)", debit: 0, credit: safeNumber(sStats.totalShareCapital) },
        { head: "সঞ্চয় জমা (Savings)", debit: 0, credit: safeNumber(sStats.totalSavings) },
        { head: "FDR জমা (FDR)", debit: 0, credit: 150000 }, // Mock
    ];
    const totalDebit = trialBalance.reduce((acc, i) => acc + safeNumber(i.debit), 0);
    const totalCredit = trialBalance.reduce((acc, i) => acc + safeNumber(i.credit), 0);

    // Dividend Calc
    const directorShare = safeNumber(sStats.netProfit) * 0.25;
    const shareholderShare = safeNumber(sStats.netProfit) * 0.75;

    const handleDistribute = () => {
        if (window.confirm("আপনি কি নিশ্চিত যে আপনি লভ্যাংশ বন্টন করতে চান?")) {
            distributeDividends();
            alert("লভ্যাংশ বন্টন সফল হয়েছে!");
        }
    };

    const tabs = [
        { id: 'cash', label: 'ডেইলি ক্যাশ শীট', icon: FileText },
        { id: 'transactions', label: 'সকল লেনদেন', icon: ClipboardList },
        { id: 'trial', label: 'ট্রায়াল ব্যালেন্স', icon: Scale },
        { id: 'dividend', label: 'লভ্যাংশ রিপোর্ট', icon: PieChart },
    ];

    const filteredTransactions = filterType === 'All'
        ? sTransactions
        : sTransactions.filter(t => t.type === filterType);

    const transactionTypes = ['All', ...new Set(sTransactions.map(t => t.type))];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 py-4 px-4 flex items-center justify-center gap-2 font-medium transition-colors whitespace-nowrap",
                            activeTab === tab.id ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500" : "text-slate-500 hover:bg-slate-50"
                        )}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                {activeTab === 'cash' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-800">আজকের ক্যাশ পজিশন</h3>
                            <button className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition">
                                <Download size={16} /> ডাউনলোড
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-slate-500 text-sm mb-1">হাতে নগদ (বর্তমান)</p>
                                <p className="text-2xl font-bold text-slate-700">৳ {safeNumber(sStats.cashInHand).toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-xl">
                                <p className="text-emerald-600 text-sm mb-1">আজকের কালেকশন ({new Date().toISOString().split('T')[0]})</p>
                                <p className="text-2xl font-bold text-emerald-700">৳ {safeNumber(sStats.todayCollection).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-bold text-slate-700 mb-3">সাম্প্রতিক ৫টি লেনদেন</h4>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-2 rounded-l-lg">তারিখ</th>
                                        <th className="p-2">বিবরণ</th>
                                        <th className="p-2 text-right rounded-r-lg">টাকা</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sTransactions.slice(0, 5).map(t => (
                                        <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                            <td className="p-2 text-slate-500">{t.date}</td>
                                            <td className="p-2 font-medium text-slate-800">{t.type} <span className="text-slate-400">- {t.memberName}</span></td>
                                            <td className="p-2 text-right font-bold text-slate-600">৳ {safeNumber(t.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-bold text-slate-800">সকল লেনদেন ইতিহাস</h3>
                            <select
                                className="p-2 border rounded-lg text-sm bg-slate-50"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                {transactionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-3 text-slate-600">ID</th>
                                        <th className="p-3 text-slate-600">তারিখ</th>
                                        <th className="p-3 text-slate-600">বিবরণ</th>
                                        <th className="p-3 text-slate-600">সদস্য</th>
                                        <th className="p-3 text-right text-slate-600">পরিমাণ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTransactions.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-50">
                                            <td className="p-3 text-slate-400 font-mono text-xs">#{t.id}</td>
                                            <td className="p-3 text-slate-500">{t.date}</td>
                                            <td className="p-3 font-medium text-slate-800">
                                                <span className="px-2 py-1 rounded bg-slate-100 text-xs font-bold mr-2">{t.type}</span>
                                                {t.description && <span className="text-slate-500 text-xs">{t.description}</span>}
                                            </td>
                                            <td className="p-3 text-slate-600">{t.memberName} ({t.memberId})</td>
                                            <td className={clsx("p-3 text-right font-bold", t.amount < 0 ? "text-red-600" : "text-emerald-600")}>
                                                {t.amount < 0 ? '-' : '+'} ৳ {Math.abs(t.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500">কোনো লেনদেন পাওয়া যায়নি</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'trial' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-slate-800 pb-4 border-b">ট্রায়াল ব্যালেন্স (Trial Balance)</h3>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b-2 border-slate-200">
                                <tr>
                                    <th className="p-3 text-slate-600">হিসাবের খাত (Heads)</th>
                                    <th className="p-3 text-right text-slate-600">ডেবিট (Debit)</th>
                                    <th className="p-3 text-right text-slate-600">ক্রেডিট (Credit)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                                {trialBalance.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="p-3 font-medium text-slate-700">{item.head}</td>
                                        <td className="p-3 text-right">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                                        <td className="p-3 text-right">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                                    </tr>
                                ))}
                                <tr className="bg-emerald-50 font-bold border-t-2 border-emerald-200">
                                    <td className="p-3">মোট (Total)</td>
                                    <td className="p-3 text-right">৳ {totalDebit.toLocaleString()}</td>
                                    <td className="p-3 text-right">৳ {totalCredit.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'dividend' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-emerald-100 font-medium mb-1">মোট বন্টনযোগ্য মুনাফা</h3>
                                    <p className="text-4xl font-bold">৳ {safeNumber(sStats.netProfit).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={handleDistribute}
                                    className="bg-white text-emerald-800 px-4 py-2 rounded-lg font-bold hover:bg-emerald-50 transition shadow-lg"
                                >
                                    বন্টন করুন
                                </button>
                            </div>
                            <div className="mt-4 flex gap-4 text-sm">
                                <div className="bg-white/20 px-3 py-1 rounded-full">পরিচালক (২৫%): ৳ {directorShare.toLocaleString()}</div>
                                <div className="bg-white/20 px-3 py-1 rounded-full">শেয়ারহোল্ডার (৭৫%): ৳ {shareholderShare.toLocaleString()}</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-800 mb-4">শেয়ারহোল্ডার বন্টন তালিকা</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-3 text-slate-600">শেয়ারহোল্ডার</th>
                                            <th className="p-3 text-right text-slate-600">বর্তমান শেয়ার</th>
                                            <th className="p-3 text-right text-slate-600">লভ্যাংশ পাবে</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sShareholders.slice(0, 10).map(s => {
                                            const totalInvestment = safeNumber(s.totalInvestment ?? s.totalAmount ?? 0);
                                            const sShares = safeNumber(s.numberOfShares ?? (totalInvestment / 50000) ?? 0);
                                            const totalSharesCount = sShareholders.reduce((acc, sh) => {
                                                const shInv = safeNumber(sh.totalInvestment ?? sh.totalAmount ?? 0);
                                                return acc + safeNumber(sh.numberOfShares ?? (shInv / 50000) ?? 0);
                                            }, 0);
                                            const shareRatio = sShares / (totalSharesCount || 1);
                                            const amount = shareholderShare * shareRatio;
                                            const sId = s.shareholderId ?? s.id ?? "N/A";
                                            return (
                                                <tr key={sId} className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-800">{s.name}</td>
                                                    <td className="p-3 text-right text-slate-600">{sShares} টি (৳ {totalInvestment.toLocaleString()})</td>
                                                    <td className="p-3 text-right font-bold text-emerald-700">
                                                        ৳ {(amount || 0).toFixed(0)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
