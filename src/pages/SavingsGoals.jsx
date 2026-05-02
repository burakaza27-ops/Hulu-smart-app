import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Target, Plus, Car, Home, Laptop, GraduationCap } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import './SavingsGoals.css';

export default function SavingsGoals() {
  const navigate = useNavigate();
  const t = useTranslation();

  const goals = [
    { id: 1, name: 'New Car', icon: Car, target: 500000, current: 125000, color: '#3B82F6' },
    { id: 2, name: 'House Deposit', icon: Home, target: 2000000, current: 850000, color: '#10B981' },
    { id: 3, name: 'MacBook Pro', icon: Laptop, target: 180000, current: 160000, color: '#8B5CF6' }
  ];

  return (
    <div className="goals-container">
      <div className="goals-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="header-title">Savings Goals</h2>
      </div>

      <div className="goals-hero">
        <div className="total-saved">
          <span>Total Saved in Goals</span>
          <h2>1,135,000 <span>ETB</span></h2>
        </div>
        <button className="add-goal-btn">
          <Plus size={20} />
          New Goal
        </button>
      </div>

      <div className="goals-list">
        {goals.map((goal, i) => {
          const percent = (goal.current / goal.target) * 100;
          return (
            <motion.div 
              key={goal.id} 
              className="goal-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="goal-top">
                <div className="goal-icon" style={{ background: `${goal.color}20`, color: goal.color }}>
                  <goal.icon size={20} />
                </div>
                <div className="goal-info">
                  <h3>{goal.name}</h3>
                  <span>{percent.toFixed(1)}% Completed</span>
                </div>
              </div>
              
              <div className="goal-progress">
                <div className="gp-bar">
                  <div className="gp-fill" style={{ width: `${percent}%`, background: goal.color }} />
                </div>
                <div className="gp-labels">
                  <span>{goal.current.toLocaleString()} ETB</span>
                  <span>{goal.target.toLocaleString()} ETB</span>
                </div>
              </div>

              <div className="goal-actions">
                <button className="g-action-btn">Deposit</button>
                <button className="g-action-btn secondary">Withdraw</button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
