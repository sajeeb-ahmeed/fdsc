import React, { useState } from 'react';
import useStore from '../store/useStore';
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';

const HawlatPage = () => {
    const { hawlat, addHawlat } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'Receipt', amount: '' });

    const sHawlat = safeArray(hawlat);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newHawlat = {
            id: `H-${sHawlat.length + 1}`,
            ...formData,
            amount: safeNumber(formData.amount),
            date: new Date().toISOString().split('T')[0],
            status: 'Active'
        };
        addHawlat(newHawlat);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">হাওলাত (Hawlat)</h2>
                    <p className="text-slate-500">Internal Fund Transfers (Receipt/Payment)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-800 transition shadow-lg"
                >
                    <Plus size={20} />
                    নতুন হাওলাত
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sHawlat.map((item, idx) => (
                    <div key={item.id || idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${item.type === 'Receipt' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {item.type === 'Receipt' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">{item.name || 'Unnamed'}</h3>
                                <p className="text-sm text-slate-500">{item.date} • {item.type === 'Receipt' ? 'জমা (Receipt)' : 'প্রদান (Payment)'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`text-xl font-bold ${item.type === 'Receipt' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {item.type === 'Receipt' ? '+' : '-'} ৳ {safeNumber(item.amount).toLocaleString()}
                            </p>
                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">{item.status || 'Active'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-sm rounded-xl p-6 space-y-4 animate-scaleIn">
                        <h3 className="text-lg font-bold text-slate-800">নতুন হাওলাত এন্ট্রি</h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">নাম / প্রতিষ্ঠানের নাম</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="উদাঃ বিসমিল্লাহ এন্টারপ্রাইজ"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ধরণ</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'Receipt' })}
                                    className={`p-2 rounded-lg font-medium transition ${formData.type === 'Receipt' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 border' : 'bg-slate-50 border border-slate-200'}`}
                                >
                                    জমা (Receipt)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'Payment' })}
                                    className={`p-2 rounded-lg font-medium transition ${formData.type === 'Payment' ? 'bg-red-100 text-red-700 border-red-300 border' : 'bg-slate-50 border border-slate-200'}`}
                                >
                                    প্রদান (Payment)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">পরিমাণ</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
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

export default HawlatPage;
