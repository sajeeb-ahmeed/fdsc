
import React, { useState } from 'react';
import useStore from '../store/useStore';
import { User, MapPin, Phone, Save, Camera, Shield } from 'lucide-react';

const ProfilePage = () => {
    const { currentUser, updateMemberProfile } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        mobile: currentUser?.mobile || '',
        presentAddress: currentUser?.presentAddress || '',
        permanentAddress: currentUser?.permanentAddress || '',
        password: ''
    });

    if (!currentUser) return <div className="p-8 text-center">লোডিং...</div>;

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMemberProfile(currentUser.id, formData);
        setIsEditing(false);
        alert('প্রোফাইল আপডেট হয়েছে!');
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateMemberProfile(currentUser.id, { photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-800 to-emerald-600"></div>

                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-12 px-4">
                    <div className="relative group">
                        <img
                            src={currentUser.photo}
                            alt={currentUser.name}
                            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-slate-200"
                        />
                        <label className="absolute bottom-1 right-1 bg-slate-800 text-white p-2 rounded-full cursor-pointer hover:bg-slate-900 transition shadow-sm">
                            <Camera size={16} />
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-2xl font-bold text-slate-800">{currentUser.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-slate-500 text-sm">
                            <span className="flex items-center gap-1"><User size={14} /> {currentUser.id}</span>
                            <span className="flex items-center gap-1 uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{currentUser.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 text-lg">ব্যক্তিগত তথ্য</h3>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                    >
                        {isEditing ? 'বাতিল' : 'এডিট করুন'}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">নাম</label>
                        <div className="p-3 bg-slate-50 rounded-lg text-slate-500 select-none border border-transparent">
                            {currentUser.name}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">পিতার নাম</label>
                        <div className="p-3 bg-slate-50 rounded-lg text-slate-500 select-none border border-transparent">
                            {currentUser.fatherName}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">মোবাইল নম্বর</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.mobile}
                                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        ) : (
                            <div className="p-3 border border-slate-200 rounded-lg text-slate-800 flex items-center gap-2">
                                <Phone size={16} className="text-emerald-600" /> {currentUser.mobile}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-600">বর্তমান ঠিকানা</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.presentAddress}
                                onChange={e => setFormData({ ...formData, presentAddress: e.target.value })}
                            />
                        ) : (
                            <div className="p-3 border border-slate-200 rounded-lg text-slate-800 flex items-center gap-2">
                                <MapPin size={16} className="text-emerald-600" /> {currentUser.presentAddress}
                            </div>
                        )}
                    </div>

                    {isEditing && (
                        <div className="col-span-full pt-4 border-t">
                            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Shield size={18} /> সিকিউরিটি আপডেট</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-600">নতুন পাসওয়ার্ড (ঐচ্ছিক)</label>
                                    <input
                                        type="password"
                                        className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="পরিবর্তন করতে চাইলে লিখুন..."
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {isEditing && (
                        <div className="col-span-full flex justify-end gap-3 mt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-800 transition shadow-lg"
                            >
                                <Save size={18} />
                                পরিবর্তন সংরক্ষণ করুন
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
