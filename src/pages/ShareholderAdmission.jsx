import React, { useState } from 'react';
import useStore from '../store/useStore';
import { UserPlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ShareholderAdmission = () => {
    const { addShareholder, settings, loading } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        fatherName: '',
        motherName: '',
        nid: '',
        phone: '',
        address: {
            village: '',
            post: '',
            upazila: '',
            district: ''
        },
        numberOfShares: '',
        photo: null // We'll just store a placeholder or local URL for now
    });

    const shareValue = settings?.shareValue || 20000;
    const totalAmount = (parseInt(formData.numberOfShares) || 0) * shareValue;

    const handleAddressChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.nid || !formData.numberOfShares) {
            toast.error("অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
            return;
        }

        // The original shareholderPayload was:
        // const shareholderPayload = {
        //     ...formData,
        //     numberOfShares: parseInt(formData.numberOfShares),
        //     // Backend handles shareholderId generation
        // };
        // Now passing formData directly, assuming backend handles parsing numberOfShares

        const success = await addShareholder(formData);

        if (success) {
            toast.success('শেয়ারহোল্ডার সফলভাবে ভর্তি করা হয়েছে!');
            setShowSuccess(true);
            setFormData(initialState);
            window.scrollTo(0, 0);
            setTimeout(() => setShowSuccess(false), 5000);
        } else {
            toast.error(error || 'ভর্তি ব্যর্থ হয়েছে। দয়াকরে পুনরায় চেষ্টা করুন।');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                    <UserPlus size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">শেয়ারহোল্ডার ভর্তি</h2>
                    <p className="text-slate-500">Add New Shareholder (Independent of Members)</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                {/* Personal Info */}
                <div>
                    <h3 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2">ব্যক্তিগত তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">নাম</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">পিতা/স্বামীর নাম</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.fatherName}
                                onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">মাতার নাম</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.motherName}
                                onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">এনআইডি (NID)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.nid}
                                onChange={e => setFormData({ ...formData, nid: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">মোবাইল</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        {/* Photo Mock */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ছবি (Photo URL/Upload)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                disabled
                                placeholder="Auto-generated for demo"
                            />
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div>
                    <h3 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2">ঠিকানা</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">গ্রাম/মহল্লা</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.address.village}
                                onChange={e => handleAddressChange('village', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ডাকঘর</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.address.post}
                                onChange={e => handleAddressChange('post', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">উপজেলা/থানা</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.address.upazila}
                                onChange={e => handleAddressChange('upazila', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">জেলা</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.address.district}
                                onChange={e => handleAddressChange('district', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Share Details */}
                <div>
                    <h3 className="font-bold text-lg text-slate-700 mb-4 border-b pb-2">শেয়ার তথ্য</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">শেয়ার সংখ্যা</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={formData.numberOfShares}
                                onChange={e => setFormData({ ...formData, numberOfShares: e.target.value })}
                                required
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">মোট টাকা (Auto-calculated)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg bg-slate-100 font-bold text-emerald-700"
                                value={`৳ ${totalAmount.toLocaleString()}`}
                                readOnly
                            />
                            <p className="text-xs text-slate-500 mt-1">Per Share: ৳ {shareValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={clsx(
                            "w-full py-3 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all",
                            loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-800"
                        )}
                    >
                        <Save size={20} />
                        {loading ? 'প্রসেসিং...' : 'শেয়ারহোল্ডার সংরক্ষণ করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShareholderAdmission;
