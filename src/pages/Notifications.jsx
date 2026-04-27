import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Settings, ArrowDownLeft, ArrowUpRight, Shield, Zap, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import './Notifications.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const icons = {
  transaction: ArrowDownLeft,
  transfer: ArrowUpRight,
  security: Shield,
  bill: Zap,
  vault: FileText,
  system: Bell
};

const colors = {
  transaction: '#10B981',
  transfer: '#EF4444',
  security: '#3B82F6',
  bill: '#F59E0B',
  vault: '#FFC321',
  system: '#8B5CF6'
};

export default function Notifications() {
  const navigate = useNavigate();
  const t = useTranslation();
  const language = useStore(s => s.language);
  const notifications = useStore(s => s.notifications);
  const markRead = useStore(s => s.markRead);
  const markAllRead = useStore(s => s.markAllRead);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Optionally auto-mark all as read on mount, or leave it mapped to the button
  }, []);

  const filteredNotifs = notifications.filter(n => filter === 'all' ? true : !n.read);

  return (
    <motion.div className="notif-page" variants={container} initial="hidden" animate="show">
      <div className="notif-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="notif-title">{t('notif.title')}</h2>
        <motion.button className="settings-btn" whileTap={{ scale: 0.9 }} onClick={markAllRead}>
          <span style={{ fontSize: 12, color: 'var(--accent-gold)' }}>Mark All Read</span>
        </motion.button>
      </div>

      <div className="notif-filters">
        <button className={`notif-filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          {t('notif.all')}
        </button>
        <button className={`notif-filter ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
          {t('notif.unread')}
        </button>
      </div>

      <div className="notif-list">
        {filteredNotifs.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-muted)' }}>
             {t('notif.noUnread')}
          </div>
        ) : filteredNotifs.map((n) => {
          const Icon = icons[n.type] || Bell;
          const color = colors[n.type] || '#fff';
          const title = language === 'am' && n.titleAm ? n.titleAm : n.title;
          const desc = language === 'am' && n.descAm ? n.descAm : n.desc;

          return (
            <motion.div
              key={n.id}
              variants={item}
              className={`notif-item glass-panel ${!n.read ? 'unread' : ''}`}
              onClick={() => markRead(n.id)}
            >
              {!n.read && <div className="notif-unread-dot" />}
              <div className="notif-icon" style={{ background: `${color}18`, color: color }}>
                <Icon size={20} />
              </div>
              <div className="notif-content">
                <h4 className="notif-item-title">{title}</h4>
                <p className="notif-item-desc">{desc}</p>
                <span className="notif-item-time">{n.time}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
