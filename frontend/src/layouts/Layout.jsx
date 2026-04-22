import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Wallet,
    PiggyBank,
    Banknote,
    Menu,
    X,
    Home,
    PlusCircle,
    FileText
} from 'lucide-react';
import clsx from 'clsx';

import Sidebar from '../components/Sidebar';

const MobileNavItem = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        className={clsx(
            "flex flex-col items-center justify-center w-full py-2",
            active ? "text-emerald-700" : "text-slate-500"
        )}
    >
        <Icon size={24} />
        <span className="text-xs mt-1 font-medium">{label}</span>
    </Link>
);

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar (Desktop & Mobile Drawer) */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-slate-200 lg:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={toggleSidebar} className="text-slate-700">
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-emerald-900">ফ্রেন্ডস ড্রিম</h1>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 pb-24 lg:pb-4">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Bottom Navigation (Mobile) */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe">
                    <div className="flex justify-around items-center">
                        <MobileNavItem to="/" icon={Home} label="হোম" active={location.pathname === "/"} />
                        <MobileNavItem to="/collection" icon={Wallet} label="কালেকশন" active={location.pathname === "/collection"} />
                        <MobileNavItem to="/members" icon={Users} label="সদস্য" active={location.pathname === "/members"} />
                        <button
                            onClick={toggleSidebar}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full py-2 text-slate-500"
                            )}
                        >
                            <Menu size={24} />
                            <span className="text-xs mt-1 font-medium">মেনু</span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Overlay for Sidebar on Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
