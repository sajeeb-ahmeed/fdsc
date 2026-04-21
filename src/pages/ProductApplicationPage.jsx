import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Package, Truck, Save, RotateCcw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FormSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", required = false }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
        />
    </div>
);

const ProductApplicationPage = () => {
    const { addInventoryPurchase } = useStore();
    const [showSuccess, setShowSuccess] = useState(false);

    const initialFormState = {
        supplierName: '',
        supplierPhone: '',
        supplierAddress: '',
        productName: '',
        productModel: '',
        productBrand: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        quantity: 1,
        paymentMethod: 'CASH'
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const qty = parseFloat(formData.quantity);
        const price = parseFloat(formData.price);

        if (isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
            toast.error("সঠিক পরিমাণ এবং মূল্য লিখুন।");
            return;
        }

        const success = await addInventoryPurchase({
            supplier: formData.supplierName,
            supplierPhone: formData.supplierPhone,
            supplierAddress: formData.supplierAddress,
            productName: formData.productName,
            productModel: formData.productModel,
            productBrand: formData.productBrand,
            price: price,
            quantity: qty,
            date: formData.date,
            paymentMethod: formData.paymentMethod
        });

        if (success) {
            toast.success('স্টক সফলভাবে যোগ করা হয়েছে!');
            setShowSuccess(true);
            setFormData(initialFormState);
            window.scrollTo(0, 0);
            setTimeout(() => setShowSuccess(false), 5000);
        } else {
            toast.error(error || 'ভর্তি ব্যর্থ হয়েছে। দয়াকরে পুনরায় চেষ্টা করুন।');
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 mb-2">নতুন স্টক ইন (Stock Purchase)</h2>
                <p className="text-slate-500">সরবরাহকারীর এবং পণ্যের বিস্তারিত তথ্য প্রদান করে ইনভেন্টরি আপডেট করুন।</p>
            </div>

            {showSuccess && (
                <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-slideDown shadow-sm">
                    <div className="p-2 bg-emerald-500 text-white rounded-full">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="font-bold">সফল হয়েছে!</p>
                        <p className="text-sm opacity-90">স্টক আপডেট সম্পন্ন হয়েছে এবং লেজারে এন্ট্রি যুক্ত হয়েছে।</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <FormSection title="সরবরাহকারীর তথ্য (Supplier Info)" icon={Truck}>
                    <div className="md:col-span-1 lg:col-span-1">
                        <InputField
                            label="সরবরাহকারীর নাম"
                            value={formData.supplierName}
                            onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                            required
                            placeholder="Ex: Bajaj Bangladesh"
                        />
                    </div>
                    <InputField
                        label="মোবাইল নম্বর"
                        value={formData.supplierPhone}
                        onChange={e => setFormData({ ...formData, supplierPhone: e.target.value })}
                        placeholder="017XX-XXXXXX"
                    />
                    <InputField
                        label="ঠিকানা (সিটি / এলাকা)"
                        value={formData.supplierAddress}
                        onChange={e => setFormData({ ...formData, supplierAddress: e.target.value })}
                        placeholder="Supplier City / Area"
                    />
                </FormSection>

                <FormSection title="পণ্যের বিস্তারিত (Product Details)" icon={Package}>
                    <InputField
                        label="পণ্যের নাম"
                        value={formData.productName}
                        onChange={e => setFormData({ ...formData, productName: e.target.value })}
                        required
                        placeholder="Ex: Pulsar 150"
                    />
                    <InputField
                        label="মডেল / এডিশন"
                        value={formData.productModel}
                        onChange={e => setFormData({ ...formData, productModel: e.target.value })}
                        placeholder="Ex: 2024 Edition"
                    />
                    <InputField
                        label="ব্র্যান্ড"
                        value={formData.productBrand}
                        onChange={e => setFormData({ ...formData, productBrand: e.target.value })}
                        placeholder="Ex: Bajaj"
                    />
                    <InputField
                        label="ইউনিট ক্রয় মূল্য"
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        required
                        placeholder="0.00"
                    />
                    <InputField
                        label="কোয়ান্টিটি (পরিমাণ)"
                        type="number"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        placeholder="1"
                    />
                    <InputField
                        label="ক্রয় তারিখ"
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                    />
                </FormSection>

                <FormSection title="পেমেন্ট হিসেব (Payment Info)" icon={Save}>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            পেমেন্ট মাধ্যম <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.paymentMethod}
                            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                        >
                            <option value="CASH">Cash (নগদ)</option>
                            <option value="BKASH">bKash (বিকাশ)</option>
                            <option value="NAGAD">Nagad (নগদ অ্যাপ)</option>
                            <option value="BANK">Bank Transfer (ব্যাংক)</option>
                            <option value="OTHER">Other (অন্যান্য)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-emerald-800 font-medium">
                            এই ক্রয়ের সম্পূর্ণ মূল্য ক্যাপিটাল বা মূল তহবিল থেকে প্রদান করা হবে।
                        </p>
                    </div>
                </FormSection>

                <div className="bg-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white shadow-xl shadow-slate-200 mb-8">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">সর্বমোট ইনভয়েস মূল্য</p>
                        <p className="text-3xl font-black font-mono">৳ {((parseFloat(formData.price) || 0) * (parseFloat(formData.quantity) || 0)).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={() => setFormData(initialFormState)}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            রিসেট
                        </button>
                        <button
                            type="submit"
                            className="flex-1 md:flex-none px-10 py-3 rounded-xl bg-emerald-500 text-white font-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            স্টক আপডেট করুন
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductApplicationPage;
