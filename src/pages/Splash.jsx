import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './Splash.css';

export default function Splash() {
  const navigate = useNavigate();
  const setSplashSeen = useStore((s) => s.setSplashSeen);
  const t = useTranslation();

  const onboardingSlides = [
    { emoji: '💳', titleKey: 'splash.s1title', descKey: 'splash.s1desc' },
    { emoji: '🔐', titleKey: 'splash.s2title', descKey: 'splash.s2desc' },
    { emoji: '⚖️', titleKey: 'splash.s3title', descKey: 'splash.s3desc' },
    { emoji: '🌍', titleKey: 'splash.s4title', descKey: 'splash.s4desc' },
  ];

  const [phase, setPhase] = useState('logo'); // logo → onboarding → done
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => setPhase('onboarding'), 2800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const handleComplete = () => {
    setSplashSeen();
    navigate('/', { replace: true });
  };

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <div className="splash-container">
      <AnimatePresence mode="wait">
        {phase === 'logo' && (
          <motion.div
            key="logo"
            className="splash-logo-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated rings */}
            <div className="splash-rings">
              <motion.div
                className="splash-ring r1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, type: 'spring' }}
              />
              <motion.div
                className="splash-ring r2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
              />
              <motion.div
                className="splash-ring r3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
              />
            </div>

            {/* Abyssinia Bank White-Labeling */}
            <motion.div
              className="splash-bank-branding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{
                position: 'absolute',
                bottom: 60,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Powered by
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#eab308' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" style={{ padding: '4px' }}>
                     <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#eab308', letterSpacing: '1px' }}>
                  Abyssinia Bank
                </span>
              </div>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              className="splash-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <motion.div
                className="splash-loader-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.5, duration: 1.2, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        )}

        {phase === 'onboarding' && (
          <motion.div
            key="onboarding"
            className="onboarding-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <button className="skip-btn" onClick={handleComplete}>{t('splash.skip')}</button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="onboarding-slide"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="slide-visual">
                  <span className="slide-emoji">{onboardingSlides[currentSlide].emoji}</span>
                </div>
                <h2 className="slide-title">{t(onboardingSlides[currentSlide].titleKey)}</h2>
                <p className="slide-desc">{t(onboardingSlides[currentSlide].descKey)}</p>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="onboarding-dots">
              {onboardingSlides.map((_, i) => (
                <motion.div
                  key={i}
                  className={`ob-dot ${i === currentSlide ? 'active' : ''}`}
                  animate={{ width: i === currentSlide ? 28 : 8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              ))}
            </div>

            <motion.button
              className="onboarding-next-btn"
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
            >
              <span>{currentSlide === onboardingSlides.length - 1 ? t('splash.getStarted') : t('splash.next')}</span>
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
