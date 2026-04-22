import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ScanFace, ShieldCheck, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import useTranslation from '../hooks/useTranslation';
import './BiometricPrompt.css';

/**
 * Reusable biometric verification overlay.
 * Props:
 *   open      – boolean controlling visibility
 *   onVerified – callback fired after successful scan
 *   onCancel   – callback to dismiss without verifying
 *   mode       – 'fingerprint' | 'face' (default: 'fingerprint')
 */
export default function BiometricPrompt({ open, onVerified, onCancel, mode = 'fingerprint' }) {
  const t = useTranslation();
  const [phase, setPhase] = useState('idle'); // idle → scanning → verified | failed
  const [failCount, setFailCount] = useState(0);
  const [lockoutSecs, setLockoutSecs] = useState(0);

  useEffect(() => {
    if (open) { setPhase('idle'); }
  }, [open]);

  // Lockout countdown
  useEffect(() => {
    if (lockoutSecs <= 0) return;
    const timer = setInterval(() => {
      setLockoutSecs(prev => {
        if (prev <= 1) { setFailCount(0); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSecs]);

  const startScan = () => {
    if (lockoutSecs > 0) return;
    setPhase('scanning');
    setTimeout(() => {
      // Simulate ~15% failure rate for realism
      const shouldFail = failCount < 2 ? false : Math.random() < 0.15;
      if (shouldFail) {
        setPhase('failed');
        const newCount = failCount + 1;
        setFailCount(newCount);
        if (newCount >= 3) {
          setLockoutSecs(30);
        }
        setTimeout(() => setPhase('idle'), 1500);
      } else {
        setPhase('verified');
        setTimeout(() => {
          setFailCount(0);
          onVerified?.();
        }, 900);
      }
    }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="bio-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            className="bio-sheet glass-panel"
            initial={{ y: '100%', x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: '100%', x: '-50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="sheet-handle" />
            <button className="bio-close" onClick={onCancel}>
              <X size={20} />
            </button>

            <h3 className="bio-title">{t('bio.title')}</h3>

            {/* Visual */}
            <div className="bio-visual">
              {phase === 'verified' ? (
                <motion.div
                  className="bio-icon-ring verified"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <ShieldCheck size={52} />
                </motion.div>
              ) : (
                <motion.div
                  className={`bio-icon-ring ${phase === 'scanning' ? 'scanning' : ''}`}
                  animate={
                    phase === 'scanning'
                      ? { boxShadow: ['0 0 0 0 rgba(212,175,55,0.4)', '0 0 0 24px rgba(212,175,55,0)', '0 0 0 0 rgba(212,175,55,0.4)'] }
                      : {}
                  }
                  transition={phase === 'scanning' ? { duration: 1.5, repeat: Infinity } : {}}
                >
                  {mode === 'face' ? (
                    <ScanFace size={52} className={phase === 'scanning' ? 'scan-pulse' : ''} />
                  ) : (
                    <Fingerprint size={52} className={phase === 'scanning' ? 'scan-pulse' : ''} />
                  )}
                </motion.div>
              )}
            </div>

            {/* Status Text */}
            <p className="bio-status">
              {phase === 'idle' && lockoutSecs > 0 && `Too many attempts. Retry in ${lockoutSecs}s`}
              {phase === 'idle' && lockoutSecs === 0 && t('bio.placeFingerprint')}
              {phase === 'scanning' && t('bio.verifying')}
              {phase === 'verified' && t('bio.verified')}
              {phase === 'failed' && 'Verification failed — try again'}
            </p>

            {/* Progress Bar during scanning */}
            {phase === 'scanning' && (
              <div className="bio-progress">
                <motion.div
                  className="bio-progress-fill"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                />
              </div>
            )}

            {/* Action */}
            {phase === 'idle' && (
              <motion.button
                className="btn-primary bio-scan-btn"
                whileTap={{ scale: 0.95 }}
                onClick={startScan}
              >
                <Fingerprint size={20} />
                <span>{mode === 'face' ? 'Scan Face' : t('bio.title')}</span>
              </motion.button>
            )}

            {phase === 'idle' && (
              <button className="bio-cancel-btn" onClick={onCancel}>
                {t('bio.cancel')}
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
