import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Shield, Scale, Globe, GitBranch, Bell } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import './BottomNav.css';

const tabs = [
  { id: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { id: '/vault', icon: Shield, labelKey: 'nav.vault' },
  { id: '/reminders', icon: Bell, labelKey: 'nav.reminders' },
  { id: '/legal', icon: Scale, labelKey: 'nav.legal' },
  { id: '/inheritance', icon: GitBranch, labelKey: 'nav.inherit' },
  { id: '/diaspora', icon: Globe, labelKey: 'nav.diaspora' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();
  const reminders = useStore(s => s.reminders) || [];
  const pendingCount = reminders.filter(r => !r.done && new Date(r.scheduledAt) < new Date()).length;

  // Hide bottom nav on certain pages
  const hiddenPaths = ['/splash', '/auth', '/hotels', '/flights', '/equb', '/marketplace', '/savings-goals', '/rewards'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="bottom-nav glass-panel">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.id;
        const Icon = tab.icon;
        const showBadge = tab.id === '/reminders' && pendingCount > 0;
        return (
          <motion.button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.id)}
            whileTap={{ scale: 0.85 }}
          >
            <div className="nav-icon-wrap">
              {isActive && (
                <motion.div
                  className="nav-active-bg"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {showBadge && (
                <span style={{
                  position: 'absolute', top: -2, right: -4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#EF4444', border: '2px solid var(--bg-primary)',
                }} />
              )}
            </div>
            <span className="nav-label">{t(tab.labelKey)}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
