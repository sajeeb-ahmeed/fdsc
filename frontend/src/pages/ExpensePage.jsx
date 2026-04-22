import React, { useState } from 'react';
import useStore from '../store/useStore';
import { MinusCircle, Plus, FileText, Banknote } from 'lucide-react';
import { safeArray, safeNumber } from '../utils/safe';

const ExpensePage = () => {
    const { expenses, addExpense } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Salary',
        amount: '',
        description: '',
        recipient: ''
    });

    const expenseCategories = ['Salary', 'Rent', 'Utility', 'Entertainment', 'Stationary', 'Others'];

    const handleSubmit = (e) => {
        e.preventDefault();
        const newExpense = {
            id: `E-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            ...formData,
            amount: safeNumber(parseFloat(formData.amount))
        };
        addExpense(newExpense);
        setIsModalOpen(false);
        setFormData({ category: 'Salary', amount: '', description: '', recipient: '' });
    };

    const sExpenses = safeArray(expenses);
    const totalExpense = sExpenses.reduce((acc, curr) => acc + safeNumber(curr.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">খরচ / ব্যয় (Expenses)</h2>
                    <p className="text-slate-500">Manage Salaries, Bills & Other Costs</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition shadow-lg"
                >
                    <MinusCircle size={20} />
                    খরচ যুক্ত করুন
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-4 bg-red-100 text-red-600 rounded-full">
                    <Banknote size={32} />
                </div>
                <div>
                    <p className="text-slate-500 font-medium">মোট ব্যয় (Total Expenses)</p>
                    <h3 className="text-3xl font-bold text-slate-800">৳ {totalExpense.toLocaleString()}</h3>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-700">খরচের তালিকা</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">তারিখ</th>
                            <th className="p-4 font-semibold text-slate-600">বিবরণ</th>
                            <th className="p-4 font-semibold text-slate-600">ক্যাটাগরি</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">পরিমাণ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sExpenses.length > 0 ? (
                            sExpenses.map((item, idx) => (
                                <tr key={item.id || idx} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 whitespace-nowrap">{item.date || 'N/A'}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{item.description || 'No Description'}</div>
                                        {item.recipient && <div className="text-xs text-slate-500">Recipient: {item.recipient}</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                                            {item.category || 'Others'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-red-600">- ৳ {safeNumber(item.amount).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-slate-500">কোনো খরচ পাওয়া যায়নি</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-xl p-6 space-y-4 animate-scaleIn">
                        <h3 className="text-lg font-bold text-slate-800">নতুন খরচ যুক্ত করুন</h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">ক্যাটাগরি</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">পরিমাণ</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">বিবরণ</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="খরচের বিবরণ..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">গ্রহীতা (Optional)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={formData.recipient}
                                onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                                placeholder="যার কাছে প্রদান করা হলো"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">বাতিল</button>
                            <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">নিশ্চিত করুন</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ExpensePage;
