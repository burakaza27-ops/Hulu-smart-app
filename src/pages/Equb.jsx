import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, TrendingUp, ShieldCheck, PlusCircle } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import './Equb.css';

const equbGroups = [
  {
    id: 1,
    name: 'Car Fund 2026',
    members: 12,
    amountPerMonth: 10000,
    totalPool: 120000,
    myTurn: 'August',
    currentRound: 4,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Family Land Savings',
    members: 5,
    amountPerMonth: 50000,
    totalPool: 250000,
    myTurn: 'December',
    currentRound: 1,
    status: 'Active'
  }
];

export default function Equb() {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className="equb-container">
      <div className="equb-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="header-title">Digital Equb</h2>
      </div>

      <div className="equb-hero">
        <div className="hero-content">
          <h1>Modern Social Saving</h1>
          <p>Join or create trusted Equb circles powered by Abyssinia smart contracts.</p>
          <div className="equb-stats">
            <div className="stat">
              <span className="val">2</span>
              <span className="lbl">Active Groups</span>
            </div>
            <div className="stat divider" />
            <div className="stat">
              <span className="val">60,000</span>
              <span className="lbl">Monthly ETB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="equb-actions">
        <button className="action-btn primary glass-panel">
          <PlusCircle size={20} />
          Create New Equb
        </button>
        <button className="action-btn glass-panel">
          <Users size={20} />
          Join via Invite
        </button>
      </div>

      <div className="equb-list">
        <h3>My Equb Circles</h3>
        {equbGroups.map((group) => (
          <motion.div 
            key={group.id} 
            className="equb-card glass-panel"
            whileTap={{ scale: 0.98 }}
          >
            <div className="ec-top">
              <div className="ec-title">
                <ShieldCheck size={18} color="#10B981" />
                <h4>{group.name}</h4>
              </div>
              <span className="ec-status">{group.status}</span>
            </div>
            
            <div className="ec-details">
              <div className="ec-col">
                <span className="lbl">Pool Size</span>
                <span className="val highlight">{group.totalPool.toLocaleString()} ETB</span>
              </div>
              <div className="ec-col">
                <span className="lbl">Monthly Due</span>
                <span className="val">{group.amountPerMonth.toLocaleString()} ETB</span>
              </div>
              <div className="ec-col">
                <span className="lbl">My Payout</span>
                <span className="val text-gold">{group.myTurn}</span>
              </div>
            </div>

            <div className="ec-progress">
              <div className="prog-header">
                <span>Round {group.currentRound} of {group.members}</span>
                <span>{(group.currentRound / group.members * 100).toFixed(0)}%</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${(group.currentRound / group.members) * 100}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
