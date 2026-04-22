import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = "লোড হচ্ছে..." }) => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">{message}</p>
    </div>
);

export const ErrorBanner = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
        </div>
        <p className="text-red-800 font-bold mb-2">সমস্যা হয়েছে</p>
        <p className="text-red-600 text-sm mb-4">{message || "ডাটা লোড করতে সমস্যা হয়েছে।"}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
                আবার চেষ্টা করুন
            </button>
        )}
    </div>
);
