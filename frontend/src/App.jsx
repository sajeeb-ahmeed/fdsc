
import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import useStore from './store/useStore';
import Layout from './layouts/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/MemberList';
import DailyCollection from './pages/DailyCollection';
import MemberAdmission from './pages/MemberAdmission';
import SharePage from './pages/SharePage';
import DpsPage from './pages/DpsPage';
import FdrPage from './pages/FdrPage';
import ShareholderAdmission from './pages/ShareholderAdmission';
import ShareholderList from './pages/ShareholderList';
import CreditPurchasePage from './pages/CreditPurchasePage';
import HawlatPage from './pages/HawlatPage';
import ExpensePage from './pages/ExpensePage';
import ProductApplicationPage from './pages/ProductApplicationPage';
import DirectorShipPage from './pages/DirectorShipPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import StockReport from './pages/StockReport';
import PurchaseReport from './pages/PurchaseReport';
import SellReport from './pages/SellReport';
import CustomerReport from './pages/CustomerReport';
import ProfitLossReport from './pages/ProfitLossReport';
import DailyCashSheet from './pages/DailyCashSheet';
import GeneralLedger from './pages/GeneralLedger';
import BalanceSheet from './pages/BalanceSheet';

// Protected Route Component
const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, currentUser } = useStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Group */}
        <Route element={<ProtectedRoute />}>
          {/* Layout Group */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/collection" element={<DailyCollection />} />
            <Route path="/shareholder-admission" element={<ShareholderAdmission />} />
            <Route path="/shareholder-list" element={<ShareholderList />} />
            <Route path="/product-application" element={<ProductApplicationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/report-stock" element={<StockReport />} />
            <Route path="/report-purchase" element={<PurchaseReport />} />
            <Route path="/report-sell" element={<SellReport />} />
            <Route path="/report-customer" element={<CustomerReport />} />
            <Route path="/report-profit-loss" element={<ProfitLossReport />} />
            <Route path="/report-cash-sheet" element={<DailyCashSheet />} />
            <Route path="/report-ledger" element={<GeneralLedger />} />
            <Route path="/report-balance-sheet" element={<BalanceSheet />} />

            {/* Admin/SuperAdmin Routes */}
            <Route element={<ProtectedRoute roles={['admin', 'superadmin']} />}>
              <Route path="/members" element={<MemberList />} />
              <Route path="/admission" element={<MemberAdmission />} />
              <Route path="/shares" element={<SharePage />} />
              <Route path="/dps" element={<DpsPage />} />
              <Route path="/fdr" element={<FdrPage />} />
              <Route path="/credit-purchase" element={<CreditPurchasePage />} />
              <Route path="/hawlat" element={<HawlatPage />} />
              <Route path="/expenses" element={<ExpensePage />} />
              <Route path="/directorship" element={<DirectorShipPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
