
import React from 'react';
import useStore from '../store/useStore';
import { Users, TrendingUp } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';

const ShareholderList = () => {
    const { shareholders, settings, stats } = useStore();

    const sShareholders = safeArray(shareholders);
    const sStats = stats || {};
    const sSettings = settings || {};

    // Calculate Total Capital from Shareholders
    const totalCapital = sShareholders.reduce((acc, s) => acc + safeNumber(s.totalInvestment ?? s.totalAmount ?? 0), 0);

    const distributableProfit = safeNumber(sStats.netProfit) * (safeNumber(sSettings.dividendShareholderSplit) / 100 || 0.75);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">শেয়ারহোল্ডার তালিকা</h2>
                    <p className="text-slate-500">Shareholder List & Accrued Dividends</p>
                </div>
                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <TrendingUp size={20} />
                    Total Capital: ৳ {totalCapital.toLocaleString()}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Name & ID</th>
                            <th className="p-4 font-semibold text-slate-600">Address</th>
                            <th className="p-4 font-semibold text-slate-600 text-center">Shares</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Total Investment</th>
                            <th className="p-4 font-semibold text-emerald-600 text-right">Accrued Dividend (75%)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sShareholders.map(shareholder => {
                            // Normalization Mapping
                            const totalAmountValue = safeNumber(shareholder.totalInvestment ?? shareholder.totalAmount ?? 0);
                            const shareAmount = safeNumber(shareholder.numberOfShares ?? (totalAmountValue / 50000) ?? 0);
                            const sId = shareholder.shareholderId ?? shareholder.id ?? "N/A";

                            // Dividend Calculation
                            const shareRatio = totalCapital > 0 ? (totalAmountValue / totalCapital) : 0;
                            const accruedDividend = distributableProfit * shareRatio;
                            const address = shareholder.address || {};

                            return (
                                <tr key={sId} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={shareholder.photo || "https://i.pravatar.cc/150"} alt="" className="w-10 h-10 rounded-full bg-slate-200" />
                                            <div>
                                                <p className="font-bold text-slate-800">{shareholder.name}</p>
                                                <p className="text-xs text-slate-500">{sId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {address.village || ''}, {address.upazila || ''}, {address.district || ''}
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-700">
                                        {shareAmount}
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-800">
                                        ৳ {totalAmountValue.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right font-bold text-emerald-600">
                                        ৳ {accruedDividend.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                        {sShareholders.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">No shareholders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-slate-400 text-center">
                * Accrued Dividend is calculated based on current Net Profit ({safeNumber(sStats.netProfit).toLocaleString()}) and 75% Shareholder Split.
            </p>
        </div>
    );
};

export default ShareholderList;
