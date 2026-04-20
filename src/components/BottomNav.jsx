import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Shield, Scale, Globe, GitBranch } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import './BottomNav.css';

const tabs = [
  { id: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { id: '/vault', icon: Shield, labelKey: 'nav.vault' },
  { id: '/legal', icon: Scale, labelKey: 'nav.legal' },
  { id: '/diaspora', icon: Globe, labelKey: 'nav.diaspora' },
  { id: '/inheritance', icon: GitBranch, labelKey: 'nav.inherit' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const t = useTranslation();

  // Hide bottom nav on certain pages
  const hiddenPaths = ['/splash'];
  if (hiddenPaths.includes(location.pathname)) return null;

  return (
    <nav className="bottom-nav glass-panel">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.id;
        const Icon = tab.icon;
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
            </div>
            <span className="nav-label">{t(tab.labelKey)}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
