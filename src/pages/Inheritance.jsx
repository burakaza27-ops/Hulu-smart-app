import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, Users, Plus, Home as HomeIcon, Wallet, FileText,
  Car, ChevronRight, Shield, AlertTriangle, Check, Clock,
  ArrowRight, X, Fingerprint, UserPlus
} from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import useTranslation from '../hooks/useTranslation';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './Inheritance.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const initialBeneficiaries = [
  { id: 1, name: 'Sara Kebede', relation: 'Daughter', avatar: 'SK', share: '40%', color: '#D4AF37' },
  { id: 2, name: 'Yonas Kebede', relation: 'Son', avatar: 'YK', share: '35%', color: '#10B981' },
  { id: 3, name: 'Hana Kebede', relation: 'Daughter', avatar: 'HK', share: '25%', color: '#8B5CF6' },
];

const colors = ['#D4AF37', '#10B981', '#8B5CF6', '#EF4444', '#3B82F6', '#F59E0B'];

const assets = [
  { id: 1, title: 'Bole Residence', type: 'Property', value: '12,500,000 ETB', icon: HomeIcon, color: '#D4AF37', assigned: 'Sara Kebede' },
  { id: 2, title: 'Savings Account', type: 'Financial', value: '3,200,000 ETB', icon: Wallet, color: '#10B981', assigned: 'Split Equally' },
  { id: 3, title: 'Business License', type: 'Legal', value: 'N/A', icon: FileText, color: '#3B82F6', assigned: 'Yonas Kebede' },
  { id: 4, title: 'Toyota Land Cruiser', type: 'Vehicle', value: '4,800,000 ETB', icon: Car, color: '#F59E0B', assigned: 'Sara Kebede' },
];

