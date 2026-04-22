import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, DollarSign, Building2, Send, Zap, Droplets,
  Heart, MapPin, Check, Clock,
  FileText, Video, Shield, ChevronRight, X, UserPlus, Fingerprint
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import CurrencyConverter from '../components/CurrencyConverter';
import './Diaspora.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const escrowProjects = [
  {
    id: 1, title: 'Villa Construction – Bole', status: 'Phase 2 of 4', progress: 48,
    totalCost: '8,500,000 ETB', released: '4,080,000 ETB', lastUpdate: '2 days ago',
    milestones: [
      { name: 'Foundation', done: true },
      { name: 'Structure', done: true },
      { name: 'Roofing', done: false, current: true },
      { name: 'Finishing', done: false },
    ]
  },
  {
    id: 2, title: 'Apartment – CMC', status: 'Phase 3 of 5', progress: 62,
    totalCost: '4,200,000 ETB', released: '2,604,000 ETB', lastUpdate: '5 days ago',
    milestones: [
      { name: 'Foundation', done: true },
      { name: 'Structure', done: true },
      { name: 'Electrical', done: true },
      { name: 'Plumbing', done: false, current: true },
      { name: 'Finishing', done: false },
    ]
  },
];

const initialPOAs = [
  { id: 1, name: 'Almaz Kebede', relation: 'Sister', scope: 'Property Management', status: 'Active', expires: 'Dec 2026' },
  { id: 2, name: 'Tadesse Berhane', relation: 'Father', scope: 'Banking & Legal', status: 'Active', expires: 'Jun 2026' },
];

