import { motion } from 'framer-motion';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import './CurrencyConverter.css';

// Fallback rates if API fails
const fallbackRates = {
  USD: { rate: 56.85, flag: '🇺🇸', name: 'US Dollar' },
  EUR: { rate: 62.10, flag: '🇪🇺', name: 'Euro' },
  GBP: { rate: 71.40, flag: '🇬🇧', name: 'British Pound' },
  SAR: { rate: 15.16, flag: '🇸🇦', name: 'Saudi Riyal' },
  AED: { rate: 15.48, flag: '🇦🇪', name: 'UAE Dirham' },
  CAD: { rate: 41.80, flag: '🇨🇦', name: 'Canadian Dollar' },
};

const currencyMeta = {
  USD: { flag: '🇺🇸', name: 'US Dollar' },
  EUR: { flag: '🇪🇺', name: 'Euro' },
  GBP: { flag: '🇬🇧', name: 'British Pound' },
  SAR: { flag: '🇸🇦', name: 'Saudi Riyal' },
  AED: { flag: '🇦🇪', name: 'UAE Dirham' },
  CAD: { flag: '🇨🇦', name: 'Canadian Dollar' },
};

const CACHE_KEY = 'boa-fx-rates';
const CACHE_DURATION = 3600000; // 1 hour

function getCachedRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.ts < CACHE_DURATION) return cached.rates;
  } catch { /* noop */ }
  return null;
}

function setCachedRates(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, ts: Date.now() }));
  } catch { /* noop */ }
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('USD');
  const [direction, setDirection] = useState('toETB');
  const [rates, setRates] = useState(() => {
    // Try cache first, then fallback
    const cached = getCachedRates();
    return cached || fallbackRates;
  });
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/ETB');
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const etbRates = data.rates;
      // API gives ETB→X, we need X→ETB (inverse)
      const newRates = {};
      for (const code of Object.keys(currencyMeta)) {
        if (etbRates[code]) {
          newRates[code] = {
            ...currencyMeta[code],
            rate: parseFloat((1 / etbRates[code]).toFixed(2)),
          };
        }
      }
      if (Object.keys(newRates).length > 0) {
        setRates(newRates);
        setCachedRates(newRates);
        setIsLive(true);
      }
    } catch {
      // Keep fallback rates
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getCachedRates();
    if (cached) {
      setRates(cached);
      setIsLive(true);
    } else {
      fetchRates();
    }
  }, []);

  const result = useMemo(() => {
    const num = parseFloat(amount) || 0;
    const r = rates[currency]?.rate || 1;
    if (direction === 'toETB') return (num * r).toFixed(2);
    return (num / r).toFixed(2);
  }, [amount, currency, direction, rates]);

  return (
    <div className="converter-widget">
      <div className="conv-input-row">
        <div className="conv-field glass-panel">
          <span className="conv-flag">{direction === 'toETB' ? rates[currency]?.flag || '💱' : '🇪🇹'}</span>
          <input
            type="number"
            className="conv-input"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
          />
          <span className="conv-code">{direction === 'toETB' ? currency : 'ETB'}</span>
        </div>

        <motion.button
          className="conv-swap-btn"
          whileTap={{ scale: 0.85, rotate: 180 }}
          onClick={() => setDirection(d => d === 'toETB' ? 'fromETB' : 'toETB')}
        >
          <ArrowDownUp size={18} />
        </motion.button>

        <div className="conv-field result glass-panel">
          <span className="conv-flag">{direction === 'toETB' ? '🇪🇹' : rates[currency]?.flag || '💱'}</span>
          <span className="conv-result">{parseFloat(result).toLocaleString()}</span>
          <span className="conv-code">{direction === 'toETB' ? 'ETB' : currency}</span>
        </div>
      </div>

      <div className="conv-currencies">
        {Object.entries(rates).map(([code, { flag }]) => (
          <motion.button
            key={code}
            className={`conv-chip ${currency === code ? 'active' : ''}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrency(code)}
          >
            <span>{flag}</span>
            <span>{code}</span>
          </motion.button>
        ))}
      </div>

      <div className="conv-rate-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span>1 {currency} = {rates[currency]?.rate?.toFixed(2) || '—'} ETB</span>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: isLive ? '#10B98120' : '#F59E0B20', color: isLive ? '#10B981' : '#F59E0B' }}>
          {isLive ? '● Live' : '○ Offline'}
        </span>
        <motion.button
          onClick={fetchRates}
          whileTap={{ scale: 0.8, rotate: 360 }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
          disabled={loading}
        >
          <RefreshCw size={12} className={loading ? 'spinning' : ''} />
        </motion.button>
      </div>
    </div>
  );
}
