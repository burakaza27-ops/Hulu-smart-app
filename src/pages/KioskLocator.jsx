import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, Clock, ShieldCheck, Star, Zap, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';
import { showToast } from '../components/Toast';
import './KioskLocator.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const kiosks = [
  { id: 1, name: 'Bole Medhanealem Hub', distance: '0.8 km', status: 'online', time: 'Open 24/7', rating: 4.8, lat: 9.0054, lng: 38.7636, features: ['Biometrics', 'Fast Cash', 'Bills'] },
  { id: 2, name: 'Edna Mall Smart Kiosk', distance: '1.2 km', status: 'online', time: 'Open 24/7', rating: 4.5, lat: 9.0127, lng: 38.7615, features: ['Biometrics', 'Fast Cash'] },
  { id: 3, name: 'Megenagna Branch ATM', distance: '2.1 km', status: 'online', time: 'Open 24/7', rating: 4.6, lat: 9.0215, lng: 38.7725, features: ['Fast Cash', 'Deposits'] },
  { id: 4, name: 'CMC Service Center', distance: '3.0 km', status: 'online', time: '7:00 AM – 10:00 PM', rating: 4.3, lat: 9.0335, lng: 38.7835, features: ['Biometrics', 'Bills', 'Documents'] },
  { id: 5, name: 'Stadium Service Center', distance: '3.5 km', status: 'offline', time: 'Opens at 8:00 AM', rating: 4.2, lat: 9.0195, lng: 38.7535, features: ['Bills'] },
  { id: 6, name: 'Mexico Square Kiosk', distance: '4.2 km', status: 'online', time: 'Open 24/7', rating: 4.1, lat: 9.0105, lng: 38.7425, features: ['Fast Cash'] },
];

export default function KioskLocator() {
  const navigate = useNavigate();
  const t = useTranslation();

  return (
    <motion.div className="kiosk-page" variants={container} initial="hidden" animate="show">
      <div className="kiosk-header">
        <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => navigate('/profile')}>
          <ArrowLeft size={22} />
        </motion.button>
        <h2 className="kiosk-title">{t('kiosk.title')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <motion.div variants={item} className="kiosk-map-area">
        {/* Decorative Map Background */}
        <div className="map-bg">
          <div className="map-grid" />
          <motion.div
            className="user-dot"
            animate={{ boxShadow: ['0 0 0 0 rgba(212,175,55,0.4)', '0 0 0 20px rgba(212,175,55,0)', '0 0 0 0 rgba(212,175,55,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="kiosk-pin p1"><MapPin size={24} color="#10B981" fill="#10B981" /></div>
          <div className="kiosk-pin p2"><MapPin size={24} color="#10B981" fill="#10B981" /></div>
          <div className="kiosk-pin p3"><MapPin size={24} color="#EF4444" fill="#EF4444" /></div>
        </div>
        
        <div className="map-overlay glass-panel">
          <MapPin size={16} color="var(--accent-gold)" />
          <span>{t('kiosk.yourLocation')}</span>
        </div>
      </motion.div>

      <motion.div variants={item} className="kiosk-list-section">
        <div className="section-header">
          <span className="caption">{t('kiosk.nearbyHubs')}</span>
        </div>

        <div className="kiosk-list">
          {kiosks.map((k, i) => (
            <motion.div key={k.id} className="kiosk-card glass-panel" whileTap={{ scale: 0.98 }}>
              <div className="kiosk-card-header">
                <h4>{k.name}</h4>
                <div className={`kiosk-status ${k.status}`}>
                  {k.status === 'online' ? t('kiosk.online') : t('kiosk.offline')}
                </div>
              </div>
              
              <div className="kiosk-details">
                <div className="kd-item">
                  <Navigation size={14} color="var(--text-muted)" />
                  <span>{k.distance}</span>
                </div>
                <div className="kd-item">
                  <Clock size={14} color="var(--text-muted)" />
                  <span>{k.time}</span>
                </div>
                <div className="kd-item">
                  <Star size={14} color="var(--accent-gold)" fill="var(--accent-gold)" />
                  <span>{k.rating}</span>
                </div>
              </div>

              <div className="kiosk-features">
                {k.features?.map((f, fi) => (
                  <span key={fi} className="kf-badge"><ShieldCheck size={12} /> {f}</span>
                ))}
              </div>

              <motion.button
                className="btn-primary direct-btn"
                whileTap={{ scale: 0.95 }}
                disabled={k.status === 'offline'}
                onClick={() => {
                  if (k.status === 'offline') return;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${k.lat},${k.lng}`, '_blank');
                  showToast(`Opening directions to ${k.name}`, 'info');
                }}
              >
                <Navigation size={14} /> Get Directions
              </motion.button>
              {k.status === 'online' && (
                <motion.button
                  className="btn-secondary direct-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/atm-withdraw')}
                  style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Banknote size={16} />
                  Withdraw Here
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
