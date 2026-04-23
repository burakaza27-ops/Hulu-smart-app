import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, FileText, Home, GraduationCap, FileCheck, Lock,
  Upload, Share2, Fingerprint, ScanFace, CheckCircle2, X,
  Search, Filter, Check, Download, Building2, AlertCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import useTranslation from '../hooks/useTranslation';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './Vault.css';

const initialDocs = [
  { id: 1, title: 'House Title Deed', subtitle: 'Bole Sub-City', icon: Home, type: 'Property', date: 'Jan 12, 2025', verified: true, color: '#D4AF37' },
  { id: 2, title: 'Bachelor\'s Degree', subtitle: 'Addis Ababa University', icon: GraduationCap, type: 'Education', date: 'Jul 08, 2020', verified: true, color: '#3B82F6' },
  { id: 3, title: 'Rental Agreement', subtitle: 'Commercial Property', icon: FileCheck, type: 'Contract', date: 'Mar 15, 2025', verified: true, color: '#10B981', expires: '2026-03-15' },
  { id: 4, title: 'Business License', subtitle: 'Trade Registration', icon: FileText, type: 'Legal', date: 'Nov 22, 2024', verified: true, color: '#8B5CF6', expires: '2025-05-30', expiringSoon: true },
  { id: 5, title: 'Vehicle Registration', subtitle: 'Toyota Corolla 2023', icon: FileText, type: 'Property', date: 'Feb 01, 2025', verified: false, color: '#F59E0B', expires: '2026-02-01' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const filterTypes = ['All', 'Property', 'Education', 'Contract', 'Legal'];

export default function Vault() {
  const t = useTranslation();
  const [unlocked, setUnlocked] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showBio, setShowBio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [showInstShare, setShowInstShare] = useState(false);
  const [documents, setDocuments] = useState(initialDocs);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [scanState, setScanState] = useState(null); // 'verifying', 'success', null

  const filteredDocs = useMemo(() => {
    return documents.filter(d => {
      const matchesSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' || d.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, activeFilter]);

  const handleUnlockRequest = () => { setShowBio(true); };
  const handleVerified = () => { setShowBio(false); setUnlocked(true); };

  const handleUpload = (name) => {
    if (name === "Scanned Document") {
      setScanState('verifying');
      setTimeout(() => setScanState('success'), 2000);
      setTimeout(() => {
        completeUpload(name);
        setScanState(null);
      }, 4000);
    } else {
      completeUpload(name);
    }
  };

  const completeUpload = (name) => {
    const newDoc = {
      id: Date.now(),
      title: name,
      subtitle: 'Uploaded just now',
      icon: FileText,
      type: 'Legal',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      verified: true,
      color: '#10B981',
    };
    setDocuments([newDoc, ...documents]);
    setShowUpload(false);
    if (name !== "Scanned Document") showToast('Document uploaded to Vault');
  };

  const handleShare = () => { setShowSheet(false); showToast(`"${selectedDoc.title}" shared securely via encrypted link`); };
  const handleInstShare = (inst) => { setShowInstShare(false); setShowSheet(false); showToast(`"${selectedDoc?.title}" securely routed to ${inst}`); };
  const handleView = () => { setShowSheet(false); showToast(`Opening "${selectedDoc.title}"...`, 'info'); };
  const handleDownload = () => { setShowSheet(false); showToast(`Downloading "${selectedDoc.title}"...`, 'info'); };
  const handleRevoke = () => { setShowSheet(false); showToast(`Access revoked for "${selectedDoc.title}"`, 'info'); };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Header title={t('vault.title')} subtitle={t('vault.subtitle')} showAvatar={false} />

      <AnimatePresence mode="wait">
        {!unlocked ? (
          <motion.div key="lock" className="vault-lock-screen" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} transition={{ duration: 0.4 }}>
            <div className="vault-lock-visual">
              <motion.div className="vault-ring-outer">
                <div className="vault-ring-segment" />
                <div className="vault-ring-segment s2" />
                <div className="vault-ring-segment s3" />
              </motion.div>
              <motion.div className="vault-icon-center"><Lock size={40} /></motion.div>
            </div>
            <h2 className="vault-lock-title" style={{ marginTop: 32 }}>{t('vault.locked')}</h2>
            <p className="subtitle" style={{ margin: '8px 0 28px', textAlign: 'center' }}>{t('vault.authPrompt')}</p>
            <motion.button className="btn-primary vault-unlock-btn" whileTap={{ scale: 0.95 }} onClick={handleUnlockRequest}>
              <Fingerprint size={20} /><span>{t('vault.authBtn')}</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="unlocked" variants={container} initial="hidden" animate="show" exit={{ opacity: 0 }}>
            <motion.div variants={item} className="vault-stats-row">
              <div className="vault-stat glass-panel">
                <span className="vault-stat-num">{documents.length}</span>
                <span className="vault-stat-label">{t('vault.documents')}</span>
              </div>
              <div className="vault-stat glass-panel">
                <span className="vault-stat-num">{documents.filter(d => d.verified).length}</span>
                <span className="vault-stat-label">{t('vault.verified')}</span>
              </div>
              <div className="vault-stat glass-panel">
                <span className="vault-stat-num">AES-256</span>
                <span className="vault-stat-label">{t('vault.encryption')}</span>
              </div>
            </motion.div>

            <motion.div variants={item} className="vault-search glass-panel">
              <Search size={18} color="var(--text-muted)" />
              <input type="text" placeholder={t('vault.search')} className="vault-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <button className={`filter-btn ${showFilterBar ? 'active' : ''}`} onClick={() => setShowFilterBar(!showFilterBar)}>
                <Filter size={16} />
              </button>
            </motion.div>

            <AnimatePresence>
              {showFilterBar && (
                <motion.div className="filter-bar" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  {filterTypes.map(ft => (
                    <button key={ft} className={`filter-chip ${activeFilter === ft ? 'active' : ''}`} onClick={() => setActiveFilter(ft)}>
                      {ft}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={item} className="doc-grid">
              {filteredDocs.map((doc) => {
                const Icon = doc.icon;
                return (
                  <motion.div key={doc.id} className="doc-card glass-panel" whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedDoc(doc); setShowSheet(true); }}>
                    <div className="doc-icon-wrap" style={{ background: `${doc.color}18`, color: doc.color }}><Icon size={24} /></div>
                    <h4 className="doc-title">{doc.title}</h4>
                    <p className="doc-sub">{doc.subtitle}</p>
                    <div className="doc-footer">
                      <span className="doc-type">{doc.type}</span>
                      {doc.expiringSoon ? (
                        <span className="doc-verified" style={{ color: '#EF4444' }}><AlertCircle size={12} /> Expiring Soon</span>
                      ) : (
                        doc.verified && <span className="doc-verified"><CheckCircle2 size={12} /> {t('vault.verified')}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              <motion.div className="doc-card add-doc glass-panel" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowUpload(true)}>
                <div className="add-doc-icon"><Upload size={28} /></div>
                <span className="add-doc-text">{t('vault.upload')}</span>
              </motion.div>
            </motion.div>

            {filteredDocs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No documents match your search.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Action Sheet */}
      <AnimatePresence>
        {showSheet && selectedDoc && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSheet(false)} />
            <motion.div className="action-sheet glass-panel" initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowSheet(false)}><X size={20}/></button>
              <div className="sheet-doc-header">
                <div className="doc-icon-wrap large" style={{ background: `${selectedDoc.color}18`, color: selectedDoc.color }}>
                  {(() => { const I = selectedDoc.icon; return <I size={32} />; })()}
                </div>
                <div>
                  <h3>{selectedDoc.title}</h3>
                  <p className="subtitle">{selectedDoc.subtitle}</p>
                  <p className="doc-date">{selectedDoc.date}</p>
                </div>
              </div>
              <div className="sheet-actions">
                <motion.button className="sheet-action-btn primary" whileTap={{ scale: 0.95 }} onClick={() => setShowInstShare(true)}>
                  <Building2 size={20} /> <span>Institution Share</span>
                </motion.button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <motion.button className="sheet-action-btn" whileTap={{ scale: 0.95 }} onClick={handleShare}>
                    <Share2 size={20} /> <span style={{fontSize: 13}}>Link Share</span>
                  </motion.button>
                  <motion.button className="sheet-action-btn" whileTap={{ scale: 0.95 }} onClick={handleView}>
                    <FileText size={20} /> <span style={{fontSize: 13}}>View</span>
                  </motion.button>
                  <motion.button className="sheet-action-btn" whileTap={{ scale: 0.95 }} onClick={handleDownload}>
                    <Download size={20} /> <span style={{fontSize: 13}}>Download</span>
                  </motion.button>
                  <motion.button className="sheet-action-btn danger" whileTap={{ scale: 0.95 }} onClick={handleRevoke}>
                    <Lock size={20} /> <span style={{fontSize: 13}}>Revoke</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUpload(false)} />
            <motion.div className="action-sheet glass-panel" initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowUpload(false)}><X size={20}/></button>
              {scanState === 'verifying' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '40px 0', textAlign: 'center' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: 48, height: 48, border: '3px solid var(--accent-gold)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}
                  />
                  <h4 style={{ fontSize: 18, color: 'var(--text-primary)' }}>Verifying...</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Extracting secure data from document via camera.</p>
                </motion.div>
              )}

              {scanState === 'success' && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: '40px 0', textAlign: 'center' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }} style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle2 size={32} />
                  </motion.div>
                  <h4 style={{ fontSize: 18, color: 'var(--accent-emerald)', fontWeight: 700 }}>Securely Stored</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Document encrypted and saved to Vault.</p>
                </motion.div>
              )}

              {!scanState && (
                <>
                  <h3 style={{ marginBottom: 16 }}>{t('vault.upload')}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <motion.div className="upload-area glass-panel" style={{ margin: 0, padding: '24px 16px', textAlign: 'center' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleUpload("Scanned Document")}>
                      <ScanFace size={32} color="var(--accent-emerald)" style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 13, fontWeight: 600 }}>Scan Document</p>
                      <span className="upload-formats" style={{ fontSize: 10 }}>Use Camera</span>
                    </motion.div>
                    <motion.div className="upload-area glass-panel" style={{ margin: 0, padding: '24px 16px', textAlign: 'center' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleUpload("Uploaded File")}>
                      <Upload size={32} color="var(--accent-gold)" style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 13, fontWeight: 600 }}>Upload File</p>
                      <span className="upload-formats" style={{ fontSize: 10 }}>PDF, JPG, PNG</span>
                    </motion.div>
                  </div>
                  <div className="upload-quick-options">
                    {['National ID', 'Driving License', 'Birth Certificate', 'Insurance Policy'].map((name, i) => (
                      <motion.button key={i} className="upload-quick-btn glass-panel" whileTap={{ scale: 0.95 }} onClick={() => handleUpload(name)}>
                        <FileText size={16} />
                        <span>{name}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Institution Share Modal */}
      <AnimatePresence>
        {showInstShare && (
          <>
            <motion.div className="sheet-overlay" style={{ zIndex: 202 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInstShare(false)} />
            <motion.div className="action-sheet glass-panel" style={{ zIndex: 203 }} initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <div className="sheet-handle" />
              <button className="sheet-close" onClick={() => setShowInstShare(false)}><X size={20}/></button>
              <h3 style={{ marginBottom: 16 }}>Secure Routing</h3>
              <p className="subtitle" style={{ marginBottom: 20 }}>Directly route this verified document to a registered institution via secure API.</p>
              
              <div className="upload-quick-options" style={{ flexDirection: 'column' }}>
                {['Abyssinia Bank (Loan Dept)', 'Ministry of Revenues', 'Document Authentication (DACA)', 'Immigration Office'].map((inst, i) => (
                  <motion.button key={i} className="upload-quick-btn glass-panel" style={{ width: '100%', justifyContent: 'flex-start', padding: '16px' }} whileTap={{ scale: 0.98 }} onClick={() => handleInstShare(inst)}>
                    <Building2 size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{inst}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BiometricPrompt open={showBio} onVerified={handleVerified} onCancel={() => setShowBio(false)} mode="face" />
    </motion.div>
  );
}
