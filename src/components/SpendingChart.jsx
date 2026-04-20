import { motion } from 'framer-motion';
import { useState } from 'react';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import './SpendingChart.css';

function DonutSegment({ startAngle, endAngle, color, delay }) {
  const r = 80;
  const cx = 100, cy = 100;
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

  return (
    <motion.path
      d={d}
      fill={color}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring', stiffness: 200 }}
      style={{ transformOrigin: '100px 100px' }}
    />
  );
}

export default function SpendingChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const t = useTranslation();
  const transactions = useStore(s => s.transactions);

  // Dynamically compute spending categories from actual transactions
  const categoryMap = {
    bill: { label: t('dash.catBills', 'Bills'), color: '#F59E0B', icon: '⚡' },
    transfer: { label: t('dash.catTransfers', 'Transfers'), color: '#EF4444', icon: '↗' },
    topup: { label: t('dash.catTopUp', 'Top Up'), color: '#8B5CF6', icon: '📱' },
    atm: { label: t('dash.catAtm', 'ATM'), color: '#10B981', icon: '🏧' },
  };

  const spending = {};
  transactions.forEach(tx => {
    if (tx.amount >= 0) return; // skip income
    const cat = categoryMap[tx.type] || { label: t('dash.catOther', 'Other'), color: '#3B82F6', icon: '•••' };
    const key = tx.type || 'other';
    if (!spending[key]) spending[key] = { ...cat, amount: 0 };
    spending[key].amount += Math.abs(tx.amount);
  });

  const categories = Object.values(spending);
  // If no spending data, show placeholder
  if (categories.length === 0) {
    categories.push(
      { label: t('dash.catBills', 'Bills'), amount: 14200, color: '#F59E0B', icon: '⚡' },
      { label: t('dash.catTransfers', 'Transfers'), amount: 23500, color: '#EF4444', icon: '↗' },
    );
  }

  const total = categories.reduce((s, c) => s + c.amount, 0);

  let angle = 0;
  const segments = categories.map((cat, i) => {
    const sweep = total > 0 ? (cat.amount / total) * 360 : 0;
    const seg = { startAngle: angle, endAngle: angle + sweep, color: cat.color, delay: 0.1 + i * 0.08 };
    angle += sweep;
    return seg;
  });

  return (
    <div className="spending-chart">
      <div className="chart-row">
        <div className="donut-wrap">
          <svg viewBox="0 0 200 200" width="140" height="140">
            {segments.map((seg, i) => (
              <DonutSegment key={i} {...seg} />
            ))}
            <circle cx="100" cy="100" r="52" fill="var(--bg-primary)" />
          </svg>
          <div className="donut-center-label">
            <motion.span className="dcl-amount" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              {total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total.toFixed(0)}
            </motion.span>
            <span className="dcl-unit">ETB</span>
          </div>
        </div>

        <div className="chart-legend">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              className={`legend-item ${hoveredIdx === i ? 'active' : ''}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="legend-dot" style={{ background: cat.color }} />
              <span className="legend-label">{cat.icon} {cat.label}</span>
              <span className="legend-amount">{cat.amount >= 1000 ? `${(cat.amount / 1000).toFixed(1)}K` : cat.amount.toFixed(0)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
