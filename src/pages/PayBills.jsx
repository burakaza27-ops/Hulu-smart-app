import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Zap, Droplets, Wifi, Monitor, Car,
  ChevronRight, Check, Fingerprint, Receipt, Share2
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './PayBills.css';

export default function PayBills() {
  const navigate = useNavigate();
  const t = useTranslation();
  const balance = useStore((s) => s.balance);
  const addTransaction = useStore((s) => s.addTransaction);

  const [step, setStep] = useState(1); // 1: select, 2: details, 3: confirm, 4: success
  const [selectedBill, setSelectedBill] = useState(null);
  const [meterNum, setMeterNum] = useState('');
  const [amount, setAmount] = useState('');
  const [showBio, setShowBio] = useState(false);
  const [txRef, setTxRef] = useState('');

  const billCategories = [
    { id: 'electric', title: t('bills.electric'), subtitle: 'Electricity & Power', icon: Zap, color: '#F59E0B', provider: 'EEU' },
    { id: 'water', title: t('bills.water'), subtitle: 'Water supply & drainage', icon: Droplets, color: '#3B82F6', provider: 'AAWSA' },
    { id: 'telecom', title: t('bills.telecom'), subtitle: 'Mobile & Internet', icon: Wifi, color: '#10B981', provider: 'Ethio Telecom' },
    { id: 'tv', title: t('bills.tv'), subtitle: 'Television subscription', icon: Monitor, color: '#8B5CF6', provider: 'DStv' },
    { id: 'traffic', title: t('bills.traffic'), subtitle: 'Traffic violation payment', icon: Car, color: '#EF4444', provider: 'Transport Authority' },
  ];

  const handleSelect = (bill) => {
    setSelectedBill(bill);
    setStep(2);
  };

  const initiatePayment = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (num > balance) { showToast('Insufficient balance', 'error'); return; }
    setShowBio(true);
  };

  const handleVerified = () => {
    setShowBio(false);
    const ref = `HLU-TX-${Date.now().toString().slice(-6)}`;
    setTxRef(ref);
    addTransaction({
      id: Date.now(),
      title: selectedBill.title,
      subtitle: `${selectedBill.provider} · ${meterNum}`,
      amount: -parseFloat(amount),
      type: 'bill',
      time: 'Just now',
      refId: ref,
    });
    setStep(4);
  };

  const handleShareReceipt = () => {
    const receiptText = `HULU Bill Payment Receipt\n─────────────────\n${selectedBill?.title} (${selectedBill?.provider})\nAccount: ${meterNum}\nAmount: ${parseFloat(amount || 0).toLocaleString()} ETB\nRef: ${txRef}\nDate: ${new Date().toLocaleString()}\n─────────────────\nPowered by HULU Smart Service Hub`;
    if (navigator.share) { navigator.share({ title: 'HULU Receipt', text: receiptText }); }
    else { navigator.clipboard.writeText(receiptText); showToast('Receipt copied to clipboard'); }
  };

  return (
    <motion.div className="bills-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="send-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => {
          if (step > 1 && step < 4) setStep(step - 1);
          else navigate('/');
        }}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="send-title">{t('bills.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Bill Type */}
        {step === 1 && (
          <motion.div key="bs1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
            <p className="bills-desc">{t('bills.desc')}</p>
            <div className="bill-categories">
              {billCategories.map((bill) => {
                const Icon = bill.icon;
                return (
                  <motion.div
                    key={bill.id}
                    className="bill-cat-card glass-panel"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelect(bill)}
                  >
                    <div className="bill-cat-icon" style={{ background: `${bill.color}18`, color: bill.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="bill-cat-info">
                      <h4>{bill.title}</h4>
                      <p>{bill.subtitle}</p>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Enter Details */}
        {step === 2 && selectedBill && (
          <motion.div key="bs2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="bill-detail-step">
            <div className="bill-selected glass-panel">
              {(() => { const Icon = selectedBill.icon; return <div className="bill-cat-icon" style={{ background: `${selectedBill.color}18`, color: selectedBill.color }}><Icon size={22} /></div>; })()}
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 600 }}>{selectedBill.title}</h4>
                <p className="subtitle">{selectedBill.provider}</p>
              </div>
            </div>

            <div className="bill-form">
              <label className="bill-label">{t('bills.meterLabel')}</label>
              <input
                type="text"
                className="bill-input"
                placeholder={t('bills.meterPlaceholder')}
                value={meterNum}
                onChange={(e) => setMeterNum(e.target.value)}
              />

              <label className="bill-label" style={{ marginTop: 16 }}>{t('bills.amount')}</label>
              <input
                type="text"
                className="bill-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
              />

              {(() => {
                const quickInfo = {
                  electric: { last: '450 ETB · Mar 15', avg: '520 ETB' },
                  water: { last: '180 ETB · Mar 10', avg: '210 ETB' },
                  internet: { last: '1,200 ETB · Mar 1', avg: '1,200 ETB' },
                  tv: { last: '350 ETB · Mar 5', avg: '350 ETB' },
                };
                const info = quickInfo[selectedBill.id];
                if (!info) return null;
                return (
                  <div className="bill-quick-info glass-panel">
                    <div className="bqi-row">
                      <span>{t('bills.lastPayment')}</span>
                      <span className="bqi-val">{info.last}</span>
                    </div>
                    <div className="bqi-row">
                      <span>{t('bills.avgMonthly')}</span>
                      <span className="bqi-val">{info.avg}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {meterNum && amount && (
              <motion.button
                className="btn-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(3)}
                style={{ marginTop: 24 }}
              >
                {t('bills.reviewPayment')}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div key="bs3" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
            <div className="confirm-card glass-panel">
              <div className="confirm-amount-display">
                <span className="confirm-label">{t('bills.paymentAmount')}</span>
                <h2 className="confirm-amount">{parseFloat(amount || 0).toLocaleString()} <span>ETB</span></h2>
              </div>
              <div className="confirm-divider" />
              <div className="confirm-detail">
                <span className="cd-label">{t('bills.provider')}</span>
                <span className="cd-value-text">{selectedBill.title}</span>
              </div>
              <div className="confirm-detail">
                <span className="cd-label">{t('bills.account')}</span>
                <span className="cd-value-text">{meterNum}</span>
              </div>
              <div className="confirm-detail">
                <span className="cd-label">{t('bills.from')}</span>
                <span className="cd-value-text">Abyssinia · ****7842</span>
              </div>
              <div className="confirm-detail">
                <span className="cd-label">{t('bills.fee')}</span>
                <span className="cd-value-text fee">{t('bills.free')}</span>
              </div>
            </div>
            <motion.button
              className="btn-primary"
              whileTap={{ scale: 0.95 }}
              onClick={initiatePayment}
              style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Fingerprint size={20} /> {t('bills.confirmPayment')}
            </motion.button>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <motion.div key="bs4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="success-step">
            <motion.div className="success-circle" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
                <Check size={48} strokeWidth={3} />
              </motion.div>
            </motion.div>
            <motion.h2 className="success-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              {t('bills.success')}
            </motion.h2>
            <motion.p className="success-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              {parseFloat(amount || 0).toLocaleString()} ETB paid to {selectedBill?.title}
            </motion.p>

            {/* Receipt Card */}
            <motion.div className="receipt-summary glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <div className="receipt-row">
                <span>Reference</span>
                <span className="receipt-val" style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{txRef}</span>
              </div>
              <div className="receipt-row">
                <span>Provider</span>
                <span className="receipt-val">{selectedBill?.provider}</span>
              </div>
              <div className="receipt-row">
                <span>Account</span>
                <span className="receipt-val">{meterNum}</span>
              </div>
              <div className="receipt-row">
                <span>Amount</span>
                <span className="receipt-val">{parseFloat(amount || 0).toLocaleString()} ETB</span>
              </div>
              <div className="receipt-row">
                <span>Date</span>
                <span className="receipt-val">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </motion.div>

            <motion.div className="success-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}>{t('bills.backHome')}</motion.button>
              <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }} onClick={handleShareReceipt}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Share2 size={16} /> Share Receipt
              </motion.button>
              <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }} onClick={() => { setStep(1); setAmount(''); setMeterNum(''); setSelectedBill(null); }}>{t('bills.payAnother')}</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BiometricPrompt
        open={showBio}
        onVerified={handleVerified}
        onCancel={() => setShowBio(false)}
        mode="fingerprint"
      />
    </motion.div>
  );
}
