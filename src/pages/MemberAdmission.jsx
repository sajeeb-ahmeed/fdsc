import React, { useState } from 'react';
import useStore from '../store/useStore';
import { User, MapPin, Users, Save, RotateCcw, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const FormSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = "text", required = false, disabled = false, fullWidth = false }) => (
    <div className={clsx("space-y-1", fullWidth && "md:col-span-2")}>
        <label className="block text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={clsx(
                    "w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors",
                    disabled ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" : "border-slate-300 text-slate-900"
                )}
            />
        </div>
    </div>
);

const initialFormState = {
    name: '',
    fatherName: '',
    motherName: '',
    husbandName: '',
    birthDate: '',
    mobile: '',
    profession: '',
    nid: '',
    religion: '',
    presentAddress: '',
    permanentAddress: '',
    nomineeName: '',
    nomineeRelation: '',
    nomineeAge: '',
};

const MemberAdmission = () => {
    const { addMember, members, fetchMembers, loading } = useStore();
    const [formData, setFormData] = useState(initialFormState);
    // const [showSuccess, setShowSuccess] = useState(false); // Removed as toast is used

    React.useEffect(() => {
        fetchMembers();
    }, []);

    // Let backend handle Member ID, but we can show count for preview
    const tempMemberId = `M - ${100 + members.length + 1} `;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.mobile) {
            toast.error("অনুগ্রহ করে নাম এবং মোবাইল নম্বর পূরণ করুন।");
            return;
        }

        const memberIdPreview = tempMemberId;
        const memberPayload = {
            memberId: memberIdPreview, // Backend will validate/assign
            ...formData,
            password: formData.mobile.slice(-4),
            photo: formData.photo || `https://i.pravatar.cc/150?u=${memberIdPreview}`
        };

        console.log("Submitting Member Payload:", memberPayload); // Debug log


        const { success, error } = await addMember(formData);

        if (success) {
            toast.success('সদস্য সফলভাবে ভর্তি করা হয়েছে!');
            setShowSuccess(true);
            setFormData(initialFormState);
            window.scrollTo(0, 0);
            setTimeout(() => setShowSuccess(false), 5000);
        } else {
            toast.error(error || 'ভর্তি ব্যর্থ হয়েছে। দয়াকরে পুনরায় চেষ্টা করুন।');
        }
    };

    const handleReset = () => {
        if (window.confirm("আপনি কি নিশ্চিত যে আপনি ফর্মটি রিসেট করতে চান?")) {
            setFormData(initialFormState);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">নতুন সদস্য ভর্তি ফর্ম</h2>
                <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    অটো জেনারেটেড সদস্য নম্বর: <span className="text-emerald-700 font-bold">{tempMemberId}</span>
                </div>
            </div>



            <form onSubmit={handleSubmit}>
                {/* Section 1: Basic Info */}
                <FormSection title="প্রাথমিক তথ্য (Basic Info)" icon={User}>
                    <InputField label="সদস্য নং" value={tempMemberId} disabled />
                    <InputField label="আবেদনকারীর নাম" name="name" value={formData.name} onChange={handleChange} required placeholder="উদাঃ রহিম উদ্দিন" />
                    <InputField label="পিতার নাম" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="পিতার নাম" />
                    <InputField label="মাতার নাম" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="মাতার নাম" />
                    <InputField label="স্বামী/স্ত্রীর নাম" name="husbandName" value={formData.husbandName} onChange={handleChange} placeholder="প্রযোজ্য ক্ষেত্রে" />

                    <InputField label="জন্ম তারিখ" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                    <InputField label="ধর্ম" name="religion" value={formData.religion} onChange={handleChange} placeholder="উদাঃ ইসলাম" />

                    <InputField label="মোবাইল নম্বর" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="017XX-XXXXXX" />
                    <InputField label="পেশা" name="profession" value={formData.profession} onChange={handleChange} placeholder="উদাঃ ব্যবসায়ী" />
                    <InputField label="জাতীয় পরিচয়পত্র (NID)" name="nid" value={formData.nid} onChange={handleChange} placeholder="NID number" />
                </FormSection>

                {/* Section 2: Address */}
                <FormSection title="ঠিকানা (Address)" icon={MapPin}>
                    <InputField label="বর্তমান ঠিকানা" name="presentAddress" value={formData.presentAddress} onChange={handleChange} fullWidth placeholder="গ্রাম, ডাকঘর, থানা, জেলা..." />
                    <InputField label="স্থায়ী ঠিকানা" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} fullWidth placeholder="গ্রাম, ডাকঘর, থানা, জেলা..." />
                </FormSection>

                {/* Section 3: Nominee */}
                <FormSection title="নমিনির তথ্য (Nominee Info)" icon={Users}>
                    <InputField label="নমিনির নাম" name="nomineeName" value={formData.nomineeName} onChange={handleChange} placeholder="উদাঃ ফাতেমা বেগম" />
                    <InputField label="সম্পর্ক" name="nomineeRelation" value={formData.nomineeRelation} onChange={handleChange} placeholder="উদাঃ স্ত্রী / পুত্র" />
                    <InputField label="বয়স" name="nomineeAge" value={formData.nomineeAge} onChange={handleChange} placeholder="উদাঃ ৩০ বছর" />

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">নমিনির ছবি</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition cursor-pointer relative">
                            <Upload size={32} className="mb-2 text-slate-400" />
                            <span className="text-sm">ছবি আপলোড করতে ক্লিক করুন</span>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'nomineePhoto')}
                            />
                        </div>
                        {formData.nomineePhoto && (
                            <p className="text-xs text-emerald-600 mt-2 text-center">ছবি সিলেক্ট করা হয়েছে!</p>
                        )}
                    </div>
                </FormSection>

                {/* Section 4: Applicant Photo */}
                <FormSection title="আবেদনকারীর ছবি (Applicant Photo)" icon={User}>
                    <div className="md:col-span-2">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 transition cursor-pointer relative">
                            <Upload size={32} className="mb-2 text-slate-400" />
                            <span className="text-sm">ছবি আপলোড করতে ক্লিক করুন</span>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'photo')}
                            />
                        </div>
                        {formData.photo && (
                            <img src={formData.photo} alt="Preview" className="w-24 h-24 object-cover rounded-full mt-4 mx-auto border-4 border-emerald-100" />
                        )}
                    </div>
                </FormSection>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 mt-8">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-6 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={18} />
                        ফর্ম রিসেট
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={clsx(
                            "px-8 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all flex items-center gap-2",
                            loading
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20 active:scale-95"
                        )}
                    >
                        <Save size={18} />
                        {loading ? 'প্রসেসিং...' : 'সদস্য ভর্তি করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MemberAdmission;
