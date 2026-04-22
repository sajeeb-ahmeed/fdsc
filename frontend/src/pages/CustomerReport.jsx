import React, { useState } from 'react';
import useStore from '../store/useStore';
import ReportLayout from '../components/ReportLayout';
import { User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import clsx from 'clsx';
import { safeArray, safeNumber } from '../utils/safe';

const CustomerReport = () => {
    const { members, transactions } = useStore();
    const [selectedMemberId, setSelectedMemberId] = useState('');

    const sMembers = safeArray(members);
    const sTransactions = safeArray(transactions);

    const selectedMember = sMembers.find(m => m.id === selectedMemberId);

    // Filter transactions for specific user
    const userTransactions = sTransactions.filter(t => t.memberName === selectedMember?.name);

    return (
        <ReportLayout
            title="গ্রাহক লেজার (Customer Ledger)"
            showSearch={false} // Custom select instead
        >
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-end print:hidden">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">সদস্য নির্বাচন করুন</label>
                    <select
                        className="w-full p-3 border rounded-xl bg-slate-50 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                    >
                        <option value="">নির্বাচন করুন...</option>
                        {sMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.id})</option>)}
                    </select>
                </div>
                <div className="animate-fadeIn">
                    {selectedMember && (
                        <div className="flex gap-4">
                            <div className="bg-emerald-50 p-2 px-4 rounded-xl border border-emerald-100">
                                <p className="text-[10px] uppercase font-bold text-emerald-600">Savings</p>
                                <p className="text-lg font-black text-emerald-900 font-mono">৳ {safeNumber(selectedMember.savingsBalance).toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-50 p-2 px-4 rounded-xl border border-blue-100">
                                <p className="text-[10px] uppercase font-bold text-blue-600">Share</p>
                                <p className="text-lg font-black text-blue-900 font-mono">৳ {safeNumber(selectedMember.shareBalance).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!selectedMemberId ? (
                <div className="p-20 text-center text-slate-400">
                    <User size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold">সদস্য নির্বাচন করলে লেজার দেখা যাবে</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="hidden print:block p-6 bg-slate-50 mb-4 rounded-xl border border-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 font-bold">গ্রাহকের নাম:</p>
                                <p className="text-xl font-black text-slate-800">{selectedMember?.name}</p>
                                <p className="text-sm text-slate-600">আইডি: {selectedMember?.id} | মোবাইল: {selectedMember?.mobile}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-bold">বর্তমান ব্যালেন্স:</p>
                                <p className="text-2xl font-black text-emerald-700 font-mono">৳ {(safeNumber(selectedMember?.savingsBalance) + safeNumber(selectedMember?.shareBalance)).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">তারিখ</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">বিবরণ (Description)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">ডেবিট (Debit)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">ক্রেডিট (Credit)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">ব্যালেন্স</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                            {userTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-sans">কোন লেনদেন পাওয়া যায়নি</td>
                                </tr>
                            ) : (
                                userTransactions.map((t, idx) => {
                                    const isCredit = !['Share Withdraw', 'Expense', 'Savings Withdraw'].includes(t.type);
                                    const amount = safeNumber(t.amount);
                                    return (
                                        <tr key={t.id || idx} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{t.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {isCredit ? (
                                                        <ArrowDownLeft size={16} className="text-emerald-500" />
                                                    ) : (
                                                        <ArrowUpRight size={16} className="text-red-500" />
                                                    )}
                                                    <span className="text-sm font-bold text-slate-700">{t.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                {!isCredit ? `৳ ${amount.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-emerald-600 font-bold">
                                                {isCredit ? `৳ ${amount.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-black text-slate-800">
                                                {/* Mock balance for display */}
                                                ৳ {(5000 + (isCredit ? amount : -amount)).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </ReportLayout>
    );
};

export default CustomerReport;
