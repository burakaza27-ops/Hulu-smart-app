import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Gift, Award, Zap, ArrowRight, Plane, Coffee } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import './Rewards.css';

export default function Rewards() {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <div className="rewards-container">
      <div className="rewards-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="header-title">Abyssinia Rewards</h2>
      </div>

      <div className="rewards-hero">
        <div className="points-display">
          <span>Available Points</span>
          <h2>45,200</h2>
          <div className="tier-badge">
            <Award size={14} color="#FFC321" />
            <span>Gold Tier</span>
          </div>
        </div>
      </div>

      <div className="rewards-progress glass-panel">
        <div className="rp-top">
          <span>14,800 pts to Platinum</span>
          <ArrowRight size={16} color="var(--text-muted)" />
        </div>
        <div className="rp-bar">
          <div className="rp-fill" style={{ width: '75%' }} />
        </div>
      </div>

      <div className="rewards-section">
        <h3>Redeem Points</h3>
        <div className="redeem-grid">
          <motion.div className="redeem-card glass-panel" whileTap={{ scale: 0.98 }}>
            <div className="rc-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <Plane size={24} />
            </div>
            <h4>Flight Discount</h4>
            <span>-20% on ET</span>
            <button className="rc-btn">10k pts</button>
          </motion.div>

          <motion.div className="redeem-card glass-panel" whileTap={{ scale: 0.98 }}>
            <div className="rc-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <Coffee size={24} />
            </div>
            <h4>Free Tomoca</h4>
            <span>Any medium coffee</span>
            <button className="rc-btn">500 pts</button>
          </motion.div>

          <motion.div className="redeem-card glass-panel" whileTap={{ scale: 0.98 }}>
            <div className="rc-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <Zap size={24} />
            </div>
            <h4>Utility Bill</h4>
            <span>Pay EEU with points</span>
            <button className="rc-btn">2k pts</button>
          </motion.div>
        </div>
      </div>

      <div className="rewards-section">
        <h3>How to Earn</h3>
        <div className="earn-list">
          <div className="earn-item glass-panel">
            <div className="earn-icon">💳</div>
            <div className="earn-info">
              <h4>Pay with One-Card</h4>
              <p>Earn 2 pts per 100 ETB spent</p>
            </div>
          </div>
          <div className="earn-item glass-panel">
            <div className="earn-icon">✈️</div>
            <div className="earn-info">
              <h4>Book Ethiopian Airlines</h4>
              <p>Earn 5x points on flights</p>
            </div>
          </div>
          <div className="earn-item glass-panel">
            <div className="earn-icon">👨‍👩‍👧‍👦</div>
            <div className="earn-info">
              <h4>Invite Friends</h4>
              <p>Earn 5,000 pts per referral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
