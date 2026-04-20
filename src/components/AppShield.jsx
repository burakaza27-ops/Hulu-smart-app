import { motion, AnimatePresence } from 'framer-motion';
import { ShieldOff, Fingerprint, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import BiometricPrompt from './BiometricPrompt';
import './AppShield.css';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function AppShield({ children }) {
  const [locked, setLocked] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLocked(true);
    }, TIMEOUT_MS);
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => {
      if (!locked) resetTimer();
    };
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimer();

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [locked, resetTimer]);

  const handleUnlock = () => {
    setShowBio(true);
  };

  const handleVerified = () => {
    setShowBio(false);
    setLocked(false);
    resetTimer();
  };

  return (
    <>
      {children}

      {/* Network Status Banner */}
      <AnimatePresence>
        {!online && (
          <motion.div
            className="network-banner"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
          >
            <WifiOff size={14} />
            <span>You're offline — some features may be unavailable</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Lock Overlay */}
      <AnimatePresence>
        {locked && (
          <motion.div
            className="session-lock-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="lock-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            >
              <div className="lock-icon-ring">
                <ShieldOff size={36} />
              </div>
              <h2>Session Locked</h2>
              <p>Your session has been locked for security. Verify your identity to continue.</p>
              <motion.button
                className="btn-primary"
                whileTap={{ scale: 0.95 }}
                onClick={handleUnlock}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 24, maxWidth: 280 }}
              >
                <Fingerprint size={20} />
                Unlock with Biometrics
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BiometricPrompt
        open={showBio}
        onVerified={handleVerified}
        onCancel={() => setShowBio(false)}
      />
    </>
  );
}
