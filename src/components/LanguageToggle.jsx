import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import useStore from '../store/useStore';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const language = useStore((s) => s.language);
  const toggleLanguage = useStore((s) => s.toggleLanguage);

  return (
    <motion.button
      className="lang-toggle-btn"
      whileTap={{ scale: 0.85 }}
      onClick={toggleLanguage}
      title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
    >
      <span className="lang-code">{language === 'en' ? 'አማ' : 'EN'}</span>
    </motion.button>
  );
}