export default function Diaspora() {
  const t = useTranslation();
  const navigate = useNavigate();
  const addTransaction = useStore(s => s.addTransaction);

  const [activeTab, setActiveTab] = useState('services');
  const [showBio, setShowBio] = useState(false);
  const [bioAction, setBioAction] = useState(null);
  const [poas, setPoas] = useState(initialPOAs);
  const [showCreatePOA, setShowCreatePOA] = useState(false);
  const [newPoaName, setNewPoaName] = useState('');
  const [newPoaRelation, setNewPoaRelation] = useState('');
  const [newPoaScope, setNewPoaScope] = useState('');
  const [showEvidence, setShowEvidence] = useState(false);
  // Service payment flow — amount entry
  const [selectedService, setSelectedService] = useState(null);
  const [svcAmount, setSvcAmount] = useState('');
  const [svcAccount, setSvcAccount] = useState('');
  const [svcRecipient, setSvcRecipient] = useState('');

  const servicePayments = [
    { icon: Zap, label: t('bills.electric'), desc: 'Ethiopian Electric', color: '#F59E0B', accountLabel: 'Meter Number', placeholder: 'e.g. 12345678' },
    { icon: Droplets, label: t('bills.water'), desc: 'Water & Sewerage', color: '#3B82F6', accountLabel: 'Account Number', placeholder: 'e.g. WS-002834' },
    { icon: Heart, label: 'Healthcare', desc: 'Medical bills', color: '#EF4444', accountLabel: 'Patient ID / Hospital', placeholder: 'e.g. Black Lion Hospital' },
    { icon: Building2, label: 'School Fees', desc: 'Tuition payment', color: '#8B5CF6', accountLabel: 'Student ID', placeholder: 'e.g. AAU/2024/1234' },
  ];

  const handleServicePay = (svc) => {
    setSelectedService(svc);
    setSvcAmount('');
    setSvcAccount('');
    setSvcRecipient('');
  };

  const handleServiceConfirm = () => {
    if (!svcAmount || parseFloat(svcAmount) <= 0) { showToast('Please enter a valid amount', 'error'); return; }
    if (!svcAccount) { showToast('Please enter the account/meter number', 'error'); return; }
    const bal = useStore.getState().balance;
    if (parseFloat(svcAmount) > bal) { showToast('Insufficient balance', 'error'); return; }
    setBioAction({ type: 'service', svc: selectedService, amount: parseFloat(svcAmount), account: svcAccount, recipient: svcRecipient });
    setShowBio(true);
  };

  const handleReleaseFunds = () => {
    setBioAction({ type: 'release' });
    setShowBio(true);
  };

  const handleVerified = () => {
    setShowBio(false);
    if (bioAction?.type === 'service') {
      addTransaction({
        id: Date.now(),
        title: bioAction.svc.desc,
        subtitle: `Diaspora Pay · ${bioAction.account}${bioAction.recipient ? ' · For ' + bioAction.recipient : ''}`,
        amount: -bioAction.amount,
        type: 'bill',
        time: 'Just now',
        refId: `HLU-TX-${Date.now().toString().slice(-6)}`,
      });
      showToast(`${bioAction.svc.label} paid: ${bioAction.amount.toLocaleString()} ETB`);
      setSelectedService(null);
    } else if (bioAction?.type === 'release') {
      showToast('Escrow funds released for Phase 3');
    } else if (bioAction?.type === 'poa') {
      setPoas([...poas, { id: Date.now(), name: newPoaName, relation: newPoaRelation, scope: newPoaScope || 'General', status: 'Active', expires: 'Apr 2027' }]);
      setShowCreatePOA(false);
      setNewPoaName(''); setNewPoaRelation(''); setNewPoaScope('');
      showToast(`POA created for ${newPoaName}`);
    }
    setBioAction(null);
  };

  const handleCreatePOA = () => {
    if (!newPoaName || !newPoaRelation) return;
    setBioAction({ type: 'poa' });
    setShowBio(true);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Header title={t('diaspora.title')} subtitle={t('diaspora.subtitle')} showAvatar={false} />

      <motion.div variants={item} className="diaspora-banner glass-panel">
        <div className="banner-icon-wrap"><Globe size={24} /></div>
        <div className="banner-text">
          <h4>{t('diaspora.bannerTitle')}</h4>
          <p>{t('diaspora.bannerDesc')}</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="diaspora-tabs">
        {['services', 'escrow', 'poa'].map((tab) => (
          <button key={tab} className={`dia-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'services' && t('diaspora.directPay')}
            {tab === 'escrow' && t('diaspora.escrow')}
            {tab === 'poa' && t('diaspora.poa')}
            {activeTab === tab && <motion.div className="tab-indicator" layoutId="diaTab" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
          </button>
        ))}
      </motion.div>

      {/* Direct Service Payment */}
      {activeTab === 'services' && (
        <motion.div key="services" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          {/* Currency Converter */}
          <div className="section-header" style={{ marginTop: 14 }}><span className="caption">{t('diaspora.currencyConverter', 'Currency Converter')}</span></div>
          <div className="glass-panel" style={{ padding: 16, borderRadius: 16, marginBottom: 20 }}>
            <CurrencyConverter />
          </div>

          <div className="section-header"><span className="caption">{t('diaspora.payForFamily')}</span></div>
          <p className="diaspora-desc">{t('diaspora.payDesc')}</p>
          <div className="service-pay-grid">
            {servicePayments.map((svc, i) => {
              const Icon = svc.icon;
              return (
                <motion.div key={i} className="service-pay-card glass-panel" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => handleServicePay(svc)}>
                  <div className="svc-icon" style={{ background: `${svc.color}18`, color: svc.color }}><Icon size={22} /></div>
                  <span className="svc-label">{svc.label}</span>
                  <span className="svc-desc">{svc.desc}</span>
                  <div className="svc-arrow"><Send size={14} /></div>
                </motion.div>
              );
            })}
          </div>
          <div className="section-header" style={{ marginTop: 24 }}><span className="caption">{t('diaspora.recentPayments')}</span></div>
          <div className="dia-tx-list">
            {[
              { title: 'Electricity for Mom', amount: '820 ETB', time: 'Today', icon: Zap, color: '#F59E0B' },
              { title: 'School Fee – Hana', amount: '12,500 ETB', time: 'Last Week', icon: Building2, color: '#8B5CF6' },
              { title: 'Water Bill – Home', amount: '250 ETB', time: 'Mar 28', icon: Droplets, color: '#3B82F6' },
            ].map((tx, i) => {
              const Icon = tx.icon;
              return (
                <motion.div key={i} className="dia-tx-item glass-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                  <div className="tx-icon" style={{ background: `${tx.color}18`, color: tx.color }}><Icon size={20} /></div>
                  <div className="tx-details">
                    <span className="tx-title">{tx.title}</span>
                    <span className="tx-subtitle">{tx.time}</span>
                  </div>
                  <div className="dia-tx-right">
                    <span className="dia-tx-amount">{tx.amount}</span>
                    <span className="dia-tx-status"><Check size={12} /> Paid</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Escrow Tracker */}
      {activeTab === 'escrow' && (
        <motion.div key="escrow" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="section-header" style={{ marginTop: 14 }}><span className="caption">{t('diaspora.investTracking')}</span></div>
          {escrowProjects.map((project) => (
            <div key={project.id} className="escrow-card glass-panel">
              <div className="escrow-head">
                <div className="escrow-title-row"><MapPin size={16} color="var(--accent-gold)" /><h4>{project.title}</h4></div>
                <span className="escrow-status-badge">{project.status}</span>
              </div>
              <div className="escrow-progress-section">
                <div className="escrow-progress-bar">
                  <motion.div className="escrow-progress-fill" initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }} />
                </div>
                <span className="escrow-progress-text">{project.progress}%</span>
              </div>
              <div className="milestones">
                {project.milestones.map((ms, i) => (
                  <div key={i} className={`milestone ${ms.done ? 'done' : ''} ${ms.current ? 'current' : ''}`}>
                    <div className="ms-dot">{ms.done && <Check size={10} />}</div>
                    <span className="ms-name">{ms.name}</span>
                  </div>
                ))}
              </div>
              <div className="escrow-finances">
                <div className="escrow-fin-item"><span className="fin-label">Total Cost</span><span className="fin-value">{project.totalCost}</span></div>
                <div className="escrow-fin-item"><span className="fin-label">Released</span><span className="fin-value emerald">{project.released}</span></div>
              </div>
              <div className="escrow-actions">
                <motion.button className="escrow-action-btn" whileTap={{ scale: 0.95 }} onClick={() => setShowEvidence(true)}>
                  <Video size={16} /> View Evidence
                </motion.button>
                <motion.button className="escrow-action-btn primary" whileTap={{ scale: 0.95 }} onClick={handleReleaseFunds}>
                  <DollarSign size={16} /> Release Funds
                </motion.button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Power of Attorney */}
      {activeTab === 'poa' && (
        <motion.div key="poa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="section-header" style={{ marginTop: 14 }}><span className="caption">{t('diaspora.virtualPoa')}</span></div>
          <p className="diaspora-desc">{t('diaspora.poaDesc')}</p>
          {poas.map((poa) => (
            <motion.div key={poa.id} className="poa-card glass-panel" whileTap={{ scale: 0.98 }} onClick={() => showToast(`${poa.name} · ${poa.scope} · Expires ${poa.expires}`, 'info')}>
              <div className="poa-avatar"><span>{poa.name.split(' ').map(n => n[0]).join('')}</span></div>
              <div className="poa-info">
                <h4 className="poa-name">{poa.name}</h4>
                <p className="poa-relation">{poa.relation} · {poa.scope}</p>
                <div className="poa-meta">
                  <span className="poa-active-badge"><Shield size={10} /> {poa.status}</span>
                  <span className="poa-expires"><Clock size={10} /> {poa.expires}</span>
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </motion.div>
          ))}
          <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => setShowCreatePOA(true)}
            style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <FileText size={18} /> {t('diaspora.createPoa')}
          </motion.button>
        </motion.div>
      )}

      {/* Evidence Modal */}
      <AnimatePresence>
        {showEvidence && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEvidence(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowEvidence(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 16 }}>Construction Evidence</h3>
              <div className="evidence-grid">
                {['Foundation complete', 'Structure walls', 'Roof framing started', 'Site inspection report'].map((e, i) => (
                  <div key={i} className="evidence-item glass-panel">
                    <Video size={20} color="var(--accent-gold)" />
                    <div><h4>{e}</h4><p>Phase {i + 1} · {i < 2 ? 'Verified' : 'Pending'}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create POA Modal */}
      <AnimatePresence>
        {showCreatePOA && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreatePOA(false)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowCreatePOA(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 20 }}>{t('diaspora.createPoa')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="form-input" placeholder="Representative Full Name" value={newPoaName} onChange={e => setNewPoaName(e.target.value)} />
                <input className="form-input" placeholder="Relation (e.g. Sister, Brother)" value={newPoaRelation} onChange={e => setNewPoaRelation(e.target.value)} />
                <input className="form-input" placeholder="Scope (e.g. Property, Banking)" value={newPoaScope} onChange={e => setNewPoaScope(e.target.value)} />
                <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={handleCreatePOA} disabled={!newPoaName || !newPoaRelation}
                  style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Fingerprint size={18} /> Seal with Biometrics
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Service Payment Modal */}
      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedService(null)} />
            <motion.div className="profile-sheet glass-panel" initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setSelectedService(null)}><X size={20} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="svc-icon" style={{ background: `${selectedService.color}18`, color: selectedService.color, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(() => { const Icon = selectedService.icon; return <Icon size={22} />; })()}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{selectedService.label}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedService.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{selectedService.accountLabel}</label>
                <input className="form-input" placeholder={selectedService.placeholder} value={svcAccount} onChange={e => setSvcAccount(e.target.value)} />
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Recipient Name (optional)</label>
                <input className="form-input" placeholder="e.g. Mom, Hana Kebede" value={svcRecipient} onChange={e => setSvcRecipient(e.target.value)} />
                <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Amount (ETB)</label>
                <input className="form-input" type="number" placeholder="Enter bill amount" value={svcAmount} onChange={e => setSvcAmount(e.target.value)} style={{ fontSize: 18, fontWeight: 700 }} />
                <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={handleServiceConfirm}
                  style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Fingerprint size={18} /> Confirm & Pay
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BiometricPrompt open={showBio} onVerified={handleVerified} onCancel={() => { setShowBio(false); setBioAction(null); }} />
    </motion.div>
  );
}
