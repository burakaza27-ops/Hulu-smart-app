import { motion } from 'framer-motion';
import {
  Send, Receipt, QrCode, ArrowUpRight, ArrowDownLeft,
  CreditCard, Zap, Droplets, Wifi, Plus, Eye, EyeOff, TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SpendingChart from '../components/SpendingChart';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import { formatRelativeTime } from '../utils/timeFormat';
import './Dashboard.css';

const txIcons = { bill: Zap, income: ArrowDownLeft, transfer: ArrowUpRight, topup: Wifi, atm: CreditCard };
const txColors = { bill: '#F59E0B', income: '#10B981', transfer: '#EF4444', topup: '#8B5CF6', atm: '#3B82F6' };

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const t = useTranslation();
  const balance = useStore((s) => s.balance);
  const transactions = useStore((s) => s.transactions);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const formatBalance = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dash.greeting.morning', 'Good Morning');
    if (hour < 18) return t('dash.greeting.afternoon', 'Good Afternoon');
    return t('dash.greeting.evening', 'Good Evening');
  };

  const quickActions = [
    { icon: Send, label: t('dash.send'), color: '#D4AF37', path: '/send-money' },
    { icon: Receipt, label: t('dash.bills'), color: '#10B981', path: '/pay-bills' },
    { icon: QrCode, label: t('dash.scan'), color: '#8B5CF6', path: '/scan' },
    { icon: Plus, label: t('dash.topup'), color: '#F59E0B', path: '/topup' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Header title={getGreeting()} subtitle={t('dash.welcome')} />

      {/* HULU One-Card */}
      <motion.div
        variants={item}
        className="hulu-card"
        onClick={() => navigate('/card')}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-shine" />
        <div className="card-content">
          <div className="card-header-row">
            <div className="card-logo">
              <CreditCard size={20} />
              <span className="card-brand">HULU</span>
              <span className="card-brand-sub">{t('card.onecard')}</span>
            </div>
            <motion.button
              className="balance-toggle"
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setBalanceVisible(!balanceVisible); }}
            >
              {balanceVisible ? <Eye size={18} /> : <EyeOff size={18} />}
            </motion.button>
          </div>
          <div className="card-balance-section">
            <span className="balance-label">{t('dash.totalBalance')}</span>
            <motion.h2
              className="balance-amount"
              key={balanceVisible ? 'visible' : 'hidden'}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
            >
              {balanceVisible ? `${formatBalance(balance)} ETB` : '••••••••'}
            </motion.h2>
          </div>
          <div className="card-footer-row">
            <span className="card-number">•••• •••• •••• 7842</span>
            <div className="card-stats">
              <TrendingUp size={14} />
              <span>{(() => {
                const income = transactions.filter(tx => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
                const expense = transactions.filter(tx => tx.amount < 0).reduce((s, tx) => s + Math.abs(tx.amount), 0);
                const ratio = expense > 0 ? ((income - expense) / expense * 100).toFixed(1) : '0.0';
                return `${ratio > 0 ? '+' : ''}${ratio}%`;
              })()}</span>
            </div>
          </div>
        </div>
        <div className="card-chip" />
        <div className="card-contactless">
          <div className="contactless-wave" />
          <div className="contactless-wave" />
          <div className="contactless-wave" />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="section">
        <div className="section-header">
          <span className="caption">{t('dash.quickActions')}</span>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={i}
                className="quick-action-btn glass-panel"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => action.path && navigate(action.path)}
              >
                <div className="qa-icon" style={{ background: `${action.color}20`, color: action.color }}>
                  <Icon size={22} />
                </div>
                <span className="qa-label">{action.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* HULU Services Overview */}
      <motion.div variants={item} className="section">
        <div className="section-header">
          <span className="caption">{t('dash.services')}</span>
        </div>
        <div className="services-scroll">
          {[
            { title: t('dash.virtualVault'), desc: t('dash.vaultDesc'), gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', icon: '🔐', path: '/vault' },
            { title: t('dash.aiLegal'), desc: t('dash.legalDesc'), gradient: 'linear-gradient(135deg, #1a2e1a 0%, #0d3e16 100%)', icon: '⚖️', path: '/legal' },
            { title: t('dash.inheritance', 'Digital Inheritance'), desc: t('dash.inheritanceDesc', 'Smart contracts & beneficiaries'), gradient: 'linear-gradient(135deg, #2e2a1a 0%, #3e3416 100%)', icon: '🏛️', path: '/inheritance' },
            { title: t('dash.diasporaHub'), desc: t('dash.diasporaDesc'), gradient: 'linear-gradient(135deg, #2e1a2e 0%, #3e1646 100%)', icon: '🌍', path: '/diaspora' },
          ].map((service, i) => (
            <motion.div
              key={i}
              className="service-card"
              style={{ background: service.gradient }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(service.path)}
            >
              <span className="service-emoji">{service.icon}</span>
              <h4 className="service-title">{service.title}</h4>
              <p className="service-desc">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Spending Analytics */}
      <motion.div variants={item} className="section">
        <div className="section-header">
          <span className="caption">{t('dash.monthlySpending', 'Monthly Spending')}</span>
        </div>
        <div className="glass-panel" style={{ padding: 18, borderRadius: 16 }}>
          <SpendingChart />
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="section">
        <div className="section-header">
          <span className="caption">{t('dash.recentActivity')}</span>
          <button className="see-all-btn" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show Less' : t('dash.seeAll')}</button>
        </div>
        <div className="transactions-list">
          {(showAll ? transactions : transactions.slice(0, 5)).map((tx, i) => {
            const Icon = txIcons[tx.type] || Zap;
            const color = txColors[tx.type] || '#F59E0B';
            const amtStr = tx.amount >= 0 ? `+${formatBalance(tx.amount)}` : formatBalance(tx.amount);
            return (
              <motion.div
                key={tx.id}
                className="transaction-item glass-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/transaction?id=${tx.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="tx-icon" style={{ background: `${color}18`, color }}>
                  <Icon size={20} />
                </div>
                <div className="tx-details">
                  <span className="tx-title">{tx.title}</span>
                  <span className="tx-subtitle">{formatRelativeTime(tx.time)}</span>
                </div>
                <span className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                  {amtStr} <span className="tx-currency">ETB</span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
