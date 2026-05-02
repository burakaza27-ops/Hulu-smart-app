import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import useStore from './store/useStore';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import Legal from './pages/Legal';
import Diaspora from './pages/Diaspora';
import Inheritance from './pages/Inheritance';
import Splash from './pages/Splash';
import PayBills from './pages/PayBills';
import SendMoney from './pages/SendMoney';
import CardDetail from './pages/CardDetail';
import KioskLocator from './pages/KioskLocator';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ScanQR from './pages/ScanQR';
import TopUp from './pages/TopUp';
import ATMWithdraw from './pages/ATMWithdraw';
import TransactionDetail from './pages/TransactionDetail';
import Auth from './pages/Auth';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import Equb from './pages/Equb';
import Marketplace from './pages/Marketplace';
import SavingsGoals from './pages/SavingsGoals';
import Rewards from './pages/Rewards';
import ToastContainer from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import AppShield from './components/AppShield';
import './App.css';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
};

function AnimatedRoutes() {
  const location = useLocation();
  const splashSeen = useStore((s) => s.splashSeen);
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="content-area"
      >
        <Routes location={location}>
          <Route path="/splash" element={<Splash />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={!isAuthenticated ? <Navigate to="/auth" replace /> : (splashSeen ? <Dashboard /> : <Navigate to="/splash" replace />)} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/diaspora" element={<Diaspora />} />
          <Route path="/inheritance" element={<Inheritance />} />
          <Route path="/pay-bills" element={<PayBills />} />
          <Route path="/send-money" element={<SendMoney />} />
          <Route path="/card" element={<CardDetail />} />
          <Route path="/kiosk" element={<KioskLocator />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/scan" element={<ScanQR />} />
          <Route path="/topup" element={<TopUp />} />
          <Route path="/atm-withdraw" element={<ATMWithdraw />} />
          <Route path="/transaction" element={<TransactionDetail />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/equb" element={<Equb />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/savings-goals" element={<SavingsGoals />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShield>
          <div className="app-container">
            <ToastContainer />
            <AnimatedRoutes />
            <BottomNav />
          </div>
        </AppShield>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
