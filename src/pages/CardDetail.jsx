import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CreditCard, Copy, Settings, PieChart,
  ShieldAlert, Banknote, ChevronRight, X, Check,
  Lock, Snowflake
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import './CardDetail.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function CardDetail() {
  const navigate = useNavigate();
  const t = useTranslation();
  const balance = useStore(s => s.balance);
  const [isCopied, setIsCopied] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showLimits, setShowLimits] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(50000);
  // Card PIN & Security state
  const [cardPinView, setCardPinView] = useState(null);
  const [cardPinCurrent, setCardPinCurrent] = useState('');
  const [cardPinNew, setCardPinNew] = useState('');
  const [cardPinConfirm, setCardPinConfirm] = useState('');
  const [secure3D, setSecure3D] = useState(true);
  const [nfcEnabled, setNfcEnabled] = useState(false);

  const formatBalance = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2 });

  const handleCopy = () => {
    navigator.clipboard.writeText('4582 1234 5678 7842');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFreeze = () => {
    setIsFrozen(!isFrozen);
    showToast(isFrozen ? 'Card unfrozen — transactions enabled' : 'Card frozen — all transactions blocked', isFrozen ? 'success' : 'info');
  };

  const settingsActions = [
    { icon: ShieldAlert, label: isFrozen ? 'Unfreeze Card' : 'Freeze Card', color: '#EF4444', desc: isFrozen ? 'Re-enable transactions' : 'Temporarily lock card', action: handleFreeze },
    { icon: PieChart, label: 'Limits', color: '#F59E0B', desc: 'Set daily spending limit', action: () => setShowLimits(true) },
    { icon: Banknote, label: 'Cardless ATM', color: '#10B981', desc: 'Withdraw without card', action: () => navigate('/atm-withdraw') },
    { icon: Settings, label: 'PIN & Security', color: '#3B82F6', desc: 'Change PIN, 3D Secure', action: () => setShowPIN(true) },
  ];

  return (
    <motion.div className="card-detail-page" variants={container} initial="hidden" animate="show">
      <div className="send-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="send-title">{t('card.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <motion.div variants={item} className={`card-flip-container ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div className={`hulu-card large-card card-front ${isFrozen ? 'frozen' : ''}`}>
          <div className="card-shine" />
          {isFrozen && (
            <motion.div className="freeze-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Snowflake size={40} />
              <span>Card Frozen</span>
            </motion.div>
          )}
          <div className="card-content">
            <div className="card-header-row">
              <div className="card-logo">
                <CreditCard size={20} />
                <span className="card-brand">HULU</span>
                <span className="card-brand-sub">{t('card.onecard')}</span>
              </div>
              <div className="contactless-wave" style={{ position: 'relative', right: 0 }} />
            </div>
            <div className="card-number-large" onClick={(e) => { e.stopPropagation(); handleCopy(); }}>
              <span>4582</span><span>1234</span><span>5678</span><span>7842</span>
              <button className={`copy-btn ${isCopied ? 'copied' : ''}`}><Copy size={14} /></button>
            </div>
            <div className="card-footer-row large">
              <div className="card-info-group">
                <span className="card-label">Cardholder Name</span>
                <span className="card-value">Kebede Alemu</span>
              </div>
              <div className="card-info-group">
                <span className="card-label">Expiry</span>
                <span className="card-value">12/28</span>
              </div>
              <div className="card-info-group">
                <span className="card-label">CVV</span>
                <span className="card-value">***</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back of the card */}
        <motion.div className={`hulu-card large-card card-back ${isFrozen ? 'frozen' : ''}`}>
          <div className="card-magnetic-stripe"></div>
          <div className="card-back-content">
            <div className="cvv-strip">
              <span>CVV</span>
              <div className="cvv-box">842</div>
            </div>
            <div className="qr-container">
              <div className="qr-code-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM9 3v6M15 9v-6M9 21v-6M15 21v-6M21 9v6h-6M3 9h6M9 15h6M21 15h-6M15 15h6"/>
                </svg>
              </div>
              <span className="qr-text">Scan to Pay</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="card-stats-row glass-panel">
        <div className="card-stat-col">
          <span className="cs-label">Available Balance</span>
          <span className="cs-value">{formatBalance(balance)}</span>
        </div>
        <div className="cs-divider" />
        <div className="card-stat-col">
          <span className="cs-label">Monthly Spent</span>
          <span className="cs-value">42,500.00</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="section" style={{ marginTop: 24 }}>
        <div className="section-header">
          <span className="caption">Card Settings</span>
        </div>
        <div className="card-settings-grid">
          {settingsActions.map((action, i) => (
            <motion.div key={i} className="card-setting-item glass-panel" whileTap={{ scale: 0.98 }} onClick={action.action} style={{ cursor: 'pointer' }}>
              <div className="csi-icon" style={{ background: `${action.color}18`, color: action.color }}>
                <action.icon size={22} />
              </div>
              <div className="csi-info">
                <h4>{action.label}</h4>
                <p>{action.desc}</p>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Limits Modal */}
      <AnimatePresence>
        {showLimits && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLimits(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowLimits(false)}><X size={20} /></button>
              <h3>Spending Limits</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 20px' }}>Set daily transaction limits for your HULU One-Card.</p>
              <div className="limit-display">
                <span className="limit-label">Daily Limit</span>
                <span className="limit-value">{dailyLimit.toLocaleString()} ETB</span>
              </div>
              <input type="range" className="limit-slider" min={5000} max={200000} step={5000} value={dailyLimit} onChange={e => setDailyLimit(parseInt(e.target.value))} />
              <div className="limit-range-labels">
                <span>5,000</span><span>200,000</span>
              </div>
              <div className="limit-presets">
                {[10000, 50000, 100000, 200000].map(v => (
                  <motion.button key={v} className={`limit-preset ${dailyLimit === v ? 'active' : ''}`} whileTap={{ scale: 0.95 }} onClick={() => setDailyLimit(v)}>
                    {(v / 1000)}K
                  </motion.button>
                ))}
              </div>
              <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => { setShowLimits(false); showToast(`Daily limit set to ${dailyLimit.toLocaleString()} ETB`); }} style={{ marginTop: 24 }}>
                Save Limit
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PIN & Security Modal */}
      <AnimatePresence>
        {showPIN && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPIN(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => { setShowPIN(false); setCardPinView(null); }}><X size={20} /></button>
              <h3>PIN & Security</h3>

              {!cardPinView && (
                <div className="pin-options" style={{ marginTop: 16 }}>
                  {[
                    { key: 'changepin', label: 'Change Card PIN', desc: 'Update your 4-digit card PIN', icon: Lock },
                    { key: '3ds', label: '3D Secure', desc: secure3D ? 'Enabled' : 'Disabled', icon: ShieldAlert },
                    { key: 'nfc', label: 'Contactless Payments', desc: nfcEnabled ? 'NFC tap-to-pay enabled' : 'Enable NFC tap-to-pay', icon: CreditCard },
                  ].map((opt, i) => (
                    <motion.div key={i} className="pin-option glass-panel" whileTap={{ scale: 0.98 }} onClick={() => setCardPinView(opt.key)}>
                      <div className="po-icon"><opt.icon size={20} /></div>
                      <div className="po-info"><h4>{opt.label}</h4><p>{opt.desc}</p></div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </motion.div>
                  ))}
                </div>
              )}

              {cardPinView === 'changepin' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <button onClick={() => setCardPinView(null)} style={{ alignSelf: 'flex-start', color: 'var(--accent-gold)', fontSize: 13, marginBottom: 4 }}>← Back</button>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Current Card PIN</label>
                  <input className="form-input" type="password" maxLength={4} placeholder="••••" value={cardPinCurrent} onChange={e => setCardPinCurrent(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ letterSpacing: 12, textAlign: 'center', fontSize: 24 }} />
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>New Card PIN</label>
                  <input className="form-input" type="password" maxLength={4} placeholder="••••" value={cardPinNew} onChange={e => setCardPinNew(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ letterSpacing: 12, textAlign: 'center', fontSize: 24 }} />
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Confirm New PIN</label>
                  <input className="form-input" type="password" maxLength={4} placeholder="••••" value={cardPinConfirm} onChange={e => setCardPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ letterSpacing: 12, textAlign: 'center', fontSize: 24 }} />
                  <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} style={{ marginTop: 12 }} onClick={() => {
                    if (cardPinCurrent.length !== 4) { showToast('Enter your current 4-digit PIN', 'error'); return; }
                    if (cardPinNew.length !== 4) { showToast('New PIN must be 4 digits', 'error'); return; }
                    if (cardPinNew !== cardPinConfirm) { showToast('PINs do not match', 'error'); return; }
                    showToast('Card PIN changed successfully');
                    setCardPinView(null); setCardPinCurrent(''); setCardPinNew(''); setCardPinConfirm('');
                  }}>Update Card PIN</motion.button>
                </motion.div>
              )}

              {cardPinView === '3ds' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  <button onClick={() => setCardPinView(null)} style={{ alignSelf: 'flex-start', color: 'var(--accent-gold)', fontSize: 13, marginBottom: 4 }}>← Back</button>
                  <div className="glass-panel" style={{ padding: 16, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <ShieldAlert size={22} color="#3B82F6" />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600 }}>3D Secure (OTP)</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Verify online payments with SMS code</p>
                    </div>
                    <div className={`toggle-switch ${secure3D ? 'active' : ''}`} onClick={() => { setSecure3D(!secure3D); showToast(secure3D ? '3D Secure disabled' : '3D Secure enabled'); }}>
                      <motion.div className="toggle-thumb" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>When enabled, online card transactions will require a one-time password sent to your registered phone number for added security.</p>
                </motion.div>
              )}

              {cardPinView === 'nfc' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                  <button onClick={() => setCardPinView(null)} style={{ alignSelf: 'flex-start', color: 'var(--accent-gold)', fontSize: 13, marginBottom: 4 }}>← Back</button>
                  <div className="glass-panel" style={{ padding: 16, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <CreditCard size={22} color="#10B981" />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600 }}>NFC Tap-to-Pay</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pay by tapping your card at POS terminals</p>
                    </div>
                    <div className={`toggle-switch ${nfcEnabled ? 'active' : ''}`} onClick={() => { setNfcEnabled(!nfcEnabled); showToast(nfcEnabled ? 'Contactless payments disabled' : 'Contactless payments enabled'); }}>
                      <motion.div className="toggle-thumb" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>Allows contactless payments up to 5,000 ETB without entering your PIN at supported terminals.</p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
