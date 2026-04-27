import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, QrCode, Camera, Share2, Download, Store,
  ArrowUpRight, ChevronRight, Check, Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './ScanQR.css';

const recentScans = [
  { id: 1, name: 'Yeneta Coffee', type: 'Merchant Pay', amount: '450 ETB', time: 'Today' },
  { id: 2, name: 'Almaz K.', type: 'P2P Transfer', amount: '1,200 ETB', time: 'Yesterday' },
  { id: 3, name: 'Mega Building Materials', type: 'Merchant Pay', amount: '8,900 ETB', time: 'Mar 28' },
];

export default function ScanQR() {
  const navigate = useNavigate();
  const t = useTranslation();
  const balance = useStore(s => s.balance);
  const addTransaction = useStore(s => s.addTransaction);
  const [tab, setTab] = useState('scan'); // scan | myqr
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanAmount, setScanAmount] = useState('');
  const [showBio, setShowBio] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const simulateScan = () => {
    setIsScanning(true);
    setPaymentDone(false);
    setTimeout(() => {
      setIsScanning(false);
      const amt = (Math.floor(Math.random() * 50) * 10 + 100).toString();
      setScanResult({ merchant: 'Yeneta Coffee House', amount: amt, type: 'merchant' });
      setScanAmount(amt);
    }, 2500);
  };

  const handlePayConfirm = () => {
    const num = parseFloat(scanAmount);
    if (!num || num <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (num > balance) { showToast('Insufficient balance', 'error'); return; }
    setShowBio(true);
  };

  const handlePayVerified = () => {
    setShowBio(false);
    addTransaction({
      id: Date.now(),
      title: scanResult.merchant,
      subtitle: 'QR Scan Payment',
      amount: -parseFloat(scanAmount),
      type: 'bill',
      time: 'Just now',
    });
    setPaymentDone(true);
  };

  return (
    <motion.div className="scan-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="send-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="send-title">{t('scan.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Tab Switcher */}
      <div className="scan-tabs">
        <button className={`scan-tab ${tab === 'scan' ? 'active' : ''}`} onClick={() => { setTab('scan'); setScanResult(null); }}>
          <Camera size={16} />
          <span>{t('scan.scanCode')}</span>
          {tab === 'scan' && <motion.div className="tab-indicator" layoutId="scanTab" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
        </button>
        <button className={`scan-tab ${tab === 'myqr' ? 'active' : ''}`} onClick={() => setTab('myqr')}>
          <QrCode size={16} />
          <span>{t('scan.myQr')}</span>
          {tab === 'myqr' && <motion.div className="tab-indicator" layoutId="scanTab" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'scan' && (
          <motion.div key="scan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {!scanResult ? (
              <>
                {/* Scanner Viewfinder */}
                <div className="scanner-viewfinder" onClick={simulateScan}>
                  <div className="scanner-frame">
                    <div className="corner tl" /><div className="corner tr" />
                    <div className="corner bl" /><div className="corner br" />
                    {isScanning && (
                      <motion.div
                        className="scan-line"
                        animate={{ top: ['10%', '85%', '10%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </div>
                  <p className="scanner-hint">
                    {isScanning ? t('bio.scanning') : t('scan.pointCamera')}
                  </p>
                </div>

                {/* Recent Scans */}
                <div className="section-header" style={{ marginTop: 20 }}>
                  <span className="caption">{t('scan.recentScans')}</span>
                </div>
                <div className="recent-scans-list">
                  {recentScans.map((s) => (
                    <motion.div key={s.id} className="scan-item glass-panel" whileTap={{ scale: 0.98 }}>
                      <div className="scan-item-icon">
                        {s.type === 'Merchant Pay' ? <Store size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div className="scan-item-info">
                        <h4>{s.name}</h4>
                        <p>{s.type} · {s.time}</p>
                      </div>
                      <span className="scan-item-amount">{s.amount}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              /* Scan Result */
              <motion.div className="scan-result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                {!paymentDone ? (
                  <>
                    <div className="scan-result-card glass-panel">
                      <motion.div className="sr-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                        <Store size={28} />
                      </motion.div>
                      <h3>{scanResult.merchant}</h3>
                      <span className="sr-type">{t('scan.merchantPay')}</span>
                      <div style={{ marginTop: 16, width: '100%' }}>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Amount (ETB)</label>
                        <input className="form-input" type="number" value={scanAmount}
                          onChange={e => setScanAmount(e.target.value)}
                          style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginTop: 6 }} />
                      </div>
                    </div>
                    <motion.button className="btn-primary" whileTap={{ scale: 0.95 }}
                      onClick={handlePayConfirm} style={{ marginTop: 20 }}>
                      {t('bills.confirmPayment')}
                    </motion.button>
                    <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }}
                      onClick={() => setScanResult(null)} style={{ marginTop: 10 }}>
                      Scan Again
                    </motion.button>
                  </>
                ) : (
                  <>
                    <div className="scan-result-card glass-panel">
                      <motion.div className="sr-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                        <Check size={32} />
                      </motion.div>
                      <h3>Payment Successful!</h3>
                      <p className="sr-merchant">{scanResult.merchant}</p>
                      <div className="sr-amount-display">
                        <span className="sr-amount">{parseFloat(scanAmount).toLocaleString()}</span>
                        <span className="sr-currency">ETB</span>
                      </div>
                    </div>
                    <motion.button className="btn-primary" whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/')} style={{ marginTop: 20 }}>Done</motion.button>
                    <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }}
                      onClick={() => { setScanResult(null); setPaymentDone(false); }} style={{ marginTop: 10 }}>
                      Scan Another
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === 'myqr' && (
          <motion.div key="myqr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="myqr-section">
            <div className="myqr-info-banner glass-panel">
              <QrCode size={18} color="var(--accent-gold)" />
              <div>
                <h4>{t('scan.receivePayment')}</h4>
                <p>{t('scan.scanToReceive')}</p>
              </div>
            </div>

            <div className="myqr-code-area glass-panel">
              {/* Simulated QR Code */}
              <div className="qr-placeholder">
                <svg viewBox="0 0 200 200" width="180" height="180">
                  {/* QR simulation using rectangles */}
                  <rect x="10" y="10" width="50" height="50" rx="4" fill="var(--accent-gold)" />
                  <rect x="140" y="10" width="50" height="50" rx="4" fill="var(--accent-gold)" />
                  <rect x="10" y="140" width="50" height="50" rx="4" fill="var(--accent-gold)" />
                  <rect x="20" y="20" width="30" height="30" rx="2" fill="var(--bg-primary)" />
                  <rect x="150" y="20" width="30" height="30" rx="2" fill="var(--bg-primary)" />
                  <rect x="20" y="150" width="30" height="30" rx="2" fill="var(--bg-primary)" />
                  <rect x="28" y="28" width="14" height="14" rx="1" fill="var(--accent-gold)" />
                  <rect x="158" y="28" width="14" height="14" rx="1" fill="var(--accent-gold)" />
                  <rect x="28" y="158" width="14" height="14" rx="1" fill="var(--accent-gold)" />
                  {/* Data area */}
                  {Array.from({ length: 12 }, (_, row) =>
                    Array.from({ length: 12 }, (_, col) => {
                      const show = (row * 7 + col * 11 + row * col) % 3 !== 0;
                      if (!show) return null;
                      const x = 70 + col * 6;
                      const y = 10 + row * 6;
                      if (x > 135 && y < 65) return null;
                      if (x < 65 && y > 135) return null;
                      if (x < 65 && y < 65) return null;
                      return <rect key={`${row}-${col}`} x={x} y={y} width="5" height="5" rx="1" fill="var(--text-secondary)" opacity="0.7" />;
                    })
                  )}
                  {/* more data blocks */}
                  {Array.from({ length: 10 }, (_, row) =>
                    Array.from({ length: 6 }, (_, col) => {
                      const show = (row * 3 + col * 5) % 2 === 0;
                      if (!show) return null;
                      return <rect key={`b${row}-${col}`} x={70 + col * 11} y={80 + row * 6} width="9" height="5" rx="1" fill="var(--accent-gold)" opacity="0.5" />;
                    })
                  )}
                  {Array.from({ length: 6 }, (_, row) =>
                    Array.from({ length: 10 }, (_, col) => {
                      const show = (row + col) % 3 === 0;
                      if (!show) return null;
                      return <rect key={`c${row}-${col}`} x={10 + col * 6} y={70 + row * 11} width="5" height="9" rx="1" fill="var(--text-secondary)" opacity="0.4" />;
                    })
                  )}
                </svg>
              </div>
              <div className="qr-user-info">
                <h4>Kebede Alemu</h4>
                <p>Abyssinia ID: BOA-8429-10</p>
              </div>
            </div>

            <div className="qr-actions">
              <motion.button className="qr-action-btn glass-panel" whileTap={{ scale: 0.95 }} onClick={() => showToast('QR code shared via link')}>
                <Share2 size={20} />
                <span>{t('scan.shareQr')}</span>
              </motion.button>
              <motion.button className="qr-action-btn glass-panel" whileTap={{ scale: 0.95 }} onClick={() => showToast('QR image saved to gallery')}>
                <Download size={20} />
                <span>{t('scan.saveQr')}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BiometricPrompt open={showBio} onVerified={handlePayVerified} onCancel={() => setShowBio(false)} />
    </motion.div>
  );
}
