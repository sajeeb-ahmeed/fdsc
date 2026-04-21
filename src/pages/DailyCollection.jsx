import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Search, RotateCcw, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { LoadingSpinner, ErrorBanner } from '../components/common/StatusMessage';
import { safeArray, safeNumber } from '../utils/safe';

const Keypad = ({ onKeyPress, onDelete, onSubmit, disabled }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

    return (
        <div className="grid grid-cols-3 gap-3">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    disabled={disabled}
                    className="bg-white border border-slate-200 shadow-sm rounded-xl py-4 text-2xl font-bold text-slate-700 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {key}
                </button>
            ))}
            <button
                onClick={onDelete}
                disabled={disabled}
                className="bg-red-50 border border-red-100 shadow-sm rounded-xl py-4 text-red-600 flex items-center justify-center active:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 size={28} />
            </button>
            <button
                onClick={onSubmit}
                disabled={disabled}
                className="col-span-3 bg-emerald-700 text-white rounded-xl py-4 text-xl font-bold shadow-lg shadow-emerald-700/20 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                কালেকশন জমা দিন
            </button>
        </div>
    );
};

const TransactionTypeButton = ({ type, selected, onClick, label, colorClass }) => (
    <button
        onClick={() => onClick(type)}
        className={clsx(
            "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
            selected
                ? clsx(colorClass, "border-transparent ring-2 ring-offset-2 ring-emerald-500 shadow-sm")
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
        )}
    >
        <span className="font-bold text-sm">{label}</span>
    </button>
);

