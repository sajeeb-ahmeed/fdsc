import React, { useState } from 'react';
import useStore from '../store/useStore';
import ReportLayout from '../components/ReportLayout';
import { BookOpen, Tag } from 'lucide-react';
import clsx from 'clsx';
import { safeArray, safeNumber } from '../utils/safe';

const GeneralLedger = () => {
    const { transactions, expenses } = useStore();
    const sectors = ['Share', 'FDR', 'DPS', 'Loan', 'Salary', 'Expense', 'Profit', 'Misc'];
    const [activeSector, setActiveSector] = useState('Share');

    const sTransactions = safeArray(transactions);
    const sExpenses = safeArray(expenses);

    // Combine transactions and expenses and filter by sector
    const allItems = [
        ...sTransactions.map(t => ({ ...t, source: 'Trans' })),
        ...sExpenses.map(e => ({ ...e, type: 'Direct Expense', memberName: e.recipient, source: 'Exp', sector: 'Expense' }))
    ].filter(item => {
        if (activeSector === 'Expense') return item.sector === 'Expense' || item.type === 'Expense';
        if (activeSector === 'Loan') return (item.type || '').includes('Credit') || item.sector === 'Loan';
        return item.sector === activeSector || (item.type || '').includes(activeSector);
    });

    const totalSectorAmount = allItems.reduce((acc, curr) => acc + safeNumber(curr.amount), 0);

    return (
        <ReportLayout title="জেনারেল লেজার (General Ledger / খতিয়ান)">
            <div className="flex flex-col h-full min-h-[600px]">
                {/* Sector Navigation */}
                <div className="flex overflow-x-auto bg-slate-50 border-b border-slate-200 print:hidden">
                    {sectors.map(sector => (
                        <button
                            key={sector}
                            onClick={() => setActiveSector(sector)}
                            className={clsx(
                                "px-6 py-4 text-sm font-black whitespace-nowrap border-b-2 transition-all",
                                activeSector === sector
                                    ? "bg-white border-emerald-600 text-emerald-700"
                                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            )}
                        >
                            {sector === 'Share' ? 'শেয়ার (Share)' :
                                sector === 'FDR' ? 'FDR / আমানত' :
                                    sector === 'DPS' ? 'DPS / সঞ্চয়' :
                                        sector === 'Loan' ? 'বিনিয়োগ (Loan)' :
                                            sector === 'Salary' ? 'বেতন (Salary)' :
                                                sector === 'Expense' ? 'খরচ (Expense)' :
                                                    sector === 'Profit' ? 'মুনাফা (Profit)' : 'অন্যান্য'}
                        </button>
                    ))}
                </div>

                {/* Ledger Content */}
                <div className="flex-1 p-0">
                    <div className="bg-slate-900 text-white p-6 flex items-center justify-between print:bg-white print:text-black print:border-b-2 print:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <BookOpen size={24} className="text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-widest">{activeSector} LEDGER</h4>
                                <p className="text-xs text-slate-400 font-medium">খতিয়ান কোড: L-{activeSector.substring(0, 2).toUpperCase()}-001</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Sector Balance</p>
                            <p className="text-3xl font-black font-mono text-emerald-400">৳ {(totalSectorAmount || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">তারিখ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">নাম / উৎস</th>
                                    <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase text-center">টাইপ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">পরিমাণ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono">
                                {allItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-black text-slate-800">{item.memberName}</p>
                                            <p className="text-[10px] text-slate-400 font-sans italic">{item.description || 'Verified Internal Transaction'}</p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                            <span className="text-[10px] border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-sans font-bold uppercase">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-black text-slate-700">
                                            ৳ {safeNumber(item.amount).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {allItems.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-slate-300">
                                            <Tag size={48} className="mx-auto mb-4 opacity-10" />
                                            <p className="font-bold text-lg">এই খাতে কোন তথ্য নেই</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ReportLayout>
    );
};

export default GeneralLedger;
