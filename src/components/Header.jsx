import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import LanguageToggle from './LanguageToggle';
import './Header.css';

export default function Header({ title, subtitle, showAvatar = true }) {
  const navigate = useNavigate();
  const notifications = useStore((s) => s.notifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header
      className="app-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="header-left">
        {showAvatar && (
          <motion.div
            className="avatar-ring"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar">
              <span>KB</span>
            </div>
            <div className="avatar-status" />
          </motion.div>
        )}
        <div className="header-text">
          <h1 className="header-title">{title || 'Good Morning'}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="header-actions">
        <LanguageToggle />
        <motion.button
          className="btn-icon header-btn"
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/notifications')}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
