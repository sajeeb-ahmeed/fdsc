import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { Search, Phone, Plus, User, Printer, X, MapPin, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';
import { useReactToPrint } from 'react-to-print';
import { safeArray, safeNumber } from '../utils/safe';

const MemberDetailsModal = ({ member, creditPurchases, onClose }) => {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Member-${member.id}`,
    });

    const memberId = member?._id || member?.memberId;
    const sCreditPurchases = safeArray(creditPurchases);
    const memberCredits = sCreditPurchases.filter(cp => cp.member === memberId);
    const totalCreditDue = memberCredits.reduce((acc, cp) => acc + safeNumber(cp.dueAmount), 0);

    if (!member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-scaleIn relative">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">সদস্য বিস্তারিত</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]" ref={componentRef}>
                    <div className="flex flex-col items-center mb-6">
                        <img src={member?.photo || '/placeholder-user.png'} alt={member?.name} className="w-24 h-24 rounded-full border-4 border-emerald-100 object-cover mb-3" />
                        <h2 className="text-2xl font-bold text-slate-800">{member?.name || 'Unknown'}</h2>
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">{member?.memberId || 'N/A'}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">মোবাইল</label>
                            <p className="font-medium text-slate-800 flex items-center gap-2">
                                <Phone size={16} className="text-emerald-600" /> {member?.mobile || 'No Mobile'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 uppercase">পেশা</label>
                            <p className="font-medium text-slate-800">{member.profession || 'প্রযোজ্য নয়'}</p>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">ঠিকানা</label>
                            <p className="font-medium text-slate-800 flex items-start gap-2">
                                <MapPin size={16} className="text-emerald-600 mt-1" />
                                {member?.presentAddress || 'ঠিকানা নেই'}
                            </p>
                        </div>

                        <div className="col-span-full border-t border-slate-100 my-2"></div>

                        <div className="bg-emerald-50 p-4 rounded-lg">
                            <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">শেয়ার জমা</p>
                            <p className="text-xl font-bold text-emerald-800 text-right">৳ {safeNumber(member?.shareBalance).toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">সঞ্চয় জমা</p>
                            <p className="text-xl font-bold text-blue-800 text-right">৳ {safeNumber(member?.savingsBalance).toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg md:col-span-2">
                            <p className="text-xs font-semibold text-red-600 uppercase mb-1">বিনিয়োগ বকেয়া (Credit Due)</p>
                            <p className="text-xl font-bold text-red-800 text-right">৳ {safeNumber(totalCreditDue).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition shadow-lg"
                    >
                        <Printer size={18} />
                        প্রিন্ট করুন
                    </button>
                </div>
            </div>
        </div>
    );
};

const MemberList = () => {
    const { members, creditPurchases, fetchMembers, fetchLoans, loading, error } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    React.useEffect(() => {
        fetchMembers();
        fetchLoans();
    }, [fetchMembers, fetchLoans]);

    const sMembers = safeArray(members);
    const sCreditPurchases = safeArray(creditPurchases);

    const filteredMembers = sMembers.filter(member =>
        (member?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member?.mobile || '').includes(searchTerm) ||
        (member?.memberId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMemberCreditDue = (memberId) => {
        return sCreditPurchases
            .filter(cp => cp.member === memberId)
            .reduce((acc, cp) => acc + safeNumber(cp.dueAmount), 0);
    };

    if (loading && sMembers.length === 0) return <LoadingSpinner />;
    if (error && sMembers.length === 0) return <ErrorBanner message={error} onRetry={fetchMembers} />;

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-800">সদস্য তালিকা ({sMembers.length})</h2>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="সদস্য খুঁজুন (নাম বা মোবাইল)"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link
                        to="/admission"
                        className="md:hidden bg-emerald-700 text-white p-2 rounded-lg hover:bg-emerald-800 transition shadow-md"
                    >
                        <Plus size={24} />
                    </Link>
                </div>

                <Link
                    to="/admission"
                    className="hidden md:flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition shadow-md font-medium"
                >
                    <Plus size={20} />
                    নতুন সদস্য
                </Link>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">ID</th>
                            <th className="p-4 font-semibold text-slate-600">নাম</th>
                            <th className="p-4 font-semibold text-slate-600">মোবাইল</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">শেয়ার জমা</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">সঞ্চয় জমা</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">বিনিয়োগ বকেয়া</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredMembers.map((member) => (
                            <tr
                                key={member._id}
                                onClick={() => setSelectedMember(member)}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <td className="p-4 font-medium text-slate-500">{member.memberId || 'N/A'}</td>
                                <td className="p-4 font-semibold text-slate-800 flex items-center gap-3">
                                    <img src={member.photo || '/placeholder-user.png'} alt={member.name} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                                    {member.name || 'Unknown'}
                                </td>
                                <td className="p-4 text-slate-600">{member.mobile || 'No Mobile'}</td>
                                <td className="p-4 text-emerald-600 font-bold text-right">{safeNumber(member.shareBalance).toLocaleString()} ৳</td>
                                <td className="p-4 text-blue-600 font-bold text-right">{safeNumber(member.savingsBalance).toLocaleString()} ৳</td>
                                <td className="p-4 text-red-500 font-bold text-right">{safeNumber(getMemberCreditDue(member._id)).toLocaleString()} ৳</td>
                            </tr>
                        ))}
                        {filteredMembers.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">কোনো সদস্য পাওয়া যায়নি</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Grid */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredMembers.map((member) => (
                    <div
                        key={member._id}
                        onClick={() => setSelectedMember(member)}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 cursor-pointer active:scale-98 transition-transform"
                    >
                        <img src={member.photo || '/placeholder-user.png'} alt={member.name} className="w-16 h-16 rounded-full bg-slate-100 object-cover border-2 border-slate-100" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 truncate">{member.name || 'Unknown'}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-1">{member.memberId || 'N/A'}</p>
                            <div className="flex gap-2 text-xs">
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">বকেয়া: {safeNumber(getMemberCreditDue(member._id)).toLocaleString()}</span>
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">সঞ্চয়: {safeNumber(member.savingsBalance).toLocaleString()}</span>
                            </div>
                        </div>
                        <a
                            href={`tel:${member.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200 transition"
                        >
                            <Phone size={20} />
                        </a>
                    </div>
                ))}
                {filteredMembers.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                        কোনো সদস্য পাওয়া যায়নি
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedMember && (
                <MemberDetailsModal
                    member={selectedMember}
                    creditPurchases={creditPurchases}
                    onClose={() => setSelectedMember(null)}
                />
            )}
        </div>
    );
};

export default MemberList;
