import React, { useState } from 'react';
import { Settings, Users, Calendar, AlertCircle, Shield, FileText, CheckCircle, Save } from 'lucide-react';
import useStore from '../store/useStore';
import { safeArray, safeNumber } from '../utils/safe';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'সাধারণ সেটিংস', icon: Settings },
        { id: 'software', label: 'সফটওয়্যার সেটিংস', icon: FileText },
        { id: 'access', label: 'অ্যাক্সেস কন্ট্রোল', icon: Shield },
    ];

    const sTabs = safeArray(tabs);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">সেটিংস এবং কনফিগারেশন</h2>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
                {sTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-emerald-100 text-emerald-800 border-b-2 border-emerald-600'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'software' && <SoftwareSettings />}
                {activeTab === 'access' && <AccessSettings />}
            </div>
        </div>
    );
};

const GeneralSettings = () => {
    const { settings, updateSettings } = useStore();
    const [localSettings, setLocalSettings] = useState(settings || {});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSave = () => {
        updateSettings(localSettings);
        alert('Settings Saved Successfully!');
    };

    return (
        <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <FileText size={20} /> ফাইন্যান্সিয়াল ও বাইলজ সেটিংস
                    </h3>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-bold"
                    >
                        <Save size={18} /> সংরক্ষণ করুন
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">প্রতিটি শেয়ারের মূল্য (টাকা)</label>
                        <input
                            type="number"
                            name="shareValue"
                            value={safeNumber(localSettings.shareValue)}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">পরিচালক ন্যূনতম শেয়ার (টি)</label>
                        <input
                            type="number"
                            name="directorMinShares"
                            value={safeNumber(localSettings.directorMinShares)}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ঋণ খেলাপি জরিমানা (দৈনিক %)</label>
                        <input
                            type="number"
                            name="penaltyRate"
                            value={safeNumber(localSettings.penaltyRate)}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-slate-200">
                        <div className="col-span-2 text-sm font-bold text-slate-500 border-b pb-1 mb-1">বাৎসরিক লভ্যাংশ বণ্টন (%)</div>
                        <div>
                            <label className="block text-xs text-slate-500">পরিচালকবৃন্দ</label>
                            <input
                                type="number"
                                name="dividendDirectorSplit"
                                value={safeNumber(localSettings.dividendDirectorSplit)}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-500">শেয়ারহোল্ডারবৃন্দ</label>
                            <input
                                type="number"
                                name="dividendShareholderSplit"
                                value={safeNumber(localSettings.dividendShareholderSplit)}
                                onChange={handleChange}
                                className="w-full p-2 border rounded focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">FDR মুনাফার হার (%)</label>
                        <input
                            type="number"
                            name="fdrProfitRate"
                            value={safeNumber(localSettings.fdrProfitRate)}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">DPS মুনাফার হার (%)</label>
                        <input
                            type="number"
                            name="dpsProfitRate"
                            value={safeNumber(localSettings.dpsProfitRate)}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Users size={20} /> মেম্বার গ্রুপ ও কেন্দ্র
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                            <span>শাপলা কেন্দ্র (101)</span>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">সক্রিয়</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                            <span>গোলাপ কেন্দ্র (102)</span>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">সক্রিয়</span>
                        </div>
                        <button className="text-sm text-emerald-700 font-bold hover:underline">+ নতুন কেন্দ্র যোগ করুন</button>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Calendar size={20} /> ছুটির তালিকা ও সময়সূচী
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                            <span>সাপ্তাহিক ছুটি</span>
                            <span className="font-medium">শুক্রবার</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                            <span>অফিস সময়</span>
                            <span className="font-medium">সকাল ৯:০০ - বিকেল ৫:০০</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SoftwareSettings = () => {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <AlertCircle size={20} /> নোটিশ বোর্ড
                </h3>
                <textarea
                    className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                    placeholder="নোটিশ লিখুন..."
                    defaultValue="আগামী ১০ ই অক্টোবর সাধারণ সভা অনুষ্ঠিত হবে।"
                ></textarea>
                <div className="mt-2 flex justify-end">
                    <button className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-800 transition">আপডেট করুন</button>
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Users size={20} /> ম্যানেজমেন্ট কমিটি
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-bold">
                            <tr>
                                <th className="p-3">নাম</th>
                                <th className="p-3">পদবী</th>
                                <th className="p-3">মোবাইল</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3">রহিম উদ্দিন</td>
                                <td className="p-3">চেয়ারম্যান</td>
                                <td className="p-3">01711-XXXXXX</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3">করিম শেখ</td>
                                <td className="p-3">সেক্রেটারি</td>
                                <td className="p-3">01822-XXXXXX</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AccessSettings = () => {
    return (
        <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg flex items-start gap-3">
                <Shield size={20} className="mt-0.5 shrink-0" />
                <div>
                    <h4 className="font-bold">Access Control Level</h4>
                    <p className="text-sm mt-1">এই সেকশনটি শুধুমাত্র সুপার অ্যাডমিনের জন্য। এখান থেকে আপনি ইউজারদের পারমিশন পরিবর্তন করতে পারবেন।</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-700">অ্যাডমিন (Admin)</h4>
                        <CheckCircle size={18} className="text-emerald-500" />
                    </div>
                    <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center gap-2">✅ সদস্য ভর্তি ও ব্যবস্থাপনা</li>
                        <li className="flex items-center gap-2">✅ লেনদেন এন্টি</li>
                        <li className="flex items-center gap-2">✅ রিপোর্ট দেখা</li>
                        <li className="flex items-center gap-2 text-red-400">❌ সেটিংস পরিবর্তন</li>
                    </ul>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-bl">FULL ACCESS</div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-emerald-800">সুপার অ্যাডমিন</h4>
                        <Shield size={18} className="text-emerald-600" />
                    </div>
                    <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center gap-2">✅ সকল পারমিশন</li>
                        <li className="flex items-center gap-2">✅ ডেটা ডিলিট/এডিট</li>
                        <li className="flex items-center gap-2">✅ সিস্টেম কনফিগারেশন</li>
                    </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-700">সদস্য (Member)</h4>
                    </div>
                    <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-center gap-2">✅ নিজের প্রোফাইল দেখা</li>
                        <li className="flex items-center gap-2">✅ নিজের লেনদেন দেখা</li>
                        <li className="flex items-center gap-2 text-red-400">❌ অন্য সদস্যের তথ্য</li>
                        <li className="flex items-center gap-2 text-red-400">❌ কোনো পরিবর্তন করা</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
