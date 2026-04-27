import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, User, Star, Clock, ArrowUpRight,
  ChevronRight, Check, Fingerprint, Share2, Copy, Phone,
  Building2, Receipt
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './SendMoney.css';

const recentContacts = [
  { id: 1, name: 'Almaz Kebede', initials: 'AK', color: '#FFC321', bank: 'Abyssinia Bank', account: '****4821', phone: '+251 91 123 4567' },
  { id: 2, name: 'Tadesse Berhane', initials: 'TB', color: '#10B981', bank: 'Abyssinia Bank', account: '****7291', phone: '+251 91 234 5678' },
  { id: 3, name: 'Sara Mengistu', initials: 'SM', color: '#8B5CF6', bank: 'CBE', account: '****3104', phone: '+251 92 345 6789' },
  { id: 4, name: 'Yonas Desta', initials: 'YD', color: '#3B82F6', bank: 'Awash Bank', account: '****8456', phone: '+251 91 456 7890' },
  { id: 5, name: 'Hana Tesfaye', initials: 'HT', color: '#EC4899', bank: 'Abyssinia Bank', account: '****6012', phone: '+251 93 567 8901' },
  { id: 6, name: 'Dawit Hailu', initials: 'DH', color: '#F59E0B', bank: 'Dashen Bank', account: '****9387', phone: '+251 91 678 9012' },
  { id: 7, name: 'Meron Fikre', initials: 'MF', color: '#06B6D4', bank: 'Abyssinia Bank', account: '****2745', phone: '+251 92 789 0123' },
  { id: 8, name: 'Abel Girma', initials: 'AG', color: '#EF4444', bank: 'Zemen Bank', account: '****1598', phone: '+251 91 890 1234' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

export default function SendMoney() {
  const navigate = useNavigate();
  const t = useTranslation();
  const balance = useStore((s) => s.balance);
  const addTransaction = useStore((s) => s.addTransaction);

  const [step, setStep] = useState(1); // 1: select, 2: amount, 3: confirm, 4: success
  const [selectedContact, setSelectedContact] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showBio, setShowBio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendMode, setSendMode] = useState('contact'); // contact | phone | account
  const [manualPhone, setManualPhone] = useState('');
  const [manualAccount, setManualAccount] = useState('');
  const [manualName, setManualName] = useState('');
  const [txRef, setTxRef] = useState('');

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  const filteredContacts = recentContacts.filter(c =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  );

  // Determine transfer fee (inter-bank = 15 ETB, same bank = free)
  const isInterBank = selectedContact && selectedContact.bank !== 'Abyssinia Bank';
  const transferFee = isInterBank ? 15 : 0;
  const totalAmount = (parseFloat(amount?.replace(/,/g, '')) || 0) + transferFee;

  const handleSelectManual = () => {
    if (sendMode === 'phone' && manualPhone.length >= 10) {
      setSelectedContact({
        id: 'manual',
        name: manualName || manualPhone,
        initials: manualName ? manualName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '##',
        color: '#6B7280',
        bank: 'Unknown',
        account: '—',
        phone: manualPhone,
      });
      setStep(2);
    } else if (sendMode === 'account' && manualAccount.length >= 8 && manualName) {
      setSelectedContact({
        id: 'manual',
        name: manualName,
        initials: manualName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        color: '#6B7280',
        bank: 'Abyssinia Bank',
        account: manualAccount,
        phone: '—',
      });
      setStep(2);
    } else {
      showToast('Please fill in all required fields', 'error');
    }
  };

  const handleConfirm = () => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!num || num <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (totalAmount > balance) { showToast('Insufficient balance', 'error'); return; }
    setShowBio(true);
  };

  const handleVerified = () => {
    setShowBio(false);
    const ref = `BOA-TX-${Date.now().toString().slice(-6)}`;
    setTxRef(ref);
    addTransaction({
      id: Date.now(),
      title: `Transfer to ${selectedContact.name}`,
      subtitle: note || 'Personal Transfer',
      amount: -parseFloat(amount.replace(/,/g, '')),
      type: 'transfer',
      time: 'Just now',
      refId: ref,
    });
    if (transferFee > 0) {
      addTransaction({
        id: Date.now() + 1,
        title: 'Transfer Fee',
        subtitle: `Inter-bank fee (${selectedContact.bank})`,
        amount: -transferFee,
        type: 'bill',
        time: 'Just now',
      });
    }
    setStep(4);
  };

  const handleShareReceipt = () => {
    const receiptText = `Abyssinia Transfer Receipt\n─────────────────\nTo: ${selectedContact.name}\nAmount: ${amount} ETB\nFee: ${transferFee > 0 ? transferFee + ' ETB' : 'Free'}\nRef: ${txRef}\nDate: ${new Date().toLocaleString()}\n─────────────────\nPowered by Abyssinia Smart Service Hub`;
    if (navigator.share) {
      navigator.share({ title: 'Abyssinia Transfer Receipt', text: receiptText });
    } else {
      navigator.clipboard.writeText(receiptText);
      showToast('Receipt copied to clipboard');
    }
  };

  return (
    <motion.div className="send-page" variants={container} initial="hidden" animate="show">
      <div className="send-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => {
          if (step > 1 && step < 4) setStep(step - 1);
          else navigate('/');
        }}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="send-title">{t('send.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="send-steps">
        {['Select', 'Amount', 'Confirm'].map((label, i) => (
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

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="send-content">
            
            {/* Send mode tabs */}
            <div className="send-mode-tabs">
              {[
                { key: 'contact', icon: User, label: 'Contacts' },
                { key: 'phone', icon: Phone, label: 'Phone' },
                { key: 'account', icon: Building2, label: 'Account' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} className={`smt-btn ${sendMode === key ? 'active' : ''}`} onClick={() => setSendMode(key)}>
                  <Icon size={14} />
                  <span>{label}</span>
                  {sendMode === key && <motion.div className="tab-indicator" layoutId="sendMode" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                </button>
              ))}
            </div>

            {sendMode === 'contact' && (
              <>
                <div className="send-search glass-panel">
                  <Search size={18} color="var(--text-muted)" />
                  <input type="text" placeholder={t('send.searchPlaceholder')} className="send-search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>

                <div className="section-header" style={{ marginTop: 20 }}>
                  <span className="caption">{t('send.recent')}</span>
                </div>
                <div className="recent-contacts-scroll">
                  {filteredContacts.slice(0, 6).map((c) => (
                    <motion.button
                      key={c.id}
                      className={`recent-contact ${selectedContact?.id === c.id ? 'selected' : ''}`}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setSelectedContact(c); setStep(2); }}
                    >
                      <div className="rc-avatar" style={{ background: `${c.color}20`, color: c.color, borderColor: selectedContact?.id === c.id ? c.color : 'transparent' }}>
                        {c.initials}
                      </div>
                      <span className="rc-name">{c.name.split(' ')[0]}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="section-header" style={{ marginTop: 20 }}>
                  <span className="caption">{t('send.allContacts')}</span>
                </div>
                <div className="contacts-list">
                  {filteredContacts.map((c) => (
                    <motion.div
                      key={c.id}
                      className={`contact-item glass-panel ${selectedContact?.id === c.id ? 'selected' : ''}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedContact(c); setStep(2); }}
                    >
                      <div className="ci-avatar" style={{ background: `${c.color}20`, color: c.color }}>
                        {c.initials}
                      </div>
                      <div className="ci-info">
                        <span className="ci-name">{c.name}</span>
                        <span className="ci-account">{c.bank} · {c.account}</span>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {sendMode === 'phone' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Recipient Phone Number</label>
                <div className="send-search glass-panel">
                  <Phone size={18} color="var(--text-muted)" />
                  <input type="tel" placeholder="+251 9X XXX XXXX" className="send-search-input" value={manualPhone} onChange={e => setManualPhone(e.target.value.replace(/[^0-9+ ]/g, ''))} />
                </div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Recipient Name (optional)</label>
                <div className="send-search glass-panel">
                  <User size={18} color="var(--text-muted)" />
                  <input type="text" placeholder="e.g. Abebe Kebede" className="send-search-input" value={manualName} onChange={e => setManualName(e.target.value)} />
                </div>
                <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={handleSelectManual} style={{ marginTop: 8 }}>
                  Continue
                </motion.button>
              </motion.div>
            )}

            {sendMode === 'account' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Account Number</label>
                <div className="send-search glass-panel">
                  <Building2 size={18} color="var(--text-muted)" />
                  <input type="text" placeholder="Enter account number" className="send-search-input" value={manualAccount} onChange={e => setManualAccount(e.target.value.replace(/[^0-9]/g, ''))} />
                </div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Account Holder Name</label>
                <div className="send-search glass-panel">
                  <User size={18} color="var(--text-muted)" />
                  <input type="text" placeholder="e.g. Abebe Kebede" className="send-search-input" value={manualName} onChange={e => setManualName(e.target.value)} />
                </div>
                <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={handleSelectManual} style={{ marginTop: 8 }}>
                  Continue
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="send-content amount-step">
            <div className="amount-recipient glass-panel">
              <span className="to-label">{t('send.to')}</span>
              <div className="to-info">
                <div className="ci-avatar small" style={{ background: `${selectedContact.color}20`, color: selectedContact.color }}>
                  {selectedContact.initials}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedContact.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedContact.bank} · {selectedContact.account}</span>
                </div>
              </div>
            </div>

            <div className="amount-input-section">
              <span className="amount-currency">ETB</span>
              <input
                type="text"
                className="amount-input"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                autoFocus
              />
            </div>

            <div className="quick-amounts">
              {quickAmounts.map((qa) => (
                <motion.button
                  key={qa}
                  className={`quick-amount-btn ${parseFloat(amount?.replace(/,/g, '')) === qa ? 'active' : ''}`}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAmount(qa.toLocaleString())}
                >
                  {qa.toLocaleString()}
                </motion.button>
              ))}
            </div>

            <input
              type="text"
              className="note-input"
              placeholder={t('send.note')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="balance-info">
              <span>{t('send.availBalance')}</span>
              <span className="bal-val">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB</span>
            </div>

            {amount && (
              <motion.button
                className="btn-primary send-continue-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(3)}
              >
                {t('send.reviewTransfer')}
              </motion.button>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="send-content">
            <div className="confirm-card glass-panel">
              <div className="confirm-amount-display">
                <span className="confirm-label">{t('send.youAreSending')}</span>
                <h2 className="confirm-amount">{amount} <span>ETB</span></h2>
              </div>

              <div className="confirm-divider" />

              <div className="confirm-detail">
                <span className="cd-label">{t('send.to')}</span>
                <div className="cd-value">
                  <div className="ci-avatar small" style={{ background: `${selectedContact.color}20`, color: selectedContact.color }}>
                    {selectedContact.initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{selectedContact.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedContact.bank} · {selectedContact.account}</span>
                  </div>
                </div>
              </div>

              <div className="confirm-detail">
                <span className="cd-label">{t('bills.from')}</span>
                <span className="cd-value-text">Abyssinia Bank · ****7842</span>
              </div>

              <div className="confirm-detail">
                <span className="cd-label">{t('bills.fee')}</span>
                <span className={`cd-value-text ${!isInterBank ? 'fee' : ''}`}>
                  {isInterBank ? `${transferFee} ETB (Inter-bank)` : t('bills.free')}
                </span>
              </div>

              {note && (
                <div className="confirm-detail">
                  <span className="cd-label">Note</span>
                  <span className="cd-value-text">{note}</span>
                </div>
              )}

              <div className="confirm-divider" />

              <div className="confirm-detail">
                <span className="cd-label" style={{ fontWeight: 700 }}>{t('send.total')}</span>
                <span className="cd-value-text total">{totalAmount.toLocaleString()} ETB</span>
              </div>
            </div>

            <motion.button
              className="btn-primary send-confirm-btn"
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <Fingerprint size={20} />
              {t('send.confirmSend')}
            </motion.button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="send-content success-step">
            <motion.div className="success-circle" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}>
                <Check size={48} strokeWidth={3} />
              </motion.div>
            </motion.div>
            <motion.h2 className="success-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              {t('send.success')}
            </motion.h2>
            <motion.p className="success-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              {amount} ETB {t('send.sentTo')} {selectedContact?.name}
            </motion.p>

            {/* Receipt Card */}
            <motion.div className="receipt-summary glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
              <div className="receipt-row">
                <span>Reference</span>
                <span className="receipt-val" style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{txRef}</span>
              </div>
              <div className="receipt-row">
                <span>Amount</span>
                <span className="receipt-val">{amount} ETB</span>
              </div>
              {transferFee > 0 && (
                <div className="receipt-row">
                  <span>Fee</span>
                  <span className="receipt-val">{transferFee} ETB</span>
                </div>
              )}
              <div className="receipt-row">
                <span>Date</span>
                <span className="receipt-val">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="receipt-row">
                <span>Time</span>
                <span className="receipt-val">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
              <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }} onClick={() => { setStep(1); setAmount(''); setSelectedContact(null); setNote(''); setSendMode('contact'); }}
                style={{ marginTop: 0 }}>
                {t('send.sendAnother')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <BiometricPrompt
        open={showBio}
        onVerified={handleVerified}
        onCancel={() => setShowBio(false)}
        mode="face"
      />
    </motion.div>
  );
}
