import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, Plus, Car, Home, Laptop, GraduationCap, CheckCircle, X, TrendingUp } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './SavingsGoals.css';

const iconMap = { Car, Home, Laptop, GraduationCap, Target };

const initialGoals = [
  { id: 1, name: 'New Car', iconName: 'Car', target: 500000, current: 125000, color: '#3B82F6' },
  { id: 2, name: 'House Deposit', iconName: 'Home', target: 2000000, current: 850000, color: '#10B981' },
  { id: 3, name: 'MacBook Pro', iconName: 'Laptop', target: 180000, current: 160000, color: '#8B5CF6' },
];

export default function SavingsGoals() {
  const navigate = useNavigate();
  const t = useTranslation();
  const addTransaction = useStore((s) => s.addTransaction);
  const [goals, setGoals] = useState(initialGoals);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(null);
  const [depositAmt, setDepositAmt] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalColor, setNewGoalColor] = useState('#3B82F6');

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);

  const handleDeposit = () => {
    const amt = parseInt(depositAmt);
    if (!amt || amt <= 0) return;
    setGoals(goals.map(g => g.id === showDeposit.id ? { ...g, current: Math.min(g.current + amt, g.target) } : g));
    addTransaction({ id: Date.now(), title: `Savings: ${showDeposit.name}`, subtitle: 'Goal deposit', amount: -amt, type: 'transfer', time: 'Just now', refId: `ABY-SAV-${Date.now().toString().slice(-6)}` });
    setSuccessMsg(`${amt.toLocaleString()} ETB deposited to "${showDeposit.name}"`);
    setShowDeposit(null); setDepositAmt('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleWithdraw = () => {
    const amt = parseInt(withdrawAmt);
    if (!amt || amt <= 0 || amt > showWithdraw.current) return;
    setGoals(goals.map(g => g.id === showWithdraw.id ? { ...g, current: g.current - amt } : g));
    addTransaction({ id: Date.now(), title: `Savings Withdraw: ${showWithdraw.name}`, subtitle: 'Goal withdrawal', amount: amt, type: 'income', time: 'Just now', refId: `ABY-SAV-${Date.now().toString().slice(-6)}` });
    setSuccessMsg(`${amt.toLocaleString()} ETB withdrawn from "${showWithdraw.name}"`);
    setShowWithdraw(null); setWithdrawAmt('');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreateGoal = () => {
    if (!newGoalName.trim() || !newGoalTarget) return;
    setGoals([{ id: Date.now(), name: newGoalName, iconName: 'Target', target: parseInt(newGoalTarget), current: 0, color: newGoalColor }, ...goals]);
    setShowCreate(false); setNewGoalName(''); setNewGoalTarget('');
  };

  return (
    <div className="goals-container">
      <div className="goals-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
        <h2 className="header-title">{t('dash.savings', 'Savings Goals')}</h2>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 100, background: 'rgba(16,185,129,0.95)', padding: '14px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 600, fontSize: 14 }}>
            <CheckCircle size={18} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="goals-hero">
        <div className="total-saved">
          <span>Total Saved in Goals</span>
          <h2>{totalSaved.toLocaleString()} <span>ETB</span></h2>
        </div>
        <button className="add-goal-btn" onClick={() => setShowCreate(true)}><Plus size={20} />New Goal</button>
      </div>

      <div className="goals-list">
        {goals.map((goal, i) => {
          const percent = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
          const GoalIcon = iconMap[goal.iconName] || Target;
          return (
            <motion.div key={goal.id} className="goal-card glass-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="goal-top">
                <div className="goal-icon" style={{ background: `${goal.color}20`, color: goal.color }}><GoalIcon size={20} /></div>
                <div className="goal-info">
                  <h3>{goal.name}</h3>
                  <span>{percent >= 100 ? '🎉 Goal Reached!' : `${percent.toFixed(1)}% Completed`}</span>
                </div>
              </div>
              <div className="goal-progress">
                <div className="gp-bar"><div className="gp-fill" style={{ width: `${Math.min(percent, 100)}%`, background: goal.color }} /></div>
                <div className="gp-labels"><span>{goal.current.toLocaleString()} ETB</span><span>{goal.target.toLocaleString()} ETB</span></div>
              </div>
              <div className="goal-actions">
                <button className="g-action-btn" onClick={() => { setShowDeposit(goal); setDepositAmt(''); }}>Deposit</button>
                <button className="g-action-btn secondary" onClick={() => { setShowWithdraw(goal); setWithdrawAmt(''); }}>Withdraw</button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeposit(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20 }}>
            <motion.div className="glass-panel" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: '24px 24px 20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Deposit to {showDeposit.name}</h3>
                <button onClick={() => setShowDeposit(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Remaining: {(showDeposit.target - showDeposit.current).toLocaleString()} ETB to reach your goal
              </p>
              <div className="modal-field"><label>Amount (ETB)</label><input type="number" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} placeholder="Enter amount" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                {[1000, 5000, 10000, 25000, 50000, 100000].map(q => (
                  <button key={q} onClick={() => setDepositAmt(String(q))} style={{ padding: 10, borderRadius: 10, background: depositAmt === String(q) ? 'rgba(255,195,33,0.15)' : 'rgba(255,255,255,0.04)', border: depositAmt === String(q) ? '1px solid rgba(255,195,33,0.4)' : '1px solid rgba(255,255,255,0.08)', color: depositAmt === String(q) ? '#FFC321' : 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{q >= 1000 ? `${q/1000}K` : q}</button>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeposit} style={{ width: '100%', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Deposit Now</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWithdraw(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20 }}>
            <motion.div className="glass-panel" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: '24px 24px 20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Withdraw from {showWithdraw.name}</h3>
                <button onClick={() => setShowWithdraw(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Available: {showWithdraw.current.toLocaleString()} ETB</p>
              <div className="modal-field"><label>Amount (ETB)</label><input type="number" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} placeholder="Enter amount" max={showWithdraw.current} /></div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleWithdraw} style={{ width: '100%', padding: 16, borderRadius: 14, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Withdraw</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20 }}>
            <motion.div className="glass-panel" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: '24px 24px 20px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Create New Goal</h3>
                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div className="modal-field"><label>Goal Name</label><input value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="e.g. Wedding Fund" /></div>
              <div className="modal-field"><label>Target Amount (ETB)</label><input type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} placeholder="e.g. 500000" /></div>
              <div className="modal-field">
                <label>Color</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map(c => (
                    <button key={c} onClick={() => setNewGoalColor(c)} style={{ width: 32, height: 32, borderRadius: 10, background: c, border: newGoalColor === c ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleCreateGoal} style={{ width: '100%', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>Create Goal</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
