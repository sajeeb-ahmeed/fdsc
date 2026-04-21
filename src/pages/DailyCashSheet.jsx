import React from 'react';
import useStore from '../store/useStore';
import ReportLayout from '../components/ReportLayout';
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import clsx from 'clsx';
import { safeArray, safeNumber } from '../utils/safe';

const DailyCashSheet = () => {
    const { dailyCashData, fetchDailyCash } = useStore();

    React.useEffect(() => {
        fetchDailyCash();
    }, [fetchDailyCash]);

    if (!dailyCashData) return null;

    const { receipts: cashInTransactions, payments: cashOutTransactions, totalReceipts: totalCashIn, totalPayments: totalCashOut } = dailyCashData;
    const directExpenses = []; // Already included in payments from backend

    return (
        <ReportLayout title="ডেইলি ক্যাশ শিট (Daily Cash Sheet)">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-slate-200">
                {/* Cash In (Debit Side) */}
                <div className="p-0">
                    <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
                        <h3 className="font-black text-emerald-800 flex items-center gap-2">
                            <ArrowDownCircle size={20} /> জমা (Cash In / Debit)
                        </h3>
                        <span className="text-xs bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">RECEIPTS</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">বিবরণ</th>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-right">পরিমাণ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-xs">
                                {cashInTransactions.map((t, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-slate-800">{t.type}</p>
                                            <p className="text-[10px] text-slate-400">{t.memberName} | {t.date}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-emerald-600">৳ {safeNumber(t.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {cashInTransactions.length === 0 && (
                                    <tr><td colSpan="2" className="p-8 text-center text-slate-400 font-sans italic">No receipts found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cash Out (Credit Side) */}
                <div className="p-0">
                    <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
                        <h3 className="font-black text-red-800 flex items-center gap-2">
                            <ArrowUpCircle size={20} /> খরচ (Cash Out / Credit)
                        </h3>
                        <span className="text-xs bg-red-700 text-white px-2 py-0.5 rounded font-bold">PAYMENTS</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase">বিবরণ</th>
                                    <th className="px-4 py-3 font-bold text-slate-500 uppercase text-right">পরিমাণ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-xs">
                                {[...cashOutTransactions, ...directExpenses].map((t, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <p className="font-bold text-slate-800">{t.type || 'Expense'}</p>
                                            <p className="text-[10px] text-slate-400">{t.memberName || t.recipient} | {t.date}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-red-600">৳ {safeNumber(t.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(cashOutTransactions.length + directExpenses.length) === 0 && (
                                    <tr><td colSpan="2" className="p-8 text-center text-slate-400 font-sans italic">No payments found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="border-t-4 border-slate-800 bg-slate-900 text-white p-6 rounded-b-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="border-r border-slate-700 pr-8">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-widest">Total Cash In</p>
                        <h4 className="text-2xl font-black font-mono text-emerald-400">৳ {(totalCashIn || 0).toLocaleString()}</h4>
                    </div>
                    <div className="border-r border-slate-700 pr-8">
                        <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-widest">Total Cash Out</p>
                        <h4 className="text-2xl font-black font-mono text-red-400">৳ {(totalCashOut || 0).toLocaleString()}</h4>
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold text-emerald-500 mb-1 tracking-widest flex items-center gap-1">
                            <Wallet size={12} /> Cash in Hand (Balance)
                        </p>
                        <h4 className="text-3xl font-black font-mono text-white underline decoration-emerald-500 decoration-4">
                            ৳ {(totalCashIn - totalCashOut + 250000 || 0).toLocaleString()}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 italic">* Includes Opening Balance: ৳ 250,000</p>
                    </div>
                </div>
            </div>
        </ReportLayout>
    );
};

export default DailyCashSheet;
