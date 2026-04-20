import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowDownLeft, ArrowUpRight, Zap, Check,
  Share2, AlertCircle, RefreshCw, Copy
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import { formatRelativeTime } from '../utils/timeFormat';
import './TransactionDetail.css';

const txIcons = { bill: Zap, income: ArrowDownLeft, transfer: ArrowUpRight, topup: Zap, atm: ArrowUpRight };
const txColors = { bill: '#F59E0B', income: '#10B981', transfer: '#EF4444', topup: '#8B5CF6', atm: '#3B82F6' };
const txTypeLabels = { bill: 'Bill Payment', income: 'Deposit', transfer: 'Transfer', topup: 'Mobile Top Up', atm: 'ATM Withdrawal' };

export default function TransactionDetail() {
  const navigate = useNavigate();
  const t = useTranslation();
  const [params] = useSearchParams();
  const txId = parseInt(params.get('id'));
  const transactions = useStore(s => s.transactions);
  const [copied, setCopied] = useState(false);

  const tx = transactions.find(tx => tx.id === txId);
  if (!tx) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Transaction not found.
        <button onClick={() => navigate('/')} style={{ marginTop: 20, color: 'var(--accent-gold)' }}>Go Home</button>
      </div>
    );
  }

  const Icon = txIcons[tx.type] || Zap;
  const color = txColors[tx.type] || '#F59E0B';
  const isPositive = tx.amount >= 0;
  const amtStr = isPositive ? `+${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const handleCopyRef = () => {
    navigator.clipboard.writeText(tx.refId || `HLU-TX-${tx.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div className="txd-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="send-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="send-title">{t('txd.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Hero Amount */}
      <motion.div
        className="txd-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="txd-icon-large" style={{ background: `${color}18`, color }}>
          <Icon size={28} />
        </div>
        <h1 className={`txd-amount ${isPositive ? 'positive' : 'negative'}`}>
          {amtStr} <span className="txd-currency">ETB</span>
        </h1>
        <p className="txd-title">{tx.title}</p>
        <div className="txd-status-badge">
          <Check size={12} />
          <span>{t('txd.completed')}</span>
        </div>
      </motion.div>

      {/* Details Card */}
      <motion.div
        className="txd-details glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="txd-row">
          <span className="txd-label">{t('txd.type')}</span>
          <span className="txd-val">{txTypeLabels[tx.type] || tx.type}</span>
        </div>
        <div className="txd-divider" />
        <div className="txd-row">
          <span className="txd-label">{t('bills.from')}</span>
          <span className="txd-val">{isPositive ? tx.subtitle : 'Abyssinia · ****7842'}</span>
        </div>
        <div className="txd-divider" />
        <div className="txd-row">
          <span className="txd-label">{t('send.to')}</span>
          <span className="txd-val">{isPositive ? 'Abyssinia · ****7842' : tx.title}</span>
        </div>
        <div className="txd-divider" />
        <div className="txd-row">
          <span className="txd-label">{t('txd.date')}</span>
          <span className="txd-val">{typeof tx.time === 'number' ? new Date(tx.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : (tx.time + ' · ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}</span>
        </div>
        <div className="txd-divider" />
        <div className="txd-row">
          <span className="txd-label">{t('txd.reference')}</span>
          <div className="txd-ref-row">
            <span className="txd-val mono">{tx.refId || `HLU-TX-${tx.id}`}</span>
            <button className={`txd-copy ${copied ? 'copied' : ''}`} onClick={handleCopyRef}>
              <Copy size={14} />
            </button>
          </div>
        </div>
        <div className="txd-divider" />
        <div className="txd-row">
          <span className="txd-label">{t('bills.fee')}</span>
          <span className="txd-val fee">{t('bills.free')}</span>
        </div>
        <div className="txd-divider" />
        <div className="txd-row">
          <span className="txd-label">{t('txd.status')}</span>
          <span className="txd-val status-completed"><Check size={12} /> {t('txd.completed')}</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="txd-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <motion.button className="txd-action glass-panel" whileTap={{ scale: 0.95 }} onClick={() => {
          const receiptText = `HULU Receipt\n──────────────\n${tx.title}\nAmount: ${amtStr} ETB\nRef: ${tx.refId || `HLU-TX-${tx.id}`}\nDate: ${new Date().toLocaleString()}\nStatus: Completed\n──────────────\nHULU Smart Service Hub`;
          if (navigator.share) { navigator.share({ title: 'HULU Receipt', text: receiptText }); }
          else { navigator.clipboard.writeText(receiptText); showToast('Receipt copied to clipboard'); }
        }}>
          <Share2 size={20} />
          <span>{t('txd.shareReceipt')}</span>
        </motion.button>
        <motion.button className="txd-action glass-panel" whileTap={{ scale: 0.95 }} onClick={() => showToast('Issue reported — we\'ll review within 24h', 'info')}>
          <AlertCircle size={20} />
          <span>{t('txd.reportIssue')}</span>
        </motion.button>
        {!isPositive && (
          <motion.button className="txd-action glass-panel" whileTap={{ scale: 0.95 }} onClick={() => { if (tx.type === 'bill') navigate('/pay-bills'); else navigate('/send-money'); }}>
            <RefreshCw size={20} />
            <span>{t('txd.repeatTx')}</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
