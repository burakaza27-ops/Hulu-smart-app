import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Settings, Bell, Globe, HelpCircle,
  FileText, LogOut, ChevronRight, Fingerprint, MapPin,
  X, Phone, Mail, Calendar, CreditCard, Lock, Eye, EyeOff,
  MessageCircle, ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import { showToast } from '../components/Toast';
import './Profile.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Profile() {
  const navigate = useNavigate();
  const t = useTranslation();
  const language = useStore(s => s.language);
  const toggleLanguage = useStore(s => s.toggleLanguage);
  const setSplashSeen = useStore(s => s.setSplashSeen);

  const [bioEnabled, setBioEnabled] = useState(true);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  // PIN & Password sub-form state
  const [pinView, setPinView] = useState(null); // null | 'pin' | 'password' | '2fa'
  const [pinCurrent, setPinCurrent] = useState('');
  const [pinNew, setPinNew] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [helpView, setHelpView] = useState(null);

  const handleSignOut = () => {
    // Reset splash state so onboarding shows again
    try { localStorage.removeItem('hulu-state'); } catch {}
    window.location.href = '/splash';
  };

  return (
    <motion.div className="profile-page" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="profile-header-area">
        <h2 className="page-title">{t('profile.title')}</h2>

        <div className="profile-card glass-panel">
          <div className="profile-avatar-large">
            <span>KB</span>
            <div className="profile-badge"><Shield size={12} /></div>
          </div>
          <div className="profile-info-main">
            <h3>Kebede Alemu</h3>
            <p>HULU ID: HLU-8429-10</p>
            <span className="kyc-badge">Level 3 Verified KYC</span>
          </div>
        </div>
      </motion.div>

      <div className="profile-sections-scroll">
        <motion.div variants={item} className="profile-section">
          <span className="section-label">{t('profile.account')}</span>
          <div className="profile-list glass-panel">
            <div className="pl-item" onClick={() => setShowPersonalInfo(true)}>
              <div className="pl-icon"><User size={18} /></div>
              <span>{t('profile.personalInfo')}</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
            <div className="pl-item" onClick={() => setShowLinkedAccounts(true)}>
              <div className="pl-icon"><Globe size={18} /></div>
              <span>{t('profile.linkedAccounts')}</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
            <div className="pl-item" onClick={() => navigate('/kiosk')}>
              <div className="pl-icon" style={{color: 'var(--accent-gold)'}}><MapPin size={18} /></div>
              <span>HULU Kiosk Locator</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="profile-section">
          <span className="section-label">{t('profile.security')}</span>
          <div className="profile-list glass-panel">
            <div className="pl-item" onClick={() => { setBioEnabled(!bioEnabled); showToast(bioEnabled ? 'Biometric login disabled' : 'Biometric login enabled'); }}>
              <div className="pl-icon"><Fingerprint size={18} /></div>
              <span>{t('profile.biometricLogin')}</span>
              <div className={`toggle-switch ${bioEnabled ? 'active' : ''}`}>
                <motion.div className="toggle-thumb" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </div>
            </div>
            <div className="pl-item" onClick={() => setShowPIN(true)}>
              <div className="pl-icon"><Shield size={18} /></div>
              <span>{t('profile.pinPassword')}</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="profile-section">
          <span className="section-label">{t('profile.preferences')}</span>
          <div className="profile-list glass-panel">
            <div className="pl-item" onClick={toggleLanguage}>
              <div className="pl-icon"><Globe size={18} /></div>
              <span>{t('profile.language')}</span>
              <span className="pl-value">{language === 'en' ? 'English' : 'አማርኛ'}</span>
            </div>
            <div className="pl-item" onClick={() => navigate('/notifications')}>
              <div className="pl-icon"><Bell size={18} /></div>
              <span>{t('profile.notifications')}</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="profile-section">
          <span className="section-label">{t('profile.support')}</span>
          <div className="profile-list glass-panel">
            <div className="pl-item" onClick={() => setShowHelp(true)}>
              <div className="pl-icon"><HelpCircle size={18} /></div>
              <span>{t('profile.helpCenter')}</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
            <div className="pl-item" onClick={() => setShowTerms(true)}>
              <div className="pl-icon"><FileText size={18} /></div>
              <span>{t('profile.terms')}</span>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </div>
        </motion.div>

        <motion.button variants={item} className="logout-btn glass-panel" whileTap={{ scale: 0.98 }} onClick={() => setShowSignOut(true)}>
          <LogOut size={18} />
          <span>{t('profile.signOut')}</span>
        </motion.button>
        <div style={{height: 100}} />
      </div>

      {/* ===== MODALS ===== */}

      {/* Personal Info Sheet */}
      <AnimatePresence>
        {showPersonalInfo && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPersonalInfo(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowPersonalInfo(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 20 }}>{t('profile.personalInfo')}</h3>
              <div className="info-rows">
                {[
                  { icon: User, label: 'Full Name', value: 'Kebede Alemu Tessema' },
                  { icon: Phone, label: 'Phone', value: '+251 911 234 567' },
                  { icon: Mail, label: 'Email', value: 'kebede.alemu@email.com' },
                  { icon: Calendar, label: 'Date of Birth', value: 'March 15, 1990' },
                  { icon: MapPin, label: 'Address', value: 'Bole Sub-City, Addis Ababa' },
                  { icon: CreditCard, label: 'HULU ID', value: 'HLU-8429-10' },
                ].map((r, i) => (
                  <div key={i} className="info-row">
                    <div className="info-row-icon"><r.icon size={16} /></div>
                    <div className="info-row-text">
                      <span className="info-label">{r.label}</span>
                      <span className="info-value">{r.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Linked Accounts Sheet */}
      <AnimatePresence>
        {showLinkedAccounts && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLinkedAccounts(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowLinkedAccounts(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 20 }}>{t('profile.linkedAccounts')}</h3>
              {[
                { bank: 'Abyssinia Bank', type: 'Savings', number: '****7842', primary: true },
                { bank: 'Abyssinia Bank', type: 'Current', number: '****3291', primary: false },
              ].map((acc, i) => (
                <div key={i} className="linked-account-card glass-panel">
                  <div className="la-info">
                    <h4>{acc.bank}</h4>
                    <p>{acc.type} · {acc.number}</p>
                  </div>
                  {acc.primary && <span className="la-primary">Primary</span>}
                </div>
              ))}
              <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => { setShowLinkedAccounts(false); showToast('Link new account feature coming soon', 'info'); }} style={{ marginTop: 16 }}>
                Link New Account
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* PIN & Password Sheet */}
      <AnimatePresence>
        {showPIN && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPIN(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowPIN(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 20 }}>{t('profile.pinPassword')}</h3>

              {/* Sub-view selector */}
              {!pinView && (
                <div className="pin-options">
                  {[
                    { key: 'pin', label: 'Change PIN', desc: 'Update your 6-digit transaction PIN', icon: Lock },
                    { key: 'password', label: 'Change Password', desc: 'Update login password', icon: Shield },
                    { key: '2fa', label: 'Two-Factor Auth', desc: twoFAEnabled ? 'Enabled · +251 911 *** 567' : 'Enable SMS verification', icon: Phone },
                  ].map((opt, i) => (
                    <motion.div key={i} className="pin-option glass-panel" whileTap={{ scale: 0.98 }} onClick={() => setPinView(opt.key)}>
                      <div className="po-icon"><opt.icon size={20} /></div>
                      <div className="po-info"><h4>{opt.label}</h4><p>{opt.desc}</p></div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Change PIN Form */}
              {pinView === 'pin' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button className="pin-back-link" onClick={() => setPinView(null)} style={{ alignSelf: 'flex-start', color: 'var(--accent-gold)', fontSize: 13, marginBottom: 4 }}>← Back</button>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Current PIN</label>
                  <input className="form-input" type="password" maxLength={6} placeholder="Enter current 6-digit PIN" value={pinCurrent} onChange={e => setPinCurrent(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20 }} />
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>New PIN</label>
                  <input className="form-input" type="password" maxLength={6} placeholder="Enter new 6-digit PIN" value={pinNew} onChange={e => setPinNew(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20 }} />
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Confirm New PIN</label>
                  <input className="form-input" type="password" maxLength={6} placeholder="Re-enter new PIN" value={pinConfirm} onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ letterSpacing: 8, textAlign: 'center', fontSize: 20 }} />
                  <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} style={{ marginTop: 12 }} onClick={() => {
                    if (pinCurrent.length !== 6) { showToast('Enter your current 6-digit PIN', 'error'); return; }
                    if (pinNew.length !== 6) { showToast('New PIN must be 6 digits', 'error'); return; }
                    if (pinNew !== pinConfirm) { showToast('PINs do not match', 'error'); return; }
                    if (pinNew === pinCurrent) { showToast('New PIN must be different', 'error'); return; }
                    showToast('PIN changed successfully');
                    setPinView(null); setPinCurrent(''); setPinNew(''); setPinConfirm('');
                  }}>Update PIN</motion.button>
                </motion.div>
              )}

              {/* Change Password Form */}
              {pinView === 'password' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button className="pin-back-link" onClick={() => setPinView(null)} style={{ alignSelf: 'flex-start', color: 'var(--accent-gold)', fontSize: 13, marginBottom: 4 }}>← Back</button>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPwd ? 'text' : 'password'} placeholder="Enter current password" value={pwdCurrent} onChange={e => setPwdCurrent(e.target.value)} />
                    <button onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                  </div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>New Password</label>
                  <input className="form-input" type="password" placeholder="Min 8 characters, 1 number, 1 uppercase" value={pwdNew} onChange={e => setPwdNew(e.target.value)} />
                  {pwdNew && (
                    <div style={{ display: 'flex', gap: 4, marginTop: -4 }}>
                      {[pwdNew.length >= 8, /[A-Z]/.test(pwdNew), /[0-9]/.test(pwdNew), /[^A-Za-z0-9]/.test(pwdNew)].map((ok, i) => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: ok ? 'var(--accent-emerald)' : 'var(--border-subtle)' }} />
                      ))}
                    </div>
                  )}
                  <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Confirm New Password</label>
                  <input className="form-input" type="password" placeholder="Re-enter new password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} />
                  <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} style={{ marginTop: 12 }} onClick={() => {
                    if (!pwdCurrent) { showToast('Enter current password', 'error'); return; }
                    if (pwdNew.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
                    if (!/[A-Z]/.test(pwdNew) || !/[0-9]/.test(pwdNew)) { showToast('Include 1 uppercase letter and 1 number', 'error'); return; }
                    if (pwdNew !== pwdConfirm) { showToast('Passwords do not match', 'error'); return; }
                    showToast('Password changed successfully');
                    setPinView(null); setPwdCurrent(''); setPwdNew(''); setPwdConfirm('');
                  }}>Update Password</motion.button>
                </motion.div>
              )}

              {/* Two-Factor Auth */}
              {pinView === '2fa' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <button className="pin-back-link" onClick={() => setPinView(null)} style={{ alignSelf: 'flex-start', color: 'var(--accent-gold)', fontSize: 13, marginBottom: 4 }}>← Back</button>
                  <div className="glass-panel" style={{ padding: 16, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Phone size={22} color="var(--accent-gold)" />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600 }}>SMS Verification</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Receive a code via SMS for every login</p>
                    </div>
                    <div className={`toggle-switch ${twoFAEnabled ? 'active' : ''}`} onClick={() => {
                      setTwoFAEnabled(!twoFAEnabled);
                      showToast(twoFAEnabled ? 'Two-Factor Auth disabled' : 'Two-Factor Auth enabled');
                    }}>
                      <motion.div className="toggle-thumb" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </div>
                  </div>
                  <div className="glass-panel" style={{ padding: 16, borderRadius: 14 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Verification Phone Number</p>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>+251 911 234 567</p>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>When enabled, you will be asked to enter a 6-digit code sent to your registered phone number each time you log in from a new device.</p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Help Center Sheet */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHelp(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowHelp(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 20 }}>{t('profile.helpCenter')}</h3>
              
              {/* FAQ Section */}
              <div className="pin-options">
                <motion.div className="pin-option glass-panel" whileTap={{ scale: 0.98 }} onClick={() => setHelpView(helpView === 'faq' ? null : 'faq')}>
                  <div className="po-icon"><HelpCircle size={20} /></div>
                  <div className="po-info"><h4>FAQs</h4><p>Frequently asked questions</p></div>
                  <ChevronRight size={16} color="var(--text-muted)" style={{ transform: helpView === 'faq' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </motion.div>
                
                {helpView === 'faq' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 4px' }}>
                    {[
                      { q: 'How do I reset my PIN?', a: 'Go to Profile → PIN & Password → Change PIN. Enter your current PIN and set a new one.' },
                      { q: 'Is my data safe in the Vault?', a: 'Yes. All documents are protected with AES-256 encryption and biometric locks.' },
                      { q: 'How do I send money abroad?', a: 'Use the Diaspora tab → Direct Service Payments. Supports USD, EUR, GBP, and more.' },
                      { q: 'What is the ATM withdrawal limit?', a: 'Default is 50,000 ETB/day. You can change this in Card Settings → Limits.' },
                    ].map((faq, i) => (
                      <div key={i} className="glass-panel" style={{ padding: 12, borderRadius: 10 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{faq.q}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{faq.a}</p>
                      </div>
                    ))}
                  </motion.div>
                )}

                <motion.div className="pin-option glass-panel" whileTap={{ scale: 0.98 }} onClick={() => showToast('Connecting to live agent...\nEstimated wait: 2 minutes', 'info')}>
                  <div className="po-icon"><MessageCircle size={20} /></div>
                  <div className="po-info"><h4>Live Chat</h4><p>Chat with support agent</p></div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </motion.div>
                <motion.div className="pin-option glass-panel" whileTap={{ scale: 0.98 }} onClick={() => { window.open('tel:+251115501000'); showToast('Calling HULU Support...', 'info'); }}>
                  <div className="po-icon"><Phone size={20} /></div>
                  <div className="po-info"><h4>Call Center</h4><p>+251 11 550 1000</p></div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </motion.div>
                <motion.div className="pin-option glass-panel" whileTap={{ scale: 0.98 }} onClick={() => { window.open('https://hulu.et', '_blank'); }}>
                  <div className="po-icon"><ExternalLink size={20} /></div>
                  <div className="po-info"><h4>Visit Website</h4><p>hulu.et</p></div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Terms Sheet */}
      <AnimatePresence>
        {showTerms && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTerms(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowTerms(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 16 }}>{t('profile.terms')}</h3>
              <div className="terms-content">
                <p><strong>HULU Smart Service Hub</strong></p>
                <p>Version 1.1 — Last Updated: April 2026</p>
                <br />
                <p><strong>1. Acceptance of Terms</strong></p>
                <p>By accessing and using the HULU Smart Service Hub application, you agree to be bound by these Terms and Conditions and all applicable laws and regulations of the Federal Democratic Republic of Ethiopia.</p>
                <br />
                <p><strong>2. Digital Identity</strong></p>
                <p>Your HULU One-Card and associated biometric data are protected under Ethiopian Data Protection Proclamation No. 1288/2023. We employ AES-256 encryption for all stored documents and biometric templates.</p>
                <br />
                <p><strong>3. Financial Services</strong></p>
                <p>HULU operates in partnership with Bank of Abyssinia under NBE License No. MFI/007/2024. All financial transactions are subject to Ethiopian banking regulations and anti-money laundering (AML) requirements.</p>
                <br />
                <p><strong>4. Smart Contracts</strong></p>
                <p>Digital inheritance smart contracts are legally binding under Ethiopian Civil Code Article 826-906. Biometric sealing constitutes a valid digital signature per E-Transaction Proclamation No. 1072/2018.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation */}
      <AnimatePresence>
        {showSignOut && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSignOut(false)} />
            <motion.div className="signout-modal glass-panel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <LogOut size={32} color="#EF4444" />
              <h3>Sign Out?</h3>
              <p>Are you sure you want to sign out of your HULU account?</p>
              <div className="signout-actions">
                <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }} onClick={() => setShowSignOut(false)}>Cancel</motion.button>
                <motion.button className="btn-danger" whileTap={{ scale: 0.95 }} onClick={handleSignOut}>Sign Out</motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
