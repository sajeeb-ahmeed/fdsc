import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">দুঃখিত, একটি সমস্যা হয়েছে</h2>
                        <p className="text-slate-600 mb-8">
                            অ্যপ্লিকেশনটি লোড করার সময় একটি ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white font-bold py-3 rounded-xl hover:bg-emerald-800 transition-all active:scale-95 shadow-lg shadow-emerald-700/20"
                        >
                            <RotateCcw size={20} />
                            অাবার চেষ্টা করুন
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 text-left bg-slate-50 p-4 rounded-lg overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-500 whitespace-pre">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
