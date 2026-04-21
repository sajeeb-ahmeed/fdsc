import React from 'react';
import useStore from '../store/useStore';
import ReportLayout from '../components/ReportLayout';
import { Tag } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';

const SellReport = () => {
    const { creditPurchases, members } = useStore();

    const sCreditPurchases = safeArray(creditPurchases);
    const sMembers = safeArray(members);

    return (
        <ReportLayout title="বিক্রয় রিপোর্ট (Sell Report)">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">তারিখ</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">পণ্যের নাম / বিবরণ</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">ক্রেতা (Customer)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">মূল্য (Price)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">লভ্যাংশ (Profit)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sCreditPurchases.map((sale, idx) => {
                            const member = sMembers.find(m => m.id === sale.memberId);
                            return (
                                <tr key={sale.id || idx} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{sale.disbursedDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Tag size={14} className="text-emerald-500" />
                                            <span className="text-sm font-bold text-slate-800">{sale.productName}</span>
                                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono italic">{sale.model}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-slate-700">{member?.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">ID: {sale.memberId}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-sm">৳ {safeNumber(sale.principalAmount).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold font-mono text-emerald-600 text-sm">
                                        + ৳ {safeNumber(sale.profit).toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-800">
                        <tr>
                            <td colSpan="3" className="px-6 py-4">সর্বমোট সেল ও লভ্যাংশ:</td>
                            <td className="px-6 py-4 text-right font-mono">
                                ৳ {sCreditPurchases.reduce((acc, curr) => acc + safeNumber(curr.principalAmount), 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-600">
                                ৳ {sCreditPurchases.reduce((acc, curr) => acc + safeNumber(curr.profit), 0).toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </ReportLayout>
    );
};

export default SellReport;
