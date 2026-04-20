import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Banknote, QrCode, Hash, Clock, Check,
  Fingerprint, MapPin, Shield, Smartphone, Receipt
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './ATMWithdraw.css';

const withdrawAmounts = [500, 1000, 2000, 3000, 5000, 10000];

export default function ATMWithdraw() {
  const navigate = useNavigate();
  const t = useTranslation();
  const balance = useStore(s => s.balance);
  const accounts = useStore(s => s.accounts);
  const addTransaction = useStore(s => s.addTransaction);
  const addNotification = useStore(s => s.addNotification);

  const [step, setStep] = useState(1); // 1: select amount, 2: generating, 3: code display, 4: collected
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [showBio, setShowBio] = useState(false);
  const [codeMode, setCodeMode] = useState('qr'); // qr | otp
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const countdownRef = useRef(null);

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleConfirm = () => {
    if (!selectedAmount) return;
    if (selectedAmount > balance) { showToast('Insufficient balance', 'error'); return; }
    setShowBio(true);
  };

  const handleVerified = () => {
    setShowBio(false);
    setStep(2);

    // Simulate "generating"
    setTimeout(() => {
      const code = generateCode();
      setOtpCode(code);
      setCountdown(300);
      setStep(3);

      addTransaction({
        id: Date.now(),
        title: 'ATM Withdrawal',
        subtitle: `Cardless ATM · Code: ${code}`,
        amount: -selectedAmount,
        type: 'transfer',
        time: 'Just now',
      });

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 2500);
  };

  const handleCollected = () => {
    clearInterval(countdownRef.current);
    addNotification({
      type: 'transaction',
      title: 'Cash Collected',
      titleAm: 'ጥሬ ገንዘብ ተወስዷል',
      desc: `${selectedAmount.toLocaleString()} ETB collected at Bole Medhanealem ATM`,
      descAm: `${selectedAmount.toLocaleString()} ብር ከBole Medhanealem ATM ተወስዷል`,
      time: 'Just now',
    });
    setStep(4);
  };

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatBalance = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <motion.div className="atm-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="send-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => {
          if (step === 1) navigate('/card');
          else if (step === 3 || step === 4) navigate('/');
          else setStep(1);
        }}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="send-title">{t('atm.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Amount */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
            <p className="atm-desc">{t('atm.subtitle')}</p>

            {/* Account selector */}
            <div className="section-header" style={{ marginTop: 16 }}>
              <span className="caption">{t('atm.selectAccount')}</span>
            </div>
            <div className="account-selector">
              {accounts.map((acc) => (
                <motion.div
                  key={acc.id}
                  className={`account-card glass-panel ${selectedAccount?.id === acc.id ? 'selected' : ''}`}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedAccount(acc)}
                >
                  <div className="acc-info">
                    <h4>{acc.type}</h4>
                    <p>{acc.number}</p>
                  </div>
                  <span className="acc-balance">{formatBalance(acc.balance)} ETB</span>
                  {selectedAccount?.id === acc.id && <Check size={16} color="var(--accent-emerald)" />}
                </motion.div>
              ))}
            </div>

            {/* Amount grid */}
            <div className="section-header" style={{ marginTop: 20 }}>
              <span className="caption">{t('atm.selectAmount')}</span>
            </div>
            <div className="atm-amount-grid">
              {withdrawAmounts.map((a) => (
                <motion.button
                  key={a}
                  className={`atm-amount-btn glass-panel ${selectedAmount === a ? 'selected' : ''}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAmount(a)}
                >
                  <span className="atm-amt">{a.toLocaleString()}</span>
                  <span className="atm-curr">ETB</span>
                </motion.button>
              ))}
            </div>

            {/* Confirm */}
            {selectedAmount && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="atm-summary glass-panel">
                  <div className="atm-sum-row">
                    <span>{t('atm.amount')}</span>
                    <span className="atm-sum-val">{selectedAmount.toLocaleString()} ETB</span>
                  </div>
                  <div className="atm-sum-row">
                    <span>{t('atm.fee')}</span>
                    <span className="atm-sum-val fee">{t('bills.free')}</span>
                  </div>
                </div>
                <motion.button
                  className="btn-primary"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirm}
                  style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                >
                  <Fingerprint size={20} />
                  {t('atm.confirmWithdraw')}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Generating */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="atm-generating">
            <motion.div
              className="gen-ring"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Shield size={32} />
            </motion.div>
            <h3>{t('atm.generating')}</h3>
            <div className="gen-progress">
              <motion.div
                className="gen-progress-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.3, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Code Display */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            {/* QR / OTP toggle */}
            <div className="code-toggle">
              <button className={`ct-btn ${codeMode === 'qr' ? 'active' : ''}`} onClick={() => setCodeMode('qr')}>
                <QrCode size={16} /> {t('atm.showQr')}
              </button>
              <button className={`ct-btn ${codeMode === 'otp' ? 'active' : ''}`} onClick={() => setCodeMode('otp')}>
                <Hash size={16} /> {t('atm.showOtp')}
              </button>
            </div>

            <div className="code-display glass-panel">
              <h3>{t('atm.yourCode')}</h3>

              <AnimatePresence mode="wait">
                {codeMode === 'qr' ? (
                  <motion.div key="qr" initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }} className="qr-code-wrapper">
                    <div className="atm-qr-container">
                      <svg viewBox="0 0 200 200" width="180" height="180">
                        <rect x="10" y="10" width="50" height="50" rx="4" fill="var(--accent-gold)" />
                        <rect x="140" y="10" width="50" height="50" rx="4" fill="var(--accent-gold)" />
                        <rect x="10" y="140" width="50" height="50" rx="4" fill="var(--accent-gold)" />
                        <rect x="20" y="20" width="30" height="30" rx="2" fill="var(--bg-primary)" />
                        <rect x="150" y="20" width="30" height="30" rx="2" fill="var(--bg-primary)" />
                        <rect x="20" y="150" width="30" height="30" rx="2" fill="var(--bg-primary)" />
                        <rect x="28" y="28" width="14" height="14" rx="1" fill="var(--accent-gold)" />
                        <rect x="158" y="28" width="14" height="14" rx="1" fill="var(--accent-gold)" />
                        <rect x="28" y="158" width="14" height="14" rx="1" fill="var(--accent-gold)" />
                        {otpCode.split('').map((digit, i) => (
                          <text key={i} x={75 + i * 15} y={110} fontSize="14" fontWeight="bold" fill="var(--accent-emerald)" fontFamily="monospace">{digit}</text>
                        ))}
                        {Array.from({length: 8}, (_, row) =>
                          Array.from({length: 8}, (_, col) => {
                            const show = (parseInt(otpCode[row % 6] || '5') + col * 3 + row * 7) % 3 !== 0;
                            if (!show) return null;
                            const x = 70 + col * 8;
                            const y = 15 + row * 8;
                            if (x > 135 && y < 65) return null;
                            if (x < 65) return null;
                            return <rect key={`q${row}-${col}`} x={x} y={y} width="6" height="6" rx="1" fill="var(--text-secondary)" opacity="0.5" />;
                          })
                        )}
                        {Array.from({length: 6}, (_, row) =>
                          Array.from({length: 10}, (_, col) => {
                            const show = (parseInt(otpCode[col % 6] || '3') + row * 5) % 4 !== 0;
                            if (!show) return null;
                            const x = 70 + col * 8;
                            const y = 120 + row * 8;
                            if (y > 185) return null;
                            return <rect key={`r${row}-${col}`} x={x} y={y} width="6" height="6" rx="1" fill="var(--accent-gold)" opacity="0.4" />;
                          })
                        )}
                      </svg>
                    </div>
                    <p className="code-instruction">{t('atm.scanAtAtm')}</p>
                  </motion.div>
                ) : (
                  <motion.div key="otp" initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }} className="otp-display">
                    <div className="otp-digits">
                      {otpCode.split('').map((d, i) => (
                        <motion.span
                          key={i}
                          className="otp-digit"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          {d}
                        </motion.span>
                      ))}
                    </div>
                    <p className="code-instruction">{t('atm.orEnterCode')}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Countdown Timer */}
              <div className={`countdown-section ${countdown < 60 ? 'urgent' : ''}`}>
                <Clock size={16} />
                <span>{t('atm.expiresIn')}</span>
                <span className="countdown-value">{formatTime(countdown)}</span>
              </div>

              {/* Amount badge */}
              <div className="code-amount-badge">
                <Banknote size={16} />
                <span>{selectedAmount?.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Actions */}
            <div className="atm-code-actions">
              <motion.button
                className="btn-primary"
                whileTap={{ scale: 0.95 }}
                onClick={handleCollected}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                <Banknote size={18} />
                {t('atm.cashCollected', "I've Collected My Cash")}
              </motion.button>
              <motion.button
                className="btn-secondary"
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/kiosk')}
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                <MapPin size={18} />
                {t('atm.findAtm')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Cash Collected */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="success-step">
            <motion.div className="success-circle atm-success" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
                <Banknote size={48} strokeWidth={2} />
              </motion.div>
            </motion.div>
            <motion.h2 className="success-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              {t('atm.collected')}
            </motion.h2>
            <motion.p className="success-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              {selectedAmount?.toLocaleString()} ETB {t('atm.collectedDesc')} Bole Medhanealem ATM
            </motion.p>

            <motion.div className="receipt-card glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
              <Receipt size={18} color="var(--accent-gold)" />
              <div>
                <span className="receipt-title">{t('atm.receipt')}</span>
                <span className="receipt-sub">{t('atm.receiptSaved')}</span>
              </div>
            </motion.div>

            <motion.div className="success-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}>
              <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => navigate('/')}>
                {t('atm.done')}
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
