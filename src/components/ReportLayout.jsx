import React, { useState } from 'react';
import { Download, Printer, FileSpreadsheet, Calendar, Search } from 'lucide-react';
import clsx from 'clsx';

const ReportLayout = ({ title, children, showSearch = false, onSearchChange }) => {
    const [activeFilter, setActiveFilter] = useState('আজকের');
    const filters = ['আজকের', 'সাপ্তাহিক', 'মাসিক', 'বাৎসরিক', 'বছর টু বছর', 'কাস্টম'];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Top Navigation / Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 print:hidden">
                <div className="flex flex-wrap gap-2">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition",
                                activeFilter === filter
                                    ? "bg-emerald-700 text-white shadow-md"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {activeFilter === 'কাস্টম' && (
                        <div className="flex items-center gap-2 mr-2 animate-fadeIn">
                            <input type="date" className="p-2 border rounded-lg text-sm" />
                            <span className="text-slate-400">to</span>
                            <input type="date" className="p-2 border rounded-lg text-sm" />
                        </div>
                    )}
                    <div className="p-2 bg-slate-50 border rounded-lg flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 font-mono">
                            {new Date().toLocaleDateString('bn-BD')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <p className="text-sm text-slate-500 print:hidden">রিপোর্ট জেনারেট করা হয়েছে আজকের তারিখ অনুযায়ী</p>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                    {showSearch && (
                        <div className="relative mr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="এখানে সার্চ করুন..."
                                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:ring-2 focus:ring-emerald-500 outline-none"
                                onChange={(e) => onSearchChange?.(e.target.value)}
                            />
                        </div>
                    )}
                    <button className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition title='Excel Download'">
                        <FileSpreadsheet size={20} />
                    </button>
                    <button className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition title='PDF Download'">
                        <Download size={20} />
                    </button>
                    <button
                        onClick={handlePrint}
                        className="p-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition shadow-md flex items-center gap-2 px-4"
                    >
                        <Printer size={20} />
                        <span className="text-sm font-bold">প্রিন্ট করুন</span>
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none">
                <div className="hidden print:block text-center py-6 border-b-2 border-slate-800 mb-6">
                    <h1 className="text-3xl font-black text-slate-900 mb-1">ফ্রেন্ডস ড্রিম কো-অপারেটিভ সোসাইটি</h1>
                    <p className="text-slate-600 font-medium">শাখা: ঢাকা | মোবাইল: ০১৭০০০-০০০০০০</p>
                    <div className="mt-4 inline-block px-6 py-2 bg-slate-900 text-white font-bold rounded-full text-xl uppercase tracking-widest">
                        {title}
                    </div>
                </div>

                <div className="p-0">
                    {children}
                </div>

                <div className="hidden print:flex justify-between mt-12 px-8 pb-8">
                    <div className="text-center pt-8 border-t border-slate-400 w-48">
                        <p className="font-bold text-slate-800">ক্যাশিয়ার</p>
                    </div>
                    <div className="text-center pt-8 border-t border-slate-400 w-48">
                        <p className="font-bold text-slate-800">ম্যানেজার</p>
                    </div>
                    <div className="text-center pt-8 border-t border-slate-400 w-48">
                        <p className="font-bold text-slate-800">সভাপতি</p>
                    </div>
                </div>
            </div>

            {/* CSS for print adjustments */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white !important; padding: 0 !important; }
                    .print\\:hidden { display: none !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th { background-color: #f8fafc !important; color: #0f172a !important; -webkit-print-color-adjust: exact; }
                    .rounded-xl { border-radius: 0 !important; }
                    .shadow-sm { box-shadow: none !important; }
                    @page { margin: 1.5cm; }
                }
            `}} />
        </div>
    );
};

export default ReportLayout;
