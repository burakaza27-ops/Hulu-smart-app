import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './Splash.css';

/* Adey Abeba (6-petal flower) — Bank of Abyssinia signature logo */
function AdeyAbebaLogo({ size = 80, color = '#FFC321', className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow */}
      <defs>
        <radialGradient id="petal-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor="#B8860B" stopOpacity="0.9" />
        </radialGradient>
        <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#logo-glow)" transform="translate(50,50)">
        {/* 6 petals */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-22"
            rx="12"
            ry="22"
            fill="url(#petal-grad)"
            transform={`rotate(${angle})`}
          />
        ))}
        {/* Center circle */}
        <circle cx="0" cy="0" r="10" fill={color} />
        <circle cx="0" cy="0" r="6" fill="#0A0A0B" />
        <circle cx="0" cy="0" r="3" fill={color} />
      </g>
    </svg>
  );
}

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

  const [phase, setPhase] = useState('logo');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (phase === 'logo') {
      const timer = setTimeout(() => setPhase('onboarding'), 3200);
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

            {/* Main Adey Abeba logo — animated entrance */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 1, type: 'spring', stiffness: 120, damping: 12 }}
              style={{ position: 'relative', zIndex: 2 }}
            >
              <AdeyAbebaLogo size={100} className="splash-flower-logo" />
            </motion.div>

            {/* Brand name */}
            <motion.div
              className="splash-brand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <h1 className="splash-brand-name">ABYSSINIA</h1>
              <p className="splash-brand-sub">BANK OF ABYSSINIA</p>
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="splash-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              Your Trusted Banking Partner Since 1996
            </motion.p>

            {/* Loading bar */}
            <motion.div
              className="splash-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              <motion.div
                className="splash-loader-fill"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.6, duration: 1.4, ease: 'easeInOut' }}
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
            {/* BoA small logo in top-left */}
            <div className="onboarding-top-bar">
              <div className="ob-top-logo">
                <AdeyAbebaLogo size={28} />
                <span className="ob-top-brand">Abyssinia</span>
              </div>
              <button className="skip-btn" onClick={handleComplete}>{t('splash.skip')}</button>
            </div>

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
