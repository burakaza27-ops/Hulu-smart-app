import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Gift, Award, Zap, ArrowRight, Plane, Coffee, CheckCircle, X } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './Rewards.css';

const redeemItems = [
  { id: 1, name: 'Flight Discount', desc: '-20% on ET', cost: 10000, icon: Plane, color: '#3B82F6' },
  { id: 2, name: 'Free Tomoca', desc: 'Any medium coffee', cost: 500, icon: Coffee, color: '#10B981' },
  { id: 3, name: 'Utility Bill', desc: 'Pay EEU with points', cost: 2000, icon: Zap, color: '#8B5CF6' },
];

const earnRules = [
  { emoji: '💳', title: 'Pay with One-Card', desc: 'Earn 2 pts per 100 ETB spent' },
  { emoji: '✈️', title: 'Book Ethiopian Airlines', desc: 'Earn 5x points on flights' },
  { emoji: '👨‍👩‍👧‍👦', title: 'Invite Friends', desc: 'Earn 5,000 pts per referral' },
];

export default function Rewards() {
  const navigate = useNavigate();
  const t = useTranslation();
  const addTransaction = useStore((s) => s.addTransaction);
  const [points, setPoints] = useState(45200);
  const [showRedeem, setShowRedeem] = useState(null);
  const [redeemed, setRedeemed] = useState(null);
  const [history, setHistory] = useState([]);

  const tierName = points >= 60000 ? 'Platinum' : points >= 30000 ? 'Gold' : points >= 10000 ? 'Silver' : 'Bronze';
  const nextTier = points >= 60000 ? null : points >= 30000 ? { name: 'Platinum', needed: 60000 - points } : points >= 10000 ? { name: 'Gold', needed: 30000 - points } : { name: 'Silver', needed: 10000 - points };
  const tierProgress = points >= 60000 ? 100 : points >= 30000 ? ((points - 30000) / 30000) * 100 : points >= 10000 ? ((points - 10000) / 20000) * 100 : (points / 10000) * 100;

  const handleRedeem = (item) => {
    if (points < item.cost) return;
    setPoints(points - item.cost);
    setHistory([{ id: Date.now(), name: item.name, cost: item.cost, date: new Date().toLocaleDateString() }, ...history]);
    addTransaction({ id: Date.now(), title: `Reward: ${item.name}`, subtitle: `Redeemed ${item.cost.toLocaleString()} points`, amount: 0, type: 'income', time: 'Just now', refId: `ABY-RWD-${Date.now().toString().slice(-6)}` });
    setShowRedeem(null);
    setRedeemed(item);
    setTimeout(() => setRedeemed(null), 3000);
  };

  return (
    <div className="rewards-container">
      <div className="rewards-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
        <h2 className="header-title">{t('dash.rewards', 'Abyssinia Rewards')}</h2>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {redeemed && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 20, left: 20, right: 20, zIndex: 100, background: 'rgba(16,185,129,0.95)', padding: '14px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 600, fontSize: 14 }}>
            <CheckCircle size={18} /> "{redeemed.name}" redeemed successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rewards-hero">
        <div className="points-display">
          <span>Available Points</span>
          <h2>{points.toLocaleString()}</h2>
          <div className="tier-badge"><Award size={14} color="#FFC321" /><span>{tierName} Tier</span></div>
        </div>
      </div>

      {nextTier && (
        <div className="rewards-progress glass-panel">
          <div className="rp-top"><span>{nextTier.needed.toLocaleString()} pts to {nextTier.name}</span><ArrowRight size={16} color="var(--text-muted)" /></div>
          <div className="rp-bar"><div className="rp-fill" style={{ width: `${tierProgress}%` }} /></div>
        </div>
      )}

      <div className="rewards-section">
        <h3>Redeem Points</h3>
        <div className="redeem-grid">
          {redeemItems.map(item => {
            const ItemIcon = item.icon;
            const canAfford = points >= item.cost;
            return (
              <motion.div key={item.id} className="redeem-card glass-panel" whileTap={{ scale: canAfford ? 0.98 : 1 }} onClick={() => canAfford && setShowRedeem(item)} style={{ opacity: canAfford ? 1 : 0.5, cursor: canAfford ? 'pointer' : 'not-allowed' }}>
                <div className="rc-icon" style={{ background: `${item.color}15`, color: item.color }}><ItemIcon size={24} /></div>
                <h4>{item.name}</h4>
                <span>{item.desc}</span>
                <button className="rc-btn" disabled={!canAfford}>{item.cost >= 1000 ? `${item.cost / 1000}k pts` : `${item.cost} pts`}</button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Redemption History */}
      {history.length > 0 && (
        <div className="rewards-section">
          <h3>Redemption History</h3>
          <div className="earn-list">
            {history.map(h => (
              <div key={h.id} className="earn-item glass-panel">
                <div className="earn-icon">🎁</div>
                <div className="earn-info"><h4>{h.name}</h4><p>{h.date} • -{h.cost.toLocaleString()} pts</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rewards-section">
        <h3>How to Earn</h3>
        <div className="earn-list">
          {earnRules.map((rule, i) => (
            <div key={i} className="earn-item glass-panel">
              <div className="earn-icon">{rule.emoji}</div>
              <div className="earn-info"><h4>{rule.title}</h4><p>{rule.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Confirm Modal */}
      <AnimatePresence>
        {showRedeem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRedeem(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20 }}>
            <motion.div className="glass-panel" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: '24px 24px 20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Redeem Reward</h3>
                <button onClick={() => setShowRedeem(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ background: `${showRedeem.color}15`, color: showRedeem.color, width: 64, height: 64, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <showRedeem.icon size={32} />
                </div>
                <h3 style={{ marginBottom: 4 }}>{showRedeem.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{showRedeem.desc}</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)' }}>Points Cost</span><span style={{ fontWeight: 700, color: '#FFC321' }}>{showRedeem.cost.toLocaleString()} pts</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Balance After</span><span style={{ fontWeight: 700 }}>{(points - showRedeem.cost).toLocaleString()} pts</span></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowRedeem(null)} style={{ flex: 1, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleRedeem(showRedeem)} style={{ flex: 2, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Redeem Now</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
