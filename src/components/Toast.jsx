import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import './Toast.css';

let globalShowToast = null;

/**
 * Call showToast('message', 'success'|'info'|'error') from anywhere.
 */
export function showToast(message, type = 'success') {
  if (globalShowToast) globalShowToast(message, type);
}

const icons = { success: Check, error: AlertCircle, info: Info };

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'error' ? [50, 50, 50] : 15);
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    globalShowToast = addToast;
    return () => { globalShowToast = null; };
  }, [addToast]);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type] || Check;
          return (
            <motion.div
              key={t.id}
              className={`toast-item ${t.type}`}
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="toast-icon">
                <Icon size={16} />
              </div>
              <span>{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
