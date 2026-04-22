import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import ReportLayout from '../components/ReportLayout';
import { ShoppingBag, Truck, Calendar, CreditCard } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';

const PurchaseReport = () => {
    const { inventoryPurchases, fetchInventoryPurchases, loading, error } = useStore();

    useEffect(() => {
        fetchInventoryPurchases();
    }, [fetchInventoryPurchases]);

    const sPurchases = safeArray(inventoryPurchases);

    if (loading && sPurchases.length === 0) return <LoadingSpinner />;
    if (error && sPurchases.length === 0) return <ErrorBanner message={error} onRetry={fetchInventoryPurchases} />;

    return (
        <ReportLayout title="ক্রয় রিপোর্ট (Purchase Report)">
            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">তথ্য</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">সরবরাহকারী (Supplier)</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">পণ্যের বিবরণ</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">পরিমাণ</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">মোট মূল্য</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">স্ট্যাটাস</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sPurchases.map((purchase) => {
                            const item = purchase.items?.[0] || {};
                            const product = item.inventoryItem || {};
                            return (
                                <tr key={purchase._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(purchase.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono">#{purchase._id?.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                                <Truck size={14} className="text-emerald-500" />
                                                {purchase.supplier}
                                            </span>
                                            <span className="text-xs text-slate-500">{purchase.supplierPhone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <ShoppingBag size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{product.name || 'Unknown Product'}</span>
                                                <span className="text-[10px] text-slate-400">{product.model} • {product.brand}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-700">
                                        {safeNumber(item.qty)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-black text-emerald-700 font-mono">
                                                ৳ {safeNumber(purchase.totalAmount).toLocaleString()}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                                <CreditCard size={10} /> {purchase.paymentType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${purchase.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {purchase.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                        <tr className="font-bold text-slate-800">
                            <td colSpan="3" className="px-6 py-4 text-sm uppercase tracking-wider">সর্বমোট ক্রয় (Total Inventory Cost):</td>
                            <td className="px-6 py-4 text-right font-mono text-lg">
                                {sPurchases.reduce((acc, curr) => acc + (curr.items?.[0]?.qty || 0), 0)}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-700 text-lg">
                                ৳ {sPurchases.reduce((acc, curr) => acc + safeNumber(curr.totalAmount), 0).toLocaleString()}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </ReportLayout>
    );
};

export default PurchaseReport;
