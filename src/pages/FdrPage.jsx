import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Settings, Plus, Calendar } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';

const FdrPage = () => {
    const { fdr, members, addFdr, settings } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ memberId: '', amount: '50000', months: '12' });

    const sFdr = safeArray(fdr);
    const sMembers = safeArray(members);

    const calculateProfit = (amount, months) => {
        const rate = settings?.fdrProfitRate || 6;
        const amt = safeNumber(amount);
        const mths = safeNumber(months);
        return (amt * (rate / 100) * (mths / 12)).toFixed(0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newFdr = {
            id: `F-${sFdr.length + 1}`,
            memberId: formData.memberId,
            amount: parseInt(formData.amount),
            startDate: new Date().toISOString().split('T')[0],
            maturityDate: new Date(new Date().setMonth(new Date().getMonth() + parseInt(formData.months))).toISOString().split('T')[0],
            profitRate: settings?.fdrProfitRate || 6,
            status: 'Active'
        };
        addFdr(newFdr);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">মেয়াদি আমানত (FDR)</h2>
                    <p className="text-slate-500">Fixed Deposit Receipts ({settings?.fdrProfitRate || 6}% Profit)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-800 transition shadow-lg"
                >
                    <Plus size={20} />
                    নতুন FDR
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sFdr.map((item, idx) => {
                    const member = sMembers.find(m => m.id === item.memberId);
                    const profit = calculateProfit(item.amount, 12); // Assuming 1 year view for simplicity card

                    return (
                        <div key={item.id || idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 bg-emerald-50 rounded-bl-xl text-emerald-700 font-bold text-xs">
                                {item.status}
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    {(member?.name || '?')[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{member?.name || 'Unknown'}</h3>
                                    <p className="text-xs text-slate-500">ID: {item.memberId} • FDR: {item.id}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">বিনিয়োগকৃত টাকা</span>
                                    <span className="font-bold text-slate-800">৳ {safeNumber(item.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">লাভ ({item.profitRate}%)</span>
                                    <span className="font-bold text-emerald-600">+ ৳ {safeNumber(profit).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">মেয়াদ উত্তীর্ণ</span>
                                    <span className="font-medium text-slate-800">{item.maturityDate}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-xl p-6 space-y-4 animate-scaleIn">
                        <h3 className="text-lg font-bold text-slate-800">নতুন FDR খুলুন</h3>

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
                            <label className="block text-sm font-medium text-slate-700 mb-1">টাকার পরিমাণ</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">মেয়াদ (মাস)</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.months}
                                onChange={e => setFormData({ ...formData, months: e.target.value })}
                            >
                                <option value="6">৬ মাস</option>
                                <option value="12">১ বছর</option>
                                <option value="24">২ বছর</option>
                                <option value="36">৩ বছর</option>
                            </select>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <p className="text-sm text-emerald-800">প্রত্যাশিত লাভ: <strong>৳ {safeNumber(calculateProfit(formData.amount, formData.months)).toLocaleString()}</strong></p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">বাতিল</button>
                            <button type="submit" className="flex-1 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800">নিশ্চিত করুন</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FdrPage;
