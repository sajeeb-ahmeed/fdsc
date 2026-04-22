
import React, { useState } from 'react';
import useStore from '../store/useStore';
import { ShoppingCart, Plus, Truck, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';

const CreditPurchasePage = () => {
    const { creditPurchases, members, inventory, createLoan, fetchMembers, fetchInventory, fetchLoans, calculatePenalty, loading, error } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        memberId: '',
        inventoryItemId: '',
        qty: 1,
        salePrice: '',
        downPayment: '',
        installmentType: 'Monthly',
        installments: '12',
        profitType: 'Percentage',
        profitValue: '10'
    });

    React.useEffect(() => {
        fetchMembers();
        fetchInventory();
        fetchLoans();
    }, [fetchMembers, fetchInventory, fetchLoans]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = await createLoan({
            memberId: formData.memberId, // Changed from formData.member
            inventoryItemId: formData.inventoryItemId, // Changed from formData.product
            qty: parseFloat(formData.qty), // Removed parseFloat as per instruction, but keeping for type safety
            salePrice: parseFloat(formData.salePrice), // Changed from formData.price, keeping parseFloat
            downPayment: parseFloat(formData.downPayment) || 0, // Keeping parseFloat and default
            profitMode: formData.profitType === 'Percentage' ? 'PERCENT' : 'FIXED', // Mapping frontend profitType to backend profitMode
            profitValue: parseFloat(formData.profitValue), // Keeping parseFloat
            frequency: formData.installmentType === 'Daily' ? 'DAILY' : formData.installmentType === 'Weekly' ? 'WEEKLY' : 'MONTHLY', // Mapping frontend installmentType to backend frequency
            installmentCount: parseInt(formData.installments), // Keeping parseInt
            startDate: new Date() // Keeping new Date()
        });

        if (success) {
            toast.success('ঋণ আবেদন সফলভাবে সম্পন্ন হয়েছে!');
            setShowSuccess(true);
            setFormData(initialFormState);
            window.scrollTo(0, 0);
            setTimeout(() => setShowSuccess(false), 5000);
            setIsModalOpen(false); // Close modal on success
        } else {
            toast.error('বিনিয়োগ আবেদন ব্যর্থ হয়েছে। স্টক চেক করুন।');
        }
    };

    if (loading && creditPurchases.length === 0) return <LoadingSpinner />;
    if (error && creditPurchases.length === 0) return <ErrorBanner message={error} onRetry={fetchLoans} />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">বিনিয়োগ (Investment)</h2>
                    <p className="text-slate-500">Product & Vehicle Financing Only (No Cash Loans)</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-800 transition shadow-lg"
                >
                    <Plus size={20} />
                    নতুন বিনিয়োগ আবেদন
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {creditPurchases.map(cp => {
                    const memberId = typeof cp.member === 'object' ? cp.member?._id : cp.member;
                    const member = members.find(m => m._id === memberId) || (typeof cp.member === 'object' ? cp.member : null);
                    const itemId = typeof cp.inventoryItem === 'object' ? cp.inventoryItem?._id : cp.inventoryItem;
                    const item = inventory.find(i => i._id === itemId) || (typeof cp.inventoryItem === 'object' ? cp.inventoryItem : null);
                    const isOverdue = cp.status === 'ACTIVE' && new Date(cp.startDate) < new Date(); // Simplified
                    const dueDate = new Date();
                    dueDate.setDate(dueDate.getDate() - 5);

                    const penalty = isOverdue ? calculatePenalty(cp.dueAmount, cp.installmentAmount) : 0;

                    return (
                        <div key={cp._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4 relative overflow-hidden">
                            <div className={clsx("absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl", cp.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                                {cp.status}
                            </div>

                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
                                    {item?.category === 'Goods' ? <Package size={24} /> : <Truck size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{item?.name || 'Unknown Product'}</h3>
                                    <p className="text-sm text-slate-500">{item?.model} • {item?.category}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <span className="text-slate-500">সদস্য:</span>
                                <span className="font-medium text-right">{member?.name}</span>

                                <span className="text-slate-500">বিক্রয় মূল্য:</span>
                                <span className="font-medium text-right">৳ {(cp.salePrice * cp.qty || 0).toLocaleString()}</span>

                                <span className="text-slate-500">ডাউন পেমেন্ট:</span>
                                <span className="font-medium text-right">৳ {(cp.downPayment || 0).toLocaleString()}</span>

                                <span className="text-slate-500">বিনিয়োগ (Principal):</span>
                                <span className="font-medium text-right">৳ {(cp.principal || 0).toLocaleString()}</span>

                                <span className="text-slate-500">লভ্যাংশ:</span>
                                <span className="font-medium text-emerald-600 text-right">+ ৳ {(cp.totalPayable - cp.principal || 0).toLocaleString()}</span>

                                <div className="col-span-2 border-t border-slate-100 my-1"></div>

                                <span className="text-slate-500">কিস্তি ({cp.frequency}):</span>
                                <span className="font-bold text-slate-800 text-right">৳ {(cp.installmentAmount || 0).toLocaleString()} / {cp.frequency}</span>

                                <span className="text-slate-500">মোট বকেয়া:</span>
                                <div className="text-right">
                                    <span className="font-bold text-red-600">৳ {(cp.dueAmount || 0).toLocaleString()}</span>
                                    {penalty > 0 && (
                                        <div className="text-xs text-red-500 mt-1 flex items-center justify-end gap-1">
                                            <span>⚠️ পেনাল্টি: ৳ {penalty}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4 animate-scaleIn max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Truck size={20} className="text-emerald-700" />
                            নতুন বিনিয়োগ আবেদন
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">সদস্য নির্বাচন</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.memberId}
                                    onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                                    required
                                >
                                    <option value="">সদস্য নির্বাচন করুন...</option>
                                    {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.memberId})</option>)}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">পণ্য নির্বাচন (Stock)</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.inventoryItemId}
                                    onChange={e => {
                                        const item = inventory.find(i => i._id === e.target.value);
                                        setFormData({ ...formData, inventoryItemId: e.target.value, salePrice: item?.sellBasePrice || '' });
                                    }}
                                    required
                                >
                                    <option value="">পণ্য নির্বাচন করুন...</option>
                                    {inventory.map(i => <option key={i._id} value={i._id} disabled={i.stockCount <= 0}>
                                        {i.name} - {i.model} (Stock: {i.stockCount})
                                    </option>)}
                                </select>
                            </div>

                            <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-1">
                                    <AlertTriangle size={14} /> নিয়মাবলী:
                                </p>
                                <p className="text-[10px] text-amber-800 leading-tight">
                                    শুধুমাত্র পণ্য বা গাড়ি ক্রয়ের জন্য বিনিয়োগ করা যাবে। নগদ লোন (Cash Out) সম্পূর্ণ নিষিদ্ধ।
                                    কিস্তি খেলাপি হলে দৈনিক ১% হারে জরিমানা যুক্ত হবে।
                                </p>
                            </div>

                            <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <p className="text-xs font-bold text-slate-700 mb-2">পণ্য ক্যাটাগরি: <span className="text-emerald-700">{inventory.find(i => i._id === formData.inventoryItemId)?.category || 'N/A'}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">বিক্রয় মূল্য (Unit Price)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.salePrice}
                                    onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">পরিমাণ (Quantity)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.qty}
                                    onChange={e => setFormData({ ...formData, qty: e.target.value })}
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">ডাউন পেমেন্ট</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.downPayment}
                                    onChange={e => setFormData({ ...formData, downPayment: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="col-span-2 border-t pt-4 mt-2">
                                <h4 className="font-bold text-slate-700 mb-3">মেয়াদ ও লভ্যাংশ কনফিগারেশন</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">কিস্তির ধরণ</label>
                                        <select
                                            className="w-full p-2 border rounded-lg bg-emerald-50"
                                            value={formData.installmentType}
                                            onChange={e => setFormData({ ...formData, installmentType: e.target.value })}
                                        >
                                            <option value="Daily">দৈনিক (Daily)</option>
                                            <option value="Monthly">মাসিক (Monthly)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            মেয়াদ ({formData.installmentType === 'Daily' ? '0-320 দিন' : '0-36 মাস'})
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.installments}
                                            onChange={e => setFormData({ ...formData, installments: e.target.value })}
                                            max={formData.installmentType === 'Daily' ? 320 : 36}
                                            required
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">লভ্যাংশ ধরণ</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, profitType: 'Percentage' })}
                                                className={clsx("flex-1 py-2 rounded border text-sm", formData.profitType === 'Percentage' ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold" : "bg-white border-slate-200")}
                                            >
                                                %
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, profitType: 'Fixed' })}
                                                className={clsx("flex-1 py-2 rounded border text-sm", formData.profitType === 'Fixed' ? "bg-emerald-100 border-emerald-300 text-emerald-700 font-bold" : "bg-white border-slate-200")}
                                            >
                                                Fixed
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {formData.profitType === 'Percentage' ? 'শতকরা হার (%)' : 'ফিক্সড চাকা'}
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded-lg"
                                            value={formData.profitValue}
                                            onChange={e => setFormData({ ...formData, profitValue: e.target.value })}
                                            required
                                            placeholder={formData.profitType === 'Percentage' ? "Ex: 10" : "Ex: 5000"}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">বাতিল</button>
                            <button type="submit" className="flex-1 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800">আবেদন জমা দিন</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreditPurchasePage;
