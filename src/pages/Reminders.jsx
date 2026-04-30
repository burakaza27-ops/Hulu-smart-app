import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Bell, Calendar, Clock, Trash2, CheckCircle2,
  AlertTriangle, BellRing, Briefcase, Heart, GraduationCap,
  Users, Banknote, CircleDot, X
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import useStore from '../store/useStore';
import './Reminders.css';

const CATEGORIES = [
  { key: 'meeting', icon: Users, color: '#3B82F6' },
  { key: 'payment', icon: Banknote, color: '#10B981' },
  { key: 'health', icon: Heart, color: '#EF4444' },
  { key: 'work', icon: Briefcase, color: '#F59E0B' },
  { key: 'study', icon: GraduationCap, color: '#8B5CF6' },
  { key: 'other', icon: CircleDot, color: '#6B7280' },
];

const categoryLabels = {
  meeting: { en: 'Meeting', am: 'ስብሰባ' },
  payment: { en: 'Payment', am: 'ክፍያ' },
  health: { en: 'Health', am: 'ጤና' },
  work: { en: 'Work', am: 'ሥራ' },
  study: { en: 'Study', am: 'ትምህርት' },
  other: { en: 'Other', am: 'ሌላ' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

function getTimeStatus(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;
  if (diff < 0) return 'overdue';
  if (diff < 3600000) return 'soon'; // within 1 hour
  return 'upcoming';
}

function formatReminderDate(dateStr, lang) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const time = d.toLocaleTimeString(lang === 'am' ? 'am-ET' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  if (isToday) return { date: lang === 'am' ? 'ዛሬ' : 'Today', time };
  if (isTomorrow) return { date: lang === 'am' ? 'ነገ' : 'Tomorrow', time };
  return {
    date: d.toLocaleDateString(lang === 'am' ? 'am-ET' : 'en-US', { month: 'short', day: 'numeric' }),
    time
  };
}

export default function Reminders() {
  const navigate = useNavigate();
  const t = useTranslation();
  const language = useStore(s => s.language);
  const reminders = useStore(s => s.reminders) || [];
  const addReminder = useStore(s => s.addReminder);
  const deleteReminder = useStore(s => s.deleteReminder);
  const toggleReminderDone = useStore(s => s.toggleReminderDone);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [notifPermission, setNotifPermission] = useState('default');

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    priority: 'medium',
    category: 'other',
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new Notification('Abyssinia Reminders', {
          body: language === 'am' ? 'ማሳወቂያዎች ነቅተዋል!' : 'Notifications enabled!',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
        });
      }
    }
  }, [language]);

  const handleSave = () => {
    if (!form.title.trim() || !form.date || !form.time) return;

    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();

    addReminder({
      title: form.title.trim(),
      description: form.description.trim(),
      scheduledAt,
      priority: form.priority,
      category: form.category,
      done: false,
    });

    // Schedule notification
    scheduleNotification(form.title.trim(), form.description.trim(), scheduledAt);

    setForm({ title: '', description: '', date: '', time: '', priority: 'medium', category: 'other' });
    setShowModal(false);
  };

  const scheduleNotification = (title, body, scheduledAt) => {
    if (notifPermission !== 'granted') return;
    const delay = new Date(scheduledAt) - new Date();
    if (delay <= 0) return;

    // Use setTimeout for near-term reminders (< 24 hours)
    // The Service Worker handles long-term ones
    if (delay < 86400000) {
      setTimeout(() => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: `🔔 ${title}`,
            body: body || (language === 'am' ? 'ማስታወሻ ጊዜ ደርሷል!' : 'Reminder time has arrived!'),
            tag: `reminder-${Date.now()}`,
          });
        } else {
          new Notification(`🔔 ${title}`, {
            body: body || 'Reminder time has arrived!',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            vibrate: [200, 100, 200],
          });
        }
      }, delay);
    }
  };

  // Re-schedule all active reminders on mount
  useEffect(() => {
    reminders.filter(r => !r.done).forEach(r => {
      scheduleNotification(r.title, r.description, r.scheduledAt);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const now = new Date();
  const filteredReminders = reminders
    .filter(r => {
      if (filter === 'upcoming') return !r.done;
      if (filter === 'completed') return r.done;
      return true;
    })
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return new Date(a.scheduledAt) - new Date(b.scheduledAt);
    });

  const upcoming = reminders.filter(r => !r.done && new Date(r.scheduledAt) >= now).length;
  const overdue = reminders.filter(r => !r.done && new Date(r.scheduledAt) < now).length;
  const completed = reminders.filter(r => r.done).length;

  return (
    <motion.div className="reminders-page" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <div className="reminders-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </motion.button>
        <h2 className="reminders-title">{t('remind.title', language === 'am' ? 'ማስታወሻዎች' : 'Reminders')}</h2>
        <motion.button className="reminders-add-btn" whileTap={{ scale: 0.9 }} onClick={() => setShowModal(true)}>
          <Plus size={20} />
        </motion.button>
      </div>

      {/* Notification Permission */}
      {notifPermission === 'default' && (
        <motion.div variants={item} className="notif-permission-banner">
          <div className="perm-icon"><BellRing size={22} /></div>
          <div className="perm-text">
            <h4>{language === 'am' ? 'ማሳወቂያ ያንቁ' : 'Enable Notifications'}</h4>
            <p>{language === 'am' ? 'ማስታወሻ ጊዜ ሲደርስ ማሳወቂያ ያግኙ' : 'Get alerted when your reminder is due'}</p>
          </div>
          <motion.button className="perm-enable-btn" whileTap={{ scale: 0.95 }} onClick={requestPermission}>
            {language === 'am' ? 'ፍቀድ' : 'Enable'}
          </motion.button>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={item} className="reminder-stats">
        <div className="stat-chip glass-panel">
          <span className="stat-num" style={{ color: '#3B82F6' }}>{upcoming}</span>
          <span className="stat-label">{language === 'am' ? 'ቀጣይ' : 'Upcoming'}</span>
        </div>
        <div className="stat-chip glass-panel">
          <span className="stat-num" style={{ color: overdue > 0 ? '#EF4444' : 'var(--text-muted)' }}>{overdue}</span>
          <span className="stat-label">{language === 'am' ? 'ያለፉ' : 'Overdue'}</span>
        </div>
        <div className="stat-chip glass-panel">
          <span className="stat-num" style={{ color: '#10B981' }}>{completed}</span>
          <span className="stat-label">{language === 'am' ? 'ያለቁ' : 'Done'}</span>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="reminder-tabs">
        {['upcoming', 'completed', 'all'].map(f => (
          <button key={f} className={`reminder-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'upcoming' ? (language === 'am' ? 'ቀጣይ' : 'Upcoming') :
             f === 'completed' ? (language === 'am' ? 'ያለቁ' : 'Completed') :
             (language === 'am' ? 'ሁሉም' : 'All')}
          </button>
        ))}
      </div>

      {/* Reminder List */}
      {filteredReminders.length === 0 ? (
        <motion.div variants={item} className="reminders-empty">
          <div className="empty-icon">
            <Bell size={32} color="#FFC321" />
          </div>
          <h4>{language === 'am' ? 'ምንም ማስታወሻ የለም' : 'No Reminders Yet'}</h4>
          <p>{language === 'am' ? 'ስብሰባ፣ ክፍያ ወይም ማንኛውም ነገር ለማስታወስ ያክሉ' : 'Add reminders for meetings, payments, or anything you don\'t want to forget'}</p>
          <motion.button className="btn-primary" style={{ maxWidth: 220, margin: '0 auto' }}
            whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}>
            <Plus size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            {language === 'am' ? 'ማስታወሻ ጨምር' : 'Add Reminder'}
          </motion.button>
        </motion.div>
      ) : (
        filteredReminders.map((r) => {
          const cat = CATEGORIES.find(c => c.key === r.category) || CATEGORIES[5];
          const CatIcon = cat.icon;
          const status = getTimeStatus(r.scheduledAt);
          const { date, time } = formatReminderDate(r.scheduledAt, language);

          return (
            <motion.div
              key={r.id}
              variants={item}
              className={`reminder-card glass-panel priority-${r.priority} ${r.done ? 'completed' : ''}`}
              layout
            >
              <div className="reminder-icon-wrap" style={{ background: `${cat.color}18`, color: cat.color }}>
                <CatIcon size={22} />
              </div>
              <div className="reminder-body">
                <h4 className={r.done ? 'done' : ''}>{r.title}</h4>
                {r.description && <p className="reminder-desc">{r.description}</p>}
                <div className="reminder-meta">
                  <span className="meta-tag date-tag"><Calendar size={10} /> {date}</span>
                  <span className="meta-tag time-tag"><Clock size={10} /> {time}</span>
                  {!r.done && status === 'overdue' && (
                    <span className="meta-tag overdue-tag"><AlertTriangle size={10} /> {language === 'am' ? 'ያለፈ' : 'Overdue'}</span>
                  )}
                  {!r.done && status === 'soon' && (
                    <span className="meta-tag soon-tag"><BellRing size={10} /> {language === 'am' ? 'ቅርብ' : 'Soon'}</span>
                  )}
                </div>
              </div>
              <div className="reminder-actions">
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleReminderDone(r.id)}
                  title={r.done ? 'Undo' : 'Mark done'}>
                  <CheckCircle2 size={16} style={{ color: r.done ? '#10B981' : undefined }} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.85 }} onClick={() => deleteReminder(r.id)}
                  title="Delete">
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          );
        })
      )}

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="reminder-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="reminder-modal"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}>

              <div className="modal-handle" />
              <h3 className="modal-title">
                {language === 'am' ? '✨ አዲስ ማስታወሻ' : '✨ New Reminder'}
              </h3>

              <div className="form-group">
                <label className="form-label">{language === 'am' ? 'ርዕስ' : 'Title'}</label>
                <input className="form-input" placeholder={language === 'am' ? 'ለምሳሌ: ከዶ/ር ጋር ስብሰባ' : 'e.g. Meeting with Dr. Abebe'}
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'am' ? 'ዝርዝር' : 'Description'}</label>
                <textarea className="form-input" placeholder={language === 'am' ? 'ተጨማሪ ማስታወሻ...' : 'Optional details...'}
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'am' ? 'ቀን እና ሰዓት' : 'Date & Time'}</label>
                <div className="datetime-row">
                  <input type="date" className="form-input-datetime"
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                  <input type="time" className="form-input-datetime"
                    value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'am' ? 'ቅድሚያ' : 'Priority'}</label>
                <div className="priority-selector">
                  {['high', 'medium', 'low'].map(p => (
                    <button key={p} className={`priority-btn ${p} ${form.priority === p ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, priority: p })}>
                      {p === 'high' ? (language === 'am' ? 'ከፍተኛ' : 'High') :
                       p === 'medium' ? (language === 'am' ? 'መካከለኛ' : 'Medium') :
                       (language === 'am' ? 'ዝቅተኛ' : 'Low')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'am' ? 'ምድብ' : 'Category'}</label>
                <div className="category-selector">
                  {CATEGORIES.map(c => (
                    <button key={c.key} className={`category-chip ${form.category === c.key ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, category: c.key })}>
                      {categoryLabels[c.key]?.[language] || categoryLabels[c.key]?.en || c.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <motion.button className="btn-cancel" whileTap={{ scale: 0.97 }} onClick={() => setShowModal(false)}>
                  {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                </motion.button>
                <motion.button className="btn-save" whileTap={{ scale: 0.97 }} onClick={handleSave}
                  style={{ opacity: (!form.title.trim() || !form.date || !form.time) ? 0.4 : 1 }}>
                  <Bell size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  {language === 'am' ? 'ማስታወሻ ቅመጥ' : 'Save Reminder'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