export default function Inheritance() {
  const t = useTranslation();
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showBio, setShowBio] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState(initialBeneficiaries);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBName, setNewBName] = useState('');
  const [newBRelation, setNewBRelation] = useState('');
  const [newBShare, setNewBShare] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [smartContracts, setSmartContracts] = useState([
    {
      id: 1,
      condition: 'If inactive for 6 months',
      action: 'Transfer Bole Residence title to Sara Kebede',
      status: 'Active',
      verified: true
    },
    {
      id: 2,
      condition: 'If verified death certificate',
      action: 'Release savings equally to all beneficiaries',
      status: 'Active',
      verified: true
    },
  ]);

  const [newContractCondition, setNewContractCondition] = useState('');
  const [newContractAction, setNewContractAction] = useState('');

  const handleVerified = () => {
    setShowBio(false);
    setShowWizard(false);
    setSmartContracts([
        ...smartContracts,
        {
            id: Date.now(),
            condition: newContractCondition,
            action: newContractAction,
            status: 'Active',
            verified: true
        }
    ]);
    showToast('Smart contract sealed and activated');
  };

  const handleAddBeneficiary = () => {
    if (!newBName || !newBRelation) return;
    const avatar = newBName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const color = colors[beneficiaries.length % colors.length];
    setBeneficiaries([...beneficiaries, { id: Date.now(), name: newBName, relation: newBRelation, avatar, share: newBShare || '0%', color }]);
    setShowAddBeneficiary(false);
    setNewBName(''); setNewBRelation(''); setNewBShare('');
    showToast(`${newBName} added as beneficiary`);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Header title={t('inherit.title')} subtitle={t('inherit.subtitle')} showAvatar={false} />

      {/* Warning Banner */}
      <motion.div variants={item} className="inherit-banner glass-panel">
        <AlertTriangle size={20} color="#F59E0B" />
        <div className="inherit-banner-text">
          <h4>{t('inherit.bannerTitle')}</h4>
          <p>{t('inherit.bannerDesc')}</p>
        </div>
      </motion.div>

      {/* Beneficiaries */}
      <motion.div variants={item} className="section">
        <div className="section-header">
          <span className="caption">{t('inherit.beneficiaries')}</span>
          <motion.button className="add-beneficiary-btn" whileTap={{ scale: 0.9 }} onClick={() => setShowAddBeneficiary(true)}>
            <UserPlus size={16} /> {t('inherit.add')}
          </motion.button>
        </div>
        <div className="beneficiary-cards">
          {beneficiaries.map((b) => (
            <motion.div
              key={b.id}
              className="beneficiary-card glass-panel"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="b-avatar" style={{ background: `${b.color}20`, color: b.color, borderColor: `${b.color}40` }}>
                {b.avatar}
              </div>
              <div className="b-info">
                <span className="b-name">{b.name}</span>
                <span className="b-relation">{b.relation}</span>
              </div>
              <div className="b-share" style={{ color: b.color }}>{b.share}</div>
              {beneficiaries.length > 1 && (
                <motion.button className="b-remove" whileTap={{ scale: 0.8 }} onClick={(e) => {
                  e.stopPropagation();
                  setBeneficiaries(beneficiaries.filter(x => x.id !== b.id));
                  showToast(`${b.name} removed`);
                }}>
                  <X size={14} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Asset Distribution Chart */}
        <div className="distribution-chart glass-panel">
          <h4 style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 12 }}>SHARE DISTRIBUTION</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <svg viewBox="0 0 100 100" width="100" height="100" style={{ flexShrink: 0 }}>
              {(() => {
                let cumulative = 0;
                return beneficiaries.map((b, i) => {
                  const share = parseFloat(b.share) || 0;
                  const dashArray = `${share} ${100 - share}`;
                  const dashOffset = -cumulative;
                  cumulative += share;
                  return (
                    <circle
                      key={b.id}
                      cx="50" cy="50" r="35"
                      fill="transparent"
                      stroke={b.color}
                      strokeWidth="8"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      pathLength="100"
                    />
                  );
                });
              })()}
              <text x="50" y="48" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="700">{beneficiaries.length}</text>
              <text x="50" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="7">heirs</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {beneficiaries.map((b) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{b.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.share}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Registered Assets */}
      <motion.div variants={item} className="section">
        <div className="section-header">
          <span className="caption">{t('inherit.registeredAssets')}</span>
          <span className="asset-count">{assets.length} {t('inherit.assets')}</span>
        </div>
        <div className="asset-list">
          {assets.map((asset) => {
            const Icon = asset.icon;
            return (
              <motion.div
                key={asset.id}
                className="asset-item glass-panel"
                whileTap={{ scale: 0.98 }}
                onClick={() => showToast(`${asset.title} — ${asset.value} → ${asset.assigned}`, 'info')}
                style={{ cursor: 'pointer' }}
              >
                <div className="asset-icon" style={{ background: `${asset.color}18`, color: asset.color }}>
                  <Icon size={20} />
                </div>
                <div className="asset-info">
                  <h4 className="asset-title">{asset.title}</h4>
                  <p className="asset-meta">{asset.type} · Assigned to {asset.assigned}</p>
                </div>
                <div className="asset-value-col">
                  <span className="asset-value">{asset.value}</span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Smart Contracts */}
      <motion.div variants={item} className="section">
        <div className="section-header">
          <span className="caption">{t('inherit.smartContracts')}</span>
        </div>
        <div className="smart-contracts-list">
          {smartContracts.map((sc) => (
            <div key={sc.id} className="sc-card glass-panel">
              <div className="sc-flow">
                <div className="sc-condition">
                  <Clock size={14} color="var(--accent-gold)" />
                  <span>{sc.condition}</span>
                </div>
                <div className="sc-arrow">
                  <ArrowRight size={16} />
                </div>
                <div className="sc-action">
                  <span>{sc.action}</span>
                </div>
              </div>
              <div className="sc-footer">
                <span className="sc-status">
                  <Shield size={12} /> {sc.status}
                </span>
                {sc.verified && (
                  <span className="sc-verified">
                    <Check size={12} /> Biometric Sealed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Create New Contract Button */}
      <motion.div variants={item}>
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowWizard(true); setWizardStep(1); }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24 }}
        >
          <Plus size={20} /> {t('inherit.createContract')}
        </motion.button>
      </motion.div>

      {/* Smart Contract Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWizard(false)} />
            <motion.div
              className="wizard-sheet glass-panel"
              initial={{ y: '100%', x: '-50%' }}
              animate={{ y: 0, x: '-50%' }}
              exit={{ y: '100%', x: '-50%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowWizard(false)}><X size={20} /></button>

              {/* Wizard Progress */}
              <div className="wizard-progress">
                {[1, 2].map((step) => (
                  <div key={step} className={`wiz-step ${wizardStep >= step ? 'active' : ''}`}>
                    <div className="wiz-dot">{wizardStep > step ? <Check size={12} /> : step}</div>
                    <span className="wiz-label">
                      {step === 1 && 'Condition'}
                      {step === 2 && 'Action'}
                    </span>
                  </div>
                ))}
                <div className="wiz-line">
                  <motion.div
                    className="wiz-line-fill"
                    animate={{ width: `${((wizardStep - 1) / 1) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {wizardStep === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="wizard-content">
                    <h3>{t('inherit.setCondition')}</h3>
                    <p className="subtitle">{t('inherit.whenActivate')}</p>
                    <div className="wiz-options">
                      {['Inactive for 6 months', 'Death certificate verified', 'Manual activation by beneficiary', 'Specific date reached'].map((opt, i) => (
                        <motion.button 
                            key={i} 
                            className={`wiz-option glass-panel ${newContractCondition === opt ? 'selected' : ''}`} 
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setNewContractCondition(opt)}
                            style={{ borderColor: newContractCondition === opt ? 'var(--accent-gold)' : 'var(--border-light)' }}
                        >
                          <span>{opt}</span>
                          <ChevronRight size={16} color="var(--text-muted)" />
                        </motion.button>
                      ))}
                    </div>
                    {newContractCondition && (
                        <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => setWizardStep(2)} style={{ marginTop: 20 }}>
                        Continue
                        </motion.button>
                    )}
                  </motion.div>
                )}
                {wizardStep === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="wizard-content">
                    <h3>{t('inherit.defineAction')}</h3>
                    <p className="subtitle">{t('inherit.whatHappens')}</p>
                    <div className="wiz-options">
                      {['Transfer property title deed', 'Release savings to beneficiaries', 'Share business ownership', 'Grant access to Virtual Vault'].map((opt, i) => (
                        <motion.button 
                            key={i} 
                            className={`wiz-option glass-panel ${newContractAction === opt ? 'selected' : ''}`} 
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setNewContractAction(opt)}
                            style={{ borderColor: newContractAction === opt ? 'var(--accent-gold)' : 'var(--border-light)' }}
                        >
                          <span>{opt}</span>
                          <ChevronRight size={16} color="var(--text-muted)" />
                        </motion.button>
                      ))}
                    </div>
                    {newContractAction && (
                        <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => setShowBio(true)} style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <Shield size={18} /> {t('inherit.sealActivate')}
                        </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Beneficiary Modal */}
      <AnimatePresence>
        {showAddBeneficiary && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddBeneficiary(false)} />
            <motion.div className="wizard-sheet glass-panel" initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowAddBeneficiary(false)}><X size={20} /></button>
              <h3 style={{ marginBottom: 20 }}>{t('inherit.add')} Beneficiary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="form-input" placeholder="Full Name" value={newBName} onChange={e => setNewBName(e.target.value)} />
                <input className="form-input" placeholder="Relation (e.g. Son, Daughter)" value={newBRelation} onChange={e => setNewBRelation(e.target.value)} />
                <input className="form-input" placeholder="Share % (e.g. 20%)" value={newBShare} onChange={e => setNewBShare(e.target.value)} />
                <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={handleAddBeneficiary} disabled={!newBName || !newBRelation} style={{ marginTop: 8 }}>
                  <UserPlus size={18} /> Add Beneficiary
                </motion.button>
              </div>
            </motion.div>
          </>
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
