import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import ReportLayout from '../components/ReportLayout';
import { Package, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import clsx from 'clsx';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';
import { safeArray, safeNumber } from '../utils/safe';

const StockReport = () => {
    const { inventory, fetchInventory, loading, error } = useStore();

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const sInventory = safeArray(inventory);

    if (loading && sInventory.length === 0) return <LoadingSpinner />;
    if (error && sInventory.length === 0) return <ErrorBanner message={error} onRetry={fetchInventory} />;

    return (
        <ReportLayout title="স্টক রিপোর্ট (Inventory Report)">
            <div className="mb-6 flex justify-end">
                <Link
                    to="/product-application"
                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-800 transition shadow-lg"
                >
                    <Plus size={20} />
                    নতুন স্টক ইন (Purchase)
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">পণ্যের নাম</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">মডেল/ব্র্যান্ড</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">ইউনিট কস্ট</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">বর্তমান স্টক</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">স্ট্যাটাস</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sInventory.map((item) => (
                            <tr key={item._id} className="hover:bg-slate-50/50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">
                                    {item.model} • {item.brand}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-emerald-700">
                                    ৳ {safeNumber(item.unitCost).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={clsx(
                                        "text-sm font-black font-mono px-3 py-1 rounded-full",
                                        safeNumber(item.stockCount) <= 3 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                                    )}>
                                        {safeNumber(item.stockCount)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {safeNumber(item.stockCount) <= 3 ? (
                                        <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-bold uppercase">
                                            <AlertTriangle size={14} /> Low
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-bold uppercase">
                                            <CheckCircle2 size={14} /> OK
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ReportLayout>
    );
};

export default StockReport;
