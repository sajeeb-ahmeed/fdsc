import React, { useState } from 'react';
import useStore from '../store/useStore';
import { PiggyBank, TrendingUp, History, Plus, Minus, ArrowRightLeft, Users } from 'lucide-react';
import clsx from 'clsx';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';
import { safeArray, safeNumber } from '../utils/safe';

const SharePage = () => {
    const { fetchShareholders, shareholders, issueShares, transferShares, settings, loading, error } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('buy'); // 'buy', 'transfer'
    const [selectedShareholderId, setSelectedShareholderId] = useState(''); // Shareholder _id
    const [targetShareholderId, setTargetShareholderId] = useState(''); // Target Shareholder _id for transfer
    const [shareCount, setShareCount] = useState(1);

    React.useEffect(() => {
        fetchShareholders();
    }, [fetchShareholders]);

    const sShareholders = safeArray(shareholders);
    const SHARE_PRICE = settings?.shareValue || 50000;

    const handleAction = async () => {
        if (!selectedShareholderId) return;
        if (modalType === 'transfer' && !targetShareholderId) return;

        let success = false;
        if (modalType === 'transfer') {
            success = await transferShares({
                fromShareholderId: selectedShareholderId,
                toShareholderId: targetShareholderId,
                sharesCount: shareCount,
                date: new Date()
            });
        } else if (modalType === 'buy') {
            success = await issueShares({
                shareholderId: selectedShareholderId,
                sharesCount: shareCount,
                date: new Date(),
                account: 'CASH'
            });
        }

        if (success) {
            setIsModalOpen(false);
            setShareCount(1);
            setSelectedShareholderId('');
            setTargetShareholderId('');
        }
    };

    const totalShareCapital = sShareholders.reduce((acc, s) => acc + safeNumber(s.totalInvestment ?? s.totalAmount ?? 0), 0);

    if (loading && sShareholders.length === 0) return <LoadingSpinner />;
    if (error && sShareholders.length === 0) return <ErrorBanner message={error} onRetry={fetchShareholders} />;

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-emerald-200 font-medium mb-1">বর্তমান শেয়ার মূল্য</h3>
                    <p className="text-3xl font-bold">৳ {SHARE_PRICE.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-medium mb-1">মোট শেয়ার মূলধন</h3>
                    <p className="text-3xl font-bold text-emerald-700">৳ {totalShareCapital.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-500 font-medium mb-1">শেয়ারহোল্ডার</h3>
                        <p className="text-3xl font-bold text-slate-800">{sShareholders.length}</p>
                    </div>
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-700">
                        <Users size={24} />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={() => { setModalType('buy'); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl hover:bg-emerald-800 shadow-lg shadow-emerald-700/20 active:scale-95 transition"
                >
                    <Plus size={20} />
                    শেয়ার ক্রয়
                </button>
                <button
                    onClick={() => { setModalType('transfer'); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-200 transition"
                >
                    <ArrowRightLeft size={20} />
                    শেয়ার হস্তান্তর (Transfer)
                </button>
            </div>

            {/* Shareholder List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">ID</th>
                            <th className="p-4 font-semibold text-slate-600">শেয়ারহোল্ডার</th>
                            <th className="p-4 font-semibold text-slate-600 text-center">শেয়ার সংখ্যা</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">মোট মূল্য</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sShareholders.map((s, idx) => {
                            const sId = s.shareholderId ?? s.id ?? "N/A";
                            const sShares = safeNumber(s.numberOfShares ?? (safeNumber(s.totalInvestment ?? s.totalAmount) / SHARE_PRICE) ?? 0);
                            const sValue = safeNumber(s.totalInvestment ?? s.totalAmount ?? 0);

                            return (
                                <tr key={s._id || idx} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 font-medium">{sId}</td>
                                    <td className="p-4 font-semibold text-slate-800 flex items-center gap-3">
                                        <img src={s.photo || "https://i.pravatar.cc/150"} className="w-8 h-8 rounded-full bg-slate-200" alt={s.name} />
                                        {s.name}
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-700">
                                        {sShares} টি
                                    </td>
                                    <td className="p-4 text-right font-bold text-emerald-700">
                                        ৳ {sValue.toLocaleString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-6 animate-scaleIn">
                        <h3 className="text-xl font-bold text-slate-800">
                            {modalType === 'buy' && 'শেয়ার ক্রয় ফরম'}
                            {modalType === 'sell' && 'শেয়ার উত্তোলন ফরম'}
                            {modalType === 'transfer' && 'শেয়ার হস্তান্তর ফরম'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {modalType === 'transfer' ? 'হস্তান্তরকারী (Sender)' : 'শেয়ারহোল্ডার নির্বাচন করুন'}
                                </label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                    value={selectedShareholderId}
                                    onChange={(e) => setSelectedShareholderId(e.target.value)}
                                >
                                    <option value="">-- শেয়ারহোল্ডার --</option>
                                    {sShareholders.map((s, idx) => (
                                        <option key={s._id || idx} value={s._id}>{s.name} ({s.shareholderId || s.id})</option>
                                    ))}
                                </select>
                            </div>

                            {modalType === 'transfer' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">গ্রহণকারী (Receiver)</label>
                                    <select
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                                        value={targetShareholderId}
                                        onChange={(e) => setTargetShareholderId(e.target.value)}
                                    >
                                        <option value="">-- শেয়ারহোল্ডার --</option>
                                        {sShareholders.filter(s => s._id !== selectedShareholderId).map((s, idx) => (
                                            <option key={s._id || idx} value={s._id}>{s.name} ({s.shareholderId || s.id})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">শেয়ার সংখ্যা</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setShareCount(Math.max(1, shareCount - 1))} className="p-2 bg-slate-100 rounded-lg"><Minus size={16} /></button>
                                    <span className="text-xl font-bold w-12 text-center">{shareCount}</span>
                                    <button onClick={() => setShareCount(shareCount + 1)} className="p-2 bg-slate-100 rounded-lg"><Plus size={16} /></button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                                <span className="text-slate-600 font-medium">মোট টাকা:</span>
                                <span className="text-xl font-bold text-emerald-700">৳ {(shareCount * SHARE_PRICE).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">বাতিল</button>
                            <button onClick={handleAction} className="flex-1 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800">
                                {modalType === 'buy' && 'জমা দিন'}
                                {modalType === 'transfer' && 'হস্তান্তর করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharePage;
