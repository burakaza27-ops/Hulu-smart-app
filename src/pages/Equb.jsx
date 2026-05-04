import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, ShieldCheck, PlusCircle, CheckCircle, X, Send } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './Equb.css';

const initialGroups = [
  { id: 1, name: 'Car Fund 2026', members: 12, amountPerMonth: 10000, totalPool: 120000, myTurn: 'August', currentRound: 4, status: 'Active' },
  { id: 2, name: 'Family Land Savings', members: 5, amountPerMonth: 50000, totalPool: 250000, myTurn: 'December', currentRound: 1, status: 'Active' },
];

export default function Equb() {
  const navigate = useNavigate();
  const t = useTranslation();
  const addTransaction = useStore((s) => s.addTransaction);
  const [equbGroups, setEqubGroups] = useState(initialGroups);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showPayDue, setShowPayDue] = useState(null);
  const [paySuccess, setPaySuccess] = useState(null);
  const [newName, setNewName] = useState('');
  const [newMembers, setNewMembers] = useState('5');
  const [newAmount, setNewAmount] = useState('5000');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const group = {
      id: Date.now(),
      name: newName,
      members: parseInt(newMembers) || 5,
      amountPerMonth: parseInt(newAmount) || 5000,
      totalPool: (parseInt(newMembers) || 5) * (parseInt(newAmount) || 5000),
      myTurn: 'TBD',
      currentRound: 0,
      status: 'Active',
    };
    setEqubGroups([group, ...equbGroups]);
    setShowCreate(false);
    setNewName(''); setNewMembers('5'); setNewAmount('5000');
  };

  const handleJoin = () => {
    if (!inviteCode.trim()) return;
    const group = {
      id: Date.now(),
      name: `Invited Group (${inviteCode})`,
      members: 8,
      amountPerMonth: 15000,
      totalPool: 120000,
      myTurn: 'TBD',
      currentRound: 2,
      status: 'Active',
    };
    setEqubGroups([group, ...equbGroups]);
    setShowJoin(false);
    setInviteCode('');
  };

  const handlePayDue = (group) => {
    addTransaction({
      id: Date.now(),
      title: `Equb: ${group.name}`,
      subtitle: `Monthly contribution • Round ${group.currentRound + 1}`,
      amount: -group.amountPerMonth,
      type: 'transfer',
      time: 'Just now',
      refId: `ABY-EQB-${Date.now().toString().slice(-6)}`,
    });
    setEqubGroups(equbGroups.map(g => g.id === group.id ? { ...g, currentRound: g.currentRound + 1 } : g));
    setShowPayDue(null);
    setPaySuccess(group);
    setTimeout(() => setPaySuccess(null), 3000);
  };

  const totalMonthly = equbGroups.reduce((s, g) => s + g.amountPerMonth, 0);

  return (
    <div className="equb-container">
      <div className="equb-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
        <h2 className="header-title">{t('dash.equb', 'Digital Equb')}</h2>
      </div>

      <div className="equb-hero">
        <div className="hero-content">
          <h1>{t('equb.heroTitle', 'Modern Social Saving')}</h1>
          <p>{t('equb.heroDesc', 'Join or create trusted Equb circles powered by Abyssinia smart contracts.')}</p>
          <div className="equb-stats">
            <div className="stat"><span className="val">{equbGroups.length}</span><span className="lbl">Active Groups</span></div>
            <div className="stat divider" />
            <div className="stat"><span className="val">{totalMonthly.toLocaleString()}</span><span className="lbl">Monthly ETB</span></div>
          </div>
        </div>
      </div>

      <div className="equb-actions">
        <button className="action-btn primary glass-panel" onClick={() => setShowCreate(true)}><PlusCircle size={20} />Create New Equb</button>
        <button className="action-btn glass-panel" onClick={() => setShowJoin(true)}><Users size={20} />Join via Invite</button>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {paySuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 100, background: 'rgba(16,185,129,0.95)', padding: '14px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 600, fontSize: 14 }}>
            <CheckCircle size={18} /> Payment of {paySuccess.amountPerMonth.toLocaleString()} ETB to "{paySuccess.name}" successful!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="equb-list">
        <h3>My Equb Circles</h3>
        {equbGroups.map((group) => (
          <motion.div key={group.id} className="equb-card glass-panel" whileTap={{ scale: 0.98 }}>
            <div className="ec-top">
              <div className="ec-title"><ShieldCheck size={18} color="#10B981" /><h4>{group.name}</h4></div>
              <span className="ec-status">{group.status}</span>
            </div>
            <div className="ec-details">
              <div className="ec-col"><span className="lbl">Pool Size</span><span className="val highlight">{group.totalPool.toLocaleString()} ETB</span></div>
              <div className="ec-col"><span className="lbl">Monthly Due</span><span className="val">{group.amountPerMonth.toLocaleString()} ETB</span></div>
              <div className="ec-col"><span className="lbl">My Payout</span><span className="val text-gold">{group.myTurn}</span></div>
            </div>
            <div className="ec-progress">
              <div className="prog-header"><span>Round {group.currentRound} of {group.members}</span><span>{(group.currentRound / group.members * 100).toFixed(0)}%</span></div>
              <div className="prog-bar"><div className="prog-fill" style={{ width: `${(group.currentRound / group.members) * 100}%` }} /></div>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowPayDue(group)}
              style={{ width: '100%', marginTop: 16, padding: 12, borderRadius: 12, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Send size={16} /> Pay Monthly Due
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div className="equb-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}>
            <motion.div className="equb-modal glass-panel" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3>Create New Equb</h3><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button></div>
              <div className="modal-field"><label>Group Name</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Car Fund 2026" /></div>
              <div className="modal-field"><label>Number of Members</label><input type="number" value={newMembers} onChange={e => setNewMembers(e.target.value)} /></div>
              <div className="modal-field"><label>Monthly Amount (ETB)</label><input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} /></div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleCreate} style={{ width: '100%', padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Create Group</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div className="equb-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowJoin(false)}>
            <motion.div className="equb-modal glass-panel" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3>Join via Invite Code</h3><button onClick={() => setShowJoin(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button></div>
              <div className="modal-field"><label>Invite Code</label><input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Enter 6-digit code" /></div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleJoin} style={{ width: '100%', padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Join Group</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay Due Confirm */}
      <AnimatePresence>
        {showPayDue && (
          <motion.div className="equb-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPayDue(null)}>
            <motion.div className="equb-modal glass-panel" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ textAlign: 'center', marginBottom: 16 }}>Confirm Payment</h3>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Group</span><span style={{ fontWeight: 700 }}>{showPayDue.name}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Round</span><span style={{ fontWeight: 700 }}>{showPayDue.currentRound + 1} of {showPayDue.members}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}><span style={{ fontWeight: 800 }}>Amount</span><span style={{ fontWeight: 800, color: '#FFC321', fontSize: 20 }}>{showPayDue.amountPerMonth.toLocaleString()} ETB</span></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowPayDue(null)} style={{ flex: 1, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handlePayDue(showPayDue)} style={{ flex: 2, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Pay Now</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
