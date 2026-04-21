import React, { useState } from 'react';
import useStore from '../store/useStore';
import { User, RefreshCw, DollarSign, Edit, Save, X, Shield } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';

const TransferModal = ({ director, onClose }) => {
    const { transferDirectorship } = useStore();
    const [newName, setNewName] = useState(director?.name || '');
    const [newMemberId, setNewMemberId] = useState(director?.memberId || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm("আপনি কি নিশ্চিত যে আপনি এই ডিরেক্টরশিপ ট্রান্সফার করতে চান?")) {
            transferDirectorship(director?.id, newName, newMemberId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">ডিরেক্টরশিপ ট্রান্সফার</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">বর্তমান ডিরেক্টর</label>
                        <div className="p-3 bg-slate-100 rounded-lg text-slate-600 font-medium">{director?.name} ({director?.id})</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">নতুন মালিকের নাম</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">নতুন মেম্বার আইডি (যদি থাকে)</label>
                        <input
                            type="text"
                            value={newMemberId}
                            onChange={(e) => setNewMemberId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-800 transition shadow-lg mt-2">
                        ট্রান্সফার নিশ্চিত করুন
                    </button>
                </form>
            </div>
        </div>
    );
};

const SaleModal = ({ director, onClose }) => {
    const { sellDirectorship } = useStore();
    const [buyerName, setBuyerName] = useState('');
    const [buyerMemberId, setBuyerMemberId] = useState('');
    const [salePrice, setSalePrice] = useState(safeNumber(director?.shareValue));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (window.confirm("আপনি কি নিশ্চিত যে আপনি এই ডিরেক্টরশিপ বিক্রি করতে চান? এটি আগের মালিককে সরিয়ে দিবে।")) {
            const newDirector = {
                memberId: buyerMemberId || 'New',
                name: buyerName,
                position: director?.position,
                shareValue: safeNumber(salePrice),
                joinDate: new Date().toISOString().split('T')[0]
            };
            sellDirectorship(director?.id, newDirector);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">ডিরেক্টরশিপ বিক্রি</h3>
                    <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-red-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                        <p className="text-sm text-red-700">সতর্কতা: এই অ্যাকশনটি বর্তমান ডিরেক্টর <strong>{director?.name}</strong>-কে তালিকা থেকে সরিয়ে দিবে।</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ক্রেতার নাম</label>
                        <input
                            type="text"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            required
                            placeholder="নতুন ডিরেক্টরের নাম"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ক্রেতার মেম্বার আইডি</label>
                        <input
                            type="text"
                            value={buyerMemberId}
                            onChange={(e) => setBuyerMemberId(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="M-XXX"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">শেয়ার মূল্য / বিক্রয় মূল্য</label>
                        <input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-emerald-700 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-800 transition shadow-lg mt-2">
                        বিক্রয় নিশ্চিত করুন
                    </button>
                </form>
            </div>
        </div>
    );
};

const DirectorShipPage = () => {
    const { directors } = useStore();
    const [selectedDirector, setSelectedDirector] = useState(null);
    const [mode, setMode] = useState(null); // 'transfer' or 'sale'

    const sDirectors = safeArray(directors);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">পরিচালনা পর্ষদ (Directorship)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sDirectors.map((director, idx) => (
                    <div key={director.id || idx} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow relative">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded uppercase">{director.status}</span>
                        </div>

                        <div className="p-6 text-center">
                            <div className="w-20 h-20 bg-emerald-700 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                                <span className="text-2xl font-bold">{(director.name || '?').charAt(0)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{director.name}</h3>
                            <p className="text-emerald-600 font-medium text-sm mb-1">{director.position}</p>
                            <p className="text-slate-400 text-xs">ID: {director.id} • Joined: {director.joinDate}</p>
                        </div>

                        <div className="border-t border-slate-100 p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 text-sm font-medium">শেয়ার ভ্যালু</span>
                                <span className="text-slate-800 font-bold">৳ {safeNumber(director.shareValue).toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => { setSelectedDirector(director); setMode('transfer'); }}
                                    className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-100 transition text-sm font-medium"
                                >
                                    <RefreshCw size={16} />
                                    ট্রান্সফার
                                </button>
                                <button
                                    onClick={() => { setSelectedDirector(director); setMode('sale'); }}
                                    className="flex items-center justify-center gap-2 bg-emerald-700 text-white py-2 rounded-lg hover:bg-emerald-800 transition text-sm font-medium shadow"
                                >
                                    <DollarSign size={16} />
                                    বিক্রয়
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {sDirectors.length === 0 && (
                <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                    কোনো সক্রিয় ডিরেক্টর পাওয়া যায়নি
                </div>
            )}

            {selectedDirector && mode === 'transfer' && (
                <TransferModal director={selectedDirector} onClose={() => { setSelectedDirector(null); setMode(null); }} />
            )}

            {selectedDirector && mode === 'sale' && (
                <SaleModal director={selectedDirector} onClose={() => { setSelectedDirector(null); setMode(null); }} />
            )}
        </div>
    );
};

export default DirectorShipPage;
