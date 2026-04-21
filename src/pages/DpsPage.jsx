import React, { useState } from 'react';
import useStore from '../store/useStore';
import { TrendingUp, Calendar, Wallet, Plus } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';

const DpsPage = () => {
    const { dps, members, addDps, settings } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ memberId: '', amount: '500', years: '3' });

    const sDps = safeArray(dps);
    const sMembers = safeArray(members);

    const calculateMaturity = (monthlyAmount, years) => {
        const rate = settings?.dpsProfitRate || 3;
        const mAmount = safeNumber(monthlyAmount);
        const yrs = safeNumber(years);
        const totalPrincipal = mAmount * 12 * yrs;
        // Simple interest estimate for demo
        const profit = totalPrincipal * (rate / 100) * yrs;
        return (totalPrincipal + profit).toFixed(0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newDps = {
            id: `D-${sDps.length + 1}`,
            memberId: formData.memberId,
            amount: parseInt(formData.amount),
            startDate: new Date().toISOString().split('T')[0],
            maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + parseInt(formData.years))).toISOString().split('T')[0],
            profitRate: settings?.dpsProfitRate || 3,
            status: 'Active'
        };
        addDps(newDps);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">ডিপিএস (DPS)</h2>
                    <p className="text-slate-500">Deposit Pension Scheme ({settings?.dpsProfitRate || 3}% Profit)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-800 transition shadow-lg"
                >
                    <Plus size={20} />
                    নতুন DPS
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sDps.map((item, idx) => {
                    const member = sMembers.find(m => m.id === item.memberId);
                    return (
                        <div key={item.id || idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 bg-purple-50 rounded-bl-xl text-purple-700 font-bold text-xs">
                                {item.status}
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    {(member?.name || '?')[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{member?.name || 'Unknown'}</h3>
                                    <p className="text-xs text-slate-500">ID: {item.memberId} • DPS: {item.id}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">মাসিক জমা</span>
                                    <span className="font-bold text-slate-800">৳ {safeNumber(item.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">মুনাফার হার</span>
                                    <span className="font-bold text-purple-600">{item.profitRate}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">মেয়াদ উত্তীর্ণ</span>
                                    <span className="font-medium text-slate-800">{item.maturityDate}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {sDps.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">কোনো ডিপিএস অ্যাকাউন্ট নেই</p>}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-xl p-6 space-y-4 animate-scaleIn">
                        <h3 className="text-lg font-bold text-slate-800">নতুন DPS খুলুন</h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">সদস্য নির্বাচন</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.memberId}
                                onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                                required
                            >
                                <option value="">সদস্য নির্বাচন করুন...</option>
                                {sMembers.map((m, idx) => <option key={m.id || idx} value={m.id}>{m.name} ({m.id})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">মাসিক জমার পরিমাণ</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            >
                                <option value="500">৫০০ টাকা</option>
                                <option value="1000">১০০০ টাকা</option>
                                <option value="2000">২০০০ টাকা</option>
                                <option value="5000">৫০০০ টাকা</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">মেয়াদ (বছর)</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.years}
                                onChange={e => setFormData({ ...formData, years: e.target.value })}
                            >
                                <option value="3">৩ বছর</option>
                                <option value="5">৫ বছর</option>
                                <option value="10">১০ বছর</option>
                            </select>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-purple-800">সম্ভাব্য মোট ফেরত: <strong>৳ {safeNumber(calculateMaturity(formData.amount, formData.years)).toLocaleString()}</strong></p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">বাতিল</button>
                            <button type="submit" className="flex-1 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800">নিশ্চিত করুন</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DpsPage;
