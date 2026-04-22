import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  PiggyBank,
  Banknote,
  FileText,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  ArrowLeftRight,
  Truck,
} from "lucide-react";
import clsx from "clsx";
import useStore from "../store/useStore";
import { LogOut, User as UserIcon } from "lucide-react";

const menuItems = [
  {
    title: "ড্যাশবোর্ড",
    path: "/",
    icon: LayoutDashboard,
    submenu: [],
  },
  {
    title: "সদস্য",
    icon: Users,
    submenu: [
      { title: "সদস্য ভর্তি", path: "/admission" },
      { title: "সদস্য তালিকা", path: "/members" },
    ],
  },
  {
    title: "শেয়ারহোল্ডার",
    icon: PiggyBank,
    submenu: [
      { title: "ভর্তি (Admission)", path: "/shareholder-admission" },
      { title: "তালিকা (List)", path: "/shareholder-list" },
    ],
  },
  {
    title: "বিনিয়োগ ",
    icon: Truck,
    submenu: [
      { title: "বিনিয়োগ (পণ্য/গাড়ি)", path: "/credit-purchase" },
      { title: "পণ্য ক্রয়ের আবেদন", path: "/product-application" },
    ],
  },
  {
    title: "লেনদেন",
    icon: ArrowLeftRight,
    submenu: [
      { title: "দৈনিক কালেকশন", path: "/collection" },
      { title: "FDR / মেয়াদি আমানত", path: "/fdr" },
      { title: "DPS / সঞ্চয় আমানত", path: "/dps" },
      { title: "হাওলাত", path: "/hawlat" },
      { title: "ব্যয় / খরচ", path: "/expenses" },
    ],
  },
  {
    title: "অ্যাডমিনিস্ট্রেশন",
    icon: UserIcon,
    submenu: [
      { title: "পরিচালনা পর্ষদ (Directors)", path: "/directorship" },
      { title: "সেটিংস", path: "/settings" },
    ],
  },
  {
    title: "রিপোর্ট",
    icon: ClipboardList,
    submenu: [
      { title: "ডেইলি ক্যাশ শিট", path: "/report-cash-sheet" },
      { title: "জেনারেল লেজার", path: "/report-ledger" },
      { title: "ব্যালেন্স শিট", path: "/report-balance-sheet" },
      { title: "লাভ-ক্ষতি", path: "/report-profit-loss" },
      { title: "স্টক রিপোর্ট", path: "/report-stock" },
      { title: "কাস্টমার লেজার", path: "/report-customer" },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { currentUser, logout } = useStore();

  if (!currentUser) return null; // Don't show sidebar if not logged in

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // Filter menu items based on role
  const filteredMenu = menuItems.filter((item) => {
    if (currentUser.role === "member") {
      // Members only see Dashboard, Profile (custom link we'll add), and Reports (limited?)
      // For now, let's say Members valid routes are limited.
      // Actually, usually members might only see a specific simplified dashboard.
      return (
        ["ড্যাশবোর্ড", "রিপোর্ট", "লেনদেন"].includes(item.title) &&
        item.title !== "সদস্য"
      );
    }
    return true; // Admin/Superadmin see all
  });

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-emerald-800 shrink-0">
        <h1 className="text-xl font-bold">ফ্রেন্ডস ড্রিম কো-অপাঃ</h1>
        <button onClick={onClose} className="lg:hidden text-emerald-100">
          <LogOut size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-emerald-800 bg-emerald-800/30 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.photo}
            alt="User"
            className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
          />
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{currentUser.name}</p>
            <p className="text-xs text-emerald-300 capitalize">
              {currentUser.role}
            </p>
          </div>
        </div>
        <Link
          to="/profile"
          className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 py-1.5 rounded text-xs font-medium transition"
        >
          <UserIcon size={14} /> প্রোফাইল দেখুন
        </Link>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto flex-1">
        {filteredMenu.map((item, index) => (
          <div key={index}>
            {item.submenu.length > 0 ? (
              <div>
                <button
                  onClick={() => toggleSubmenu(index)}
                  className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:bg-emerald-800/50",
                    location.pathname.startsWith(
                      item.submenu[0]?.path?.substring(0, 4),
                    )
                      ? "text-white"
                      : "text-emerald-100",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {openSubmenu === index ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>

                <div
                  className={clsx(
                    "ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300",
                    openSubmenu === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  {item.submenu.map((sub, subIndex) => (
                    <Link
                      key={subIndex}
                      to={sub.path}
                      onClick={onClose}
                      className={clsx(
                        "block px-4 py-2 rounded-lg text-sm transition-colors",
                        location.pathname === sub.path
                          ? "bg-emerald-800 text-white"
                          : "text-emerald-200 hover:bg-emerald-800/30 hover:text-white",
                      )}
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                to={item.path}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-100 hover:bg-emerald-800/50",
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-emerald-800 shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">লগ আউট</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
