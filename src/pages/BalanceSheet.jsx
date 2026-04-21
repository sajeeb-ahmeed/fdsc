import React from 'react';
import useStore from '../store/useStore';
import ReportLayout from '../components/ReportLayout';
import { ShieldCheck, Landmark } from 'lucide-react';
import clsx from 'clsx';
import { safeArray, safeNumber } from '../utils/safe';

const BalanceSheet = () => {
    const { balanceSheetData, fetchBalanceSheet } = useStore();

    React.useEffect(() => {
        fetchBalanceSheet();
    }, [fetchBalanceSheet]);

    if (!balanceSheetData) return null;

    const { assets, liabilities } = balanceSheetData;
    const cashInHand = safeNumber(assets.cash);
    const loanPrincipalDue = safeNumber(assets.loans);
    const totalAssets = safeNumber(assets.total);

    const shareCapital = safeNumber(liabilities.shares);
    const savingsBalance = safeNumber(liabilities.savings);
    const unpaidProfit = safeNumber(liabilities.netProfit);
    const totalLiabilities = safeNumber(liabilities.total);

    return (
        <ReportLayout title="ব্যালেন্স শিট (Audit Balance Sheet)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x-2 divide-slate-800 bg-white min-h-[600px]">
                {/* Assets Column */}
                <div className="p-0 flex flex-col">
                    <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b-2 border-slate-800">
                        <h3 className="text-xl font-black uppercase flex items-center gap-2 tracking-widest">
                            <Landmark size={24} className="text-emerald-400" /> পরিসম্পদ (Assets)
                        </h3>
                    </div>

                    <div className="flex-1 p-8 space-y-8">
                        <div className="flex justify-between items-center group">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg">ক্যাশ ইন হ্যান্ড (Cash)</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase">Liquid Assets</p>
                            </div>
                            <span className="text-2xl font-black font-mono text-slate-900">৳ {cashInHand.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center group border-t border-slate-100 pt-8">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg">বিনিয়োগ বকেয়া (Loans)</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase">Receivables (Principal)</p>
                            </div>
                            <span className="text-2xl font-black font-mono text-slate-900">৳ {loanPrincipalDue.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="bg-slate-100 p-8 mt-auto border-t-2 border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Assets</span>
                            <span className="text-3xl font-black font-mono text-emerald-700">৳ {totalAssets.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Liabilities Column */}
                <div className="p-0 flex flex-col">
                    <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b-2 border-slate-800">
                        <h3 className="text-xl font-black uppercase flex items-center gap-2 tracking-widest">
                            <ShieldCheck size={24} className="text-amber-400" /> দায় ও মূলধন (Liabilities)
                        </h3>
                    </div>

                    <div className="flex-1 p-8 space-y-8">
                        <div className="flex justify-between items-center group">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg">শেয়ার মূলধন (Equity)</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase">Shareholder Capital</p>
                            </div>
                            <span className="text-2xl font-black font-mono text-slate-900">৳ {shareCapital.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center group border-t border-slate-100 pt-8">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg">সঞ্চয় আমানত (Savings)</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase">Member Savings</p>
                            </div>
                            <span className="text-2xl font-black font-mono text-slate-900">৳ {savingsBalance.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center group border-t border-slate-100 pt-8">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg">বকেয়া মুনাফা (Reserves)</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase">Unpaid Dividends (10%)</p>
                            </div>
                            <span className="text-2xl font-black font-mono text-slate-900">৳ {unpaidProfit.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="bg-slate-100 p-8 mt-auto border-t-2 border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total Liabilities</span>
                            <span className="text-3xl font-black font-mono text-amber-700">৳ {totalLiabilities.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Status */}
            <div className="bg-emerald-900 text-emerald-100 p-4 font-bold text-center uppercase tracking-[0.2em] text-xs">
                {Math.abs(totalAssets - totalLiabilities) < 1 ? 'Statement is Balanced (Audit-Verified)' : 'Statement Mismatch Warning'}
            </div>
        </ReportLayout>
    );
};

export default BalanceSheet;