const DailyCollection = () => {
    const { members, fetchMembers, fetchLoans, collectInstallment, creditPurchases, dps, loading, error } = useStore();

    React.useEffect(() => {
        fetchMembers();
        fetchLoans();
    }, [fetchMembers, fetchLoans]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [transactionType, setTransactionType] = useState('Savings');
    const [amount, setAmount] = useState('');
    const [penalty, setPenalty] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const sMembers = safeArray(members);
    const sCreditPurchases = safeArray(creditPurchases);
    const sDps = safeArray(dps);

    // Filter members
    const filteredMembers = searchTerm
        ? sMembers.filter(m =>
            (m.memberId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.mobile || '').includes(searchTerm) ||
            (m.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5)
        : [];

    const handleMemberSelect = (member) => {
        setSelectedMember(member);
        setSearchTerm('');
        setAmount('');
        setPenalty('');
        setTransactionType('Savings');
    };

    const handleTransactionTypeChange = (type) => {
        setTransactionType(type);
        setAmount('');
        setPenalty('');

        if (!selectedMember) return;

        // Auto-fill logic
        if (type === 'Loan') {
            const activeLoan = sCreditPurchases.find(cp => {
                const loanMemberId = typeof cp.member === 'object' ? cp.member?._id : cp.member;
                return loanMemberId === selectedMember?._id && cp.status === 'ACTIVE';
            });
            if (activeLoan) {
                setAmount(safeNumber(activeLoan.installmentAmount).toString());
            }
        } else if (type === 'DPS') {
            const activeDps = sDps.find(d => {
                const dpsMemberId = typeof d.member === 'object' ? d.member?._id : d.member;
                return dpsMemberId === selectedMember?._id && d.status === 'ACTIVE';
            });
            if (activeDps) {
                setAmount(safeNumber(activeDps.amount).toString());
            }
        }
    };

    const handleKeyPress = (key) => {
        if (key === '.' && amount.includes('.')) return;
        if (amount.length > 7) return;
        setAmount(prev => prev + key);
    };

    const handleDelete = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleSubmit = async () => {
        if (!selectedMember || !amount) {
            toast.error('সদস্য এবং পরিমাণ নির্বাচন করুন।');
            return;
        }

        if (transactionType === 'Loan') {
            const activeLoan = sCreditPurchases.find(cp => {
                const loanMemberId = typeof cp.member === 'object' ? cp.member?._id : cp.member;
                return loanMemberId === selectedMember?._id && cp.status === 'ACTIVE';
            });
            if (!activeLoan) {
                toast.error('সদস্যের কোনো সক্রিয় ঋণ নেই।');
                return;
            }
            const result = await collectInstallment(activeLoan._id, {
                amount: parseFloat(amount),
                penalty: parseFloat(penalty) || 0,
                date: new Date(),
                account: 'CASH',
                note: `Daily Collection - ${transactionType}`
            });
            if (result) {
                toast.success('কালেকশন সফলভাবে সম্পন্ন হয়েছে!');
                setAmount('');
                setPenalty('');
                setSelectedMember(null);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2500);
            } else {
            }) : null;

            if (loading && sMembers.length === 0) return <LoadingSpinner />;
            if (error && sMembers.length === 0) return <ErrorBanner message={error} onRetry={fetchMembers} />;

            return (
                <div className="max-w-xl mx-auto pb-24">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">দৈনিক কালেকশন</h2>

                    {showSuccess && (
                        <div className="mb-6 bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
                            <CheckCircle size={20} />
                            <span>কালেকশন সফলভাবে জমা হয়েছে!</span>
                        </div>
                    )}

                    {/* Step 1: Find Member */}
                    {!selectedMember ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
                            <h3 className="font-bold text-slate-700">সদস্য খুঁজুন</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="ID, নাম বা মোবাইল নম্বর..."
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                {filteredMembers.map((member, idx) => (
                                    <button
                                        key={member._id || idx}
                                        onClick={() => handleMemberSelect(member)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition text-left"
                                    >
                                        <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                                        <div>
                                            <p className="font-bold text-slate-800">{member.name}</p>
                                            <p className="text-xs text-slate-500">{member.memberId} • {member.mobile}</p>
                                        </div>
                                    </button>
                                ))}
                                {searchTerm && filteredMembers.length === 0 && (
                                    <p className="text-center text-slate-400 py-2">কোন সদস্য পাওয়া যায়নি</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Selected Member Summary & Dashboard */
                        <div className="space-y-6">
                            {/* Member Header */}
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-200 flex justify-between items-center bg-emerald-50/50">
                                <div className="flex items-center gap-3">
                                    <img src={selectedMember.photo} alt={selectedMember.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                                    <div>
                                        <h3 className="font-bold text-slate-800">{selectedMember.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{selectedMember.memberId} • {selectedMember.mobile}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-full shadow-sm transition"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>

                            {/* Financial Summary Cards */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-600 mb-1">সঞ্চয় স্থিতি</p>
                                    <p className="font-bold text-blue-800">৳ {safeNumber(selectedMember.savingsBalance).toLocaleString()}</p>
                                </div>
                                <div className={clsx("p-3 rounded-lg border", memberLoan ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100")}>
                                    <p className={clsx("text-xs mb-1", memberLoan ? "text-red-600" : "text-slate-500")}>ঋণ বকেয়া</p>
                                    <p className={clsx("font-bold", memberLoan ? "text-red-800" : "text-slate-400")}>
                                        {memberLoan ? `৳ ${safeNumber(memberLoan.dueAmount).toLocaleString()}` : 'N/A'}
                                    </p>
                                </div>
                                <div className={clsx("p-3 rounded-lg border", memberDps ? "bg-purple-50 border-purple-100" : "bg-slate-50 border-slate-100")}>
                                    <p className={clsx("text-xs mb-1", memberDps ? "text-purple-600" : "text-slate-500")}>ডিপিএস জমা</p>
                                    <p className={clsx("font-bold", memberDps ? "text-purple-800" : "text-slate-400")}>
                                        {memberDps ? `৳ ${safeNumber(memberDps.amount).toLocaleString()}/m` : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Step 3: Transaction Type */}
                            <div className="grid grid-cols-2 gap-3">
                                <TransactionTypeButton
                                    type="Savings"
                                    label="সঞ্চয় জমা"
                                    selected={transactionType === 'Savings'}
                                    onClick={handleTransactionTypeChange}
                                    colorClass="bg-blue-100 text-blue-700"
                                />
                                <TransactionTypeButton
                                    type="Loan"
                                    label="ঋণ কিস্তি"
                                    selected={transactionType === 'Loan'}
                                    onClick={handleTransactionTypeChange}
                                    colorClass="bg-red-100 text-red-700"
                                />
                                <TransactionTypeButton
                                    type="DPS"
                                    label="ডিপিএস"
                                    selected={transactionType === 'DPS'}
                                    onClick={handleTransactionTypeChange}
                                    colorClass="bg-purple-100 text-purple-700"
                                />
                                <TransactionTypeButton
                                    type="Share"
                                    label="শেয়ার"
                                    selected={transactionType === 'Share'}
                                    onClick={handleTransactionTypeChange}
                                    colorClass="bg-emerald-100 text-emerald-700"
                                />
                            </div>

                            {/* Step 4: Amount & Penalty */}
                            <div className="bg-slate-900 text-white p-6 rounded-2xl text-center shadow-lg relative overflow-hidden">
                                <p className="text-emerald-400 text-sm font-medium mb-1 uppercase tracking-wider">পরিমাণ (Amount)</p>
                                <div className="text-4xl font-mono font-bold tracking-widest h-12 flex items-center justify-center">
                                    {amount ? `৳${amount}` : <span className="text-slate-600">0</span>}
                                </div>

                                {/* Optional Penalty Input */}
                                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
                                    <label className="text-xs text-slate-400">জরিমানা (Optional):</label>
                                    <input
                                        type="number"
                                        value={penalty}
                                        onChange={(e) => setPenalty(e.target.value)}
                                        className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-emerald-500 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Step 5: Keypad */}
                            <Keypad
                                onKeyPress={handleKeyPress}
                                onDelete={handleDelete}
                                onSubmit={handleSubmit}
                                disabled={!selectedMember}
                            />
                        </div>
                    )}
                </div>
            );
        };

        export default DailyCollection;
