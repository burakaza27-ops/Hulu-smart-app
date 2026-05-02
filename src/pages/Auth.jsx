import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Mail, Lock, Phone, Fingerprint, ArrowLeft } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './Auth.css';

function AdeyAbebaLogo({ size = 80, color = '#FFC321', className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none">
      <g transform="translate(50,50)">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse key={angle} cx="0" cy="-22" rx="12" ry="22" fill={color} transform={`rotate(${angle})`} />
        ))}
        <circle cx="0" cy="0" r="10" fill={color} />
        <circle cx="0" cy="0" r="6" fill="#0A0A0B" />
        <circle cx="0" cy="0" r="3" fill={color} />
      </g>
    </svg>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const t = useTranslation();
  const setAuthenticated = useStore((s) => s.setAuthenticated);
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock authentication
    setTimeout(() => {
      setAuthenticated(true);
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  const handleBiometric = () => {
    setIsLoading(true);
    setTimeout(() => {
      setAuthenticated(true);
      setIsLoading(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="auth-container">
      {/* Background Video/Image Mock */}
      <div className="auth-background">
        <div className="auth-gradient-overlay" />
        <div className="auth-animated-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
        </div>
      </div>

      <div className="auth-content">
        <motion.div 
          className="auth-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AdeyAbebaLogo size={48} />
          <h2>ABYSSINIA</h2>
        </motion.div>

        <motion.div 
          className="auth-card glass-panel"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
        >
          <div className="auth-tabs">
            <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>Sign In</button>
            <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>Register</button>
            <div className="tab-indicator" style={{ transform: `translateX(${isLogin ? '0%' : '100%'})` }} />
          </div>

          <div className="auth-methods">
            <button className={authMethod === 'email' ? 'active' : ''} onClick={() => setAuthMethod('email')}>Email</button>
            <button className={authMethod === 'phone' ? 'active' : ''} onClick={() => setAuthMethod('phone')}>Phone</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <AnimatePresence mode="wait">
              {authMethod === 'email' ? (
                <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="input-group">
                    <Mail size={18} className="input-icon" />
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="input-group">
                    <Phone size={18} className="input-icon" />
                    <span className="phone-prefix">+251</span>
                    <input type="tel" placeholder="911 234 567" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(isLogin || authMethod === 'email') && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="input-group">
                    <Lock size={18} className="input-icon" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isLogin && <div className="forgot-password">Forgot Password?</div>}

            <motion.button 
              type="submit" 
              className="auth-submit-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>

          {isLogin && (
            <div className="biometric-section">
              <div className="divider"><span>OR</span></div>
              <motion.button 
                className="biometric-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBiometric}
                type="button"
              >
                <Fingerprint size={28} />
                <span>Use Biometrics</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        <motion.p 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Secure Banking by Bank of Abyssinia
        </motion.p>
      </div>
    </div>
  );
}
