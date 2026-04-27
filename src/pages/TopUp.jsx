import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Smartphone, Wifi, Package, Check, Fingerprint,
  ChevronRight, Phone, Share2, Edit3
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './TopUp.css';

const operators = [
  { id: 'ethio', name: 'Ethio Telecom', logo: '🟢', color: '#10B981' },
  { id: 'safaricom', name: 'Safaricom Ethiopia', logo: '🔴', color: '#EF4444' },
];

const airtimeAmounts = [10, 25, 50, 100, 200, 500];
const MIN_CUSTOM_AMOUNT = 5;
const dataPackages = [
  { label: '1 GB', duration: '30 days', price: 100 },
  { label: '3 GB', duration: '30 days', price: 250 },
  { label: '5 GB', duration: '30 days', price: 400 },
  { label: '10 GB', duration: '30 days', price: 700 },
  { label: '20 GB', duration: '30 days', price: 1200 },
  { label: 'Unlimited', duration: '7 days', price: 500 },
];

// Ethiopian phone validation: 09XX or +2519XX, 10-13 digits
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-]/g, '');
  return /^(\+251|0)(9|7)\d{8}$/.test(cleaned);
}

export default function TopUp() {
  const navigate = useNavigate();
  const t = useTranslation();
  const addTransaction = useStore(s => s.addTransaction);
  const balance = useStore(s => s.balance);

  const [step, setStep] = useState(1); // 1: operator, 2: phone + package, 3: confirm, 4: success
  const [selectedOp, setSelectedOp] = useState(null);
  const [phoneMode, setPhoneMode] = useState('my');
  const [phone, setPhone] = useState('0911 234 567');
  const [packageTab, setPackageTab] = useState('airtime');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [showBio, setShowBio] = useState(false);
  const [txRef, setTxRef] = useState('');
  // Custom amount state
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [customAmountVal, setCustomAmountVal] = useState('');

  const handleOperator = (op) => {
    setSelectedOp(op);
    setStep(2);
  };

  const cost = packageTab === 'airtime'
    ? (useCustomAmount ? (parseFloat(customAmountVal) || 0) : selectedAmount)
    : selectedData?.price;

  const handleProceedToConfirm = () => {
    if (phoneMode === 'other' && !isValidPhone(phone)) {
      showToast('Enter a valid Ethiopian phone number', 'error');
      return;
    }
    if (!cost || cost <= 0) { showToast('Select an amount or package', 'error'); return; }
    if (useCustomAmount && cost < MIN_CUSTOM_AMOUNT) {
      showToast(`Minimum top up is ${MIN_CUSTOM_AMOUNT} ETB`, 'error');
      return;
    }
    if (cost > balance) { showToast('Insufficient balance', 'error'); return; }
    setStep(3);
  };

  const handleConfirmRecharge = () => {
    setShowBio(true);
  };

  const handleVerified = () => {
    setShowBio(false);
    const ref = `BOA-TX-${Date.now().toString().slice(-6)}`;
    setTxRef(ref);
    addTransaction({
      id: Date.now(),
      title: selectedOp.name,
      subtitle: packageTab === 'airtime' ? `${cost} ETB Airtime` : `${selectedData?.label} Data`,
      amount: -cost,
      type: 'topup',
      time: 'Just now',
      refId: ref,
    });
    setStep(4);
  };

  const getCanProceed = () => {
    if (packageTab === 'airtime') {
      if (useCustomAmount) return parseFloat(customAmountVal) >= MIN_CUSTOM_AMOUNT;
      return selectedAmount !== null;
    }
    return selectedData !== null;
  };

  const handleShareReceipt = () => {
    const receiptText = `Abyssinia Top Up Receipt\n─────────────────\n${selectedOp?.name}\n${packageTab === 'airtime' ? `${cost} ETB Airtime` : `${selectedData?.label} Data (${selectedData?.duration})`}\nPhone: ${phone}\nRef: ${txRef}\nDate: ${new Date().toLocaleString()}\n─────────────────\nPowered by Abyssinia Smart Service Hub`;
    if (navigator.share) {
      navigator.share({ title: 'Abyssinia Top Up Receipt', text: receiptText });
    } else {
      navigator.clipboard.writeText(receiptText);
      showToast('Receipt copied to clipboard');
    }
  };

  const handleSelectPreset = (a) => {
    setSelectedAmount(a);
    setUseCustomAmount(false);
    setCustomAmountVal('');
  };

  const handleCustomAmountFocus = () => {
    setUseCustomAmount(true);
    setSelectedAmount(null);
  };

  return (
    <motion.div className="topup-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="send-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => {
          if (step === 2) setStep(1);
          else if (step === 3) setStep(2);
          else navigate('/');
        }}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="send-title">{t('topup.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Progress Steps (visible on steps 2-3) */}
      {step >= 2 && step <= 3 && (
        <div className="send-steps">
          {['Select', 'Package', 'Confirm'].map((label, i) => (
            <div key={i} className={`send-step ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="step-circle">
                {step > i + 1 ? <Check size={12} /> : i + 1}
              </div>
              <span className="step-label">{label}</span>
            </div>
          ))}
          <div className="step-line">
            <motion.div className="step-line-fill" animate={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Select Operator */}
        {step === 1 && (
          <motion.div key="op" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
            <p className="topup-desc">{t('topup.subtitle')}</p>

            <div className="section-header" style={{ marginTop: 16 }}>
              <span className="caption">{t('topup.selectOperator')}</span>
            </div>
            <div className="operator-list">
              {operators.map((op) => (
                <motion.div
                  key={op.id}
                  className="operator-card glass-panel"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleOperator(op)}
                >
                  <span className="op-logo">{op.logo}</span>
                  <div className="op-info">
                    <h4>{op.name}</h4>
                    <p>Mobile services</p>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Phone + Package Selection */}
        {step === 2 && (
          <motion.div key="pkg" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
            {/* Operator badge */}
            <div className="selected-op glass-panel">
              <span className="op-logo">{selectedOp.logo}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedOp.name}</span>
            </div>

            {/* Phone input */}
            <div className="phone-section">
              <div className="phone-toggle">
                <button className={`pt-btn ${phoneMode === 'my' ? 'active' : ''}`} onClick={() => { setPhoneMode('my'); setPhone('0911 234 567'); }}>
                  {t('topup.myNumber')}
                </button>
                <button className={`pt-btn ${phoneMode === 'other' ? 'active' : ''}`} onClick={() => { setPhoneMode('other'); setPhone(''); }}>
                  {t('topup.otherNumber')}
                </button>
              </div>
              <div className={`phone-input-row glass-panel ${phoneMode === 'other' && phone && !isValidPhone(phone) ? 'error' : ''}`}>
                <Phone size={18} color="var(--text-muted)" />
                <input
                  type="tel"
                  className="phone-input"
                  placeholder={t('topup.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                  readOnly={phoneMode === 'my'}
                />
              </div>
              {phoneMode === 'other' && phone && !isValidPhone(phone) && (
                <span style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'block' }}>Enter valid Ethiopian number (09XX or +2519XX)</span>
              )}
            </div>

            {/* Package tabs */}
            <div className="package-tabs">
              {[
                { key: 'airtime', icon: Smartphone, label: t('topup.airtime') },
                { key: 'data', icon: Wifi, label: t('topup.data') },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  className={`pkg-tab ${packageTab === key ? 'active' : ''}`}
                  onClick={() => { setPackageTab(key); setSelectedAmount(null); setSelectedData(null); setUseCustomAmount(false); setCustomAmountVal(''); }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {packageTab === key && <motion.div className="tab-indicator" layoutId="pkgTab" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                </button>
              ))}
            </div>

            {/* Airtime amounts */}
            {packageTab === 'airtime' && (
              <>
                <div className="airtime-grid">
                  {airtimeAmounts.map((a) => (
                    <motion.button
                      key={a}
                      className={`airtime-btn glass-panel ${!useCustomAmount && selectedAmount === a ? 'selected' : ''}`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectPreset(a)}
                    >
                      <span className="airtime-amount">{a}</span>
                      <span className="airtime-currency">ETB</span>
                    </motion.button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="custom-amount-section">
                  <div className="custom-amount-header">
                    <Edit3 size={14} color="var(--accent-gold)" />
                    <span className="custom-amount-label">Custom Amount</span>
                    <span className="custom-amount-min">Min: {MIN_CUSTOM_AMOUNT} ETB</span>
                  </div>
                  <div className={`custom-amount-input-row glass-panel ${useCustomAmount ? 'active' : ''}`}>
                    <span className="custom-currency-tag">ETB</span>
                    <input
                      type="number"
                      className="custom-amount-input"
                      placeholder={`Enter amount (min ${MIN_CUSTOM_AMOUNT})`}
                      value={customAmountVal}
                      onChange={(e) => {
                        setCustomAmountVal(e.target.value);
                        if (e.target.value) {
                          setUseCustomAmount(true);
                          setSelectedAmount(null);
                        }
                      }}
                      onFocus={handleCustomAmountFocus}
                      min={MIN_CUSTOM_AMOUNT}
                    />
                  </div>
                  {useCustomAmount && customAmountVal && parseFloat(customAmountVal) > 0 && parseFloat(customAmountVal) < MIN_CUSTOM_AMOUNT && (
                    <span className="custom-amount-error">
                      Amount must be at least {MIN_CUSTOM_AMOUNT} ETB
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Data packages */}
            {packageTab === 'data' && (
              <div className="data-list">
                {dataPackages.map((d, i) => (
                  <motion.div
                    key={i}
                    className={`data-card glass-panel ${selectedData?.label === d.label ? 'selected' : ''}`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedData(d)}
                  >
                    <div className="data-info">
                      <h4>{d.label}</h4>
                      <p>{d.duration}</p>
                    </div>
                    <span className="data-price">{d.price} ETB</span>
                    {selectedData?.label === d.label && <Check size={18} color="var(--accent-emerald)" />}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Continue to confirm */}
            {getCanProceed() && phone && (
              <motion.button
                className="btn-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleProceedToConfirm}
                style={{ marginTop: 20 }}
              >
                {t('send.reviewTransfer', 'Review & Confirm')}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirmation Review */}
        {step === 3 && (
          <motion.div key="confirm" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
            <div className="confirm-card glass-panel">
              <div className="confirm-amount-display">
                <span className="confirm-label">{t('topup.rechargeNow', 'Recharging')}</span>
                <h2 className="confirm-amount">{cost} <span>ETB</span></h2>
              </div>
              <div className="confirm-divider" />
              <div className="confirm-detail">
                <span className="cd-label">{t('topup.selectOperator', 'Operator')}</span>
                <span className="cd-value-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selectedOp?.logo} {selectedOp?.name}
                </span>
              </div>
              <div className="confirm-detail">
                <span className="cd-label">{t('topup.type', 'Type')}</span>
                <span className="cd-value-text">{packageTab === 'airtime' ? (useCustomAmount ? 'Airtime (Custom)' : 'Airtime') : `Data — ${selectedData?.label} (${selectedData?.duration})`}</span>
              </div>
              <div className="confirm-detail">
                <span className="cd-label">{t('topup.phone', 'Phone')}</span>
                <span className="cd-value-text">{phone}</span>
              </div>
              <div className="confirm-detail">
                <span className="cd-label">{t('bills.from')}</span>
                <span className="cd-value-text">Abyssinia Bank · ****7842</span>
              </div>
              <div className="confirm-detail">
                <span className="cd-label">{t('bills.fee')}</span>
                <span className="cd-value-text fee">{t('bills.free')}</span>
              </div>
              <div className="confirm-divider" />
              <div className="confirm-detail">
                <span className="cd-label" style={{ fontWeight: 700 }}>{t('send.total')}</span>
                <span className="cd-value-text total">{cost} ETB</span>
              </div>
            </div>

            <motion.button
              className="btn-primary"
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirmRecharge}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Fingerprint size={20} />
              {t('topup.rechargeNow')}
            </motion.button>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="success-step">
            <motion.div className="success-circle" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
                <Check size={48} strokeWidth={3} />
              </motion.div>
            </motion.div>
            <motion.h2 className="success-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              {t('topup.success')}
            </motion.h2>
            <motion.p className="success-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              {packageTab === 'airtime' ? `${cost} ETB` : `${selectedData?.label}`} → {phone}
            </motion.p>

            {/* Receipt */}
            <motion.div className="receipt-summary glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <div className="receipt-row">
                <span>Reference</span>
                <span className="receipt-val" style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{txRef}</span>
              </div>
              <div className="receipt-row">
                <span>Operator</span>
                <span className="receipt-val">{selectedOp?.name}</span>
              </div>
              <div className="receipt-row">
                <span>Amount</span>
                <span className="receipt-val">{cost} ETB</span>
              </div>
              <div className="receipt-row">
                <span>Date</span>
                <span className="receipt-val">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </motion.div>

            <motion.div className="success-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
              <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}>
                {t('bills.backHome')}
              </motion.button>
              <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }} onClick={handleShareReceipt}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Share2 size={16} /> Share Receipt
              </motion.button>
              <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }} onClick={() => { setStep(1); setSelectedAmount(null); setSelectedData(null); setSelectedOp(null); setUseCustomAmount(false); setCustomAmountVal(''); }}>
                {t('topup.rechargeAnother')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BiometricPrompt
        open={showBio}
        onVerified={handleVerified}
        onCancel={() => setShowBio(false)}
      />
    </motion.div>
  );
}
