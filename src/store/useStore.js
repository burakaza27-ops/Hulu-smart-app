import { create } from 'zustand';
import { readPersistedSync, readPersistedAsync, writePersisted } from '../utils/crypto';

// Simple XSS sanitizer for user-facing text
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>'"&]/g, c => ({ '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' })[c]);
}

// Synchronous initial read (plain JSON compat), async encrypted read follows
const persisted = readPersistedSync('boa-state');

const useStore = create((set, get) => ({
  // ===== Hydration flag =====
  _hydrated: false,
  
  // ===== Auth =====
  isAuthenticated: persisted.isAuthenticated ?? false,
  setAuthenticated: (val) => {
    _persistEncrypted({ isAuthenticated: val });
    set({ isAuthenticated: val });
  },

  // ===== Balance & Accounts =====
  balance: persisted.balance ?? 128450.75,
  accounts: [
    { id: 1, bank: 'Abyssinia Bank', type: 'Savings', number: '****7842', balance: 128450.75, primary: true },
    { id: 2, bank: 'Abyssinia Bank', type: 'Current', number: '****3291', balance: 45200.00, primary: false },
  ],

  // ===== Transactions =====
  transactions: persisted.transactions ?? [
    { id: 1, title: 'Ethiopian Electric Utility', subtitle: 'Electricity Bill', amount: -450.00, type: 'bill', time: '2 min ago', refId: 'BOA-TX-928471' },
    { id: 2, title: 'Salary Deposit', subtitle: 'Abyssinia Bank', amount: 32500.00, type: 'income', time: '1 hr ago', refId: 'BOA-TX-928470' },
    { id: 3, title: 'Water & Sewerage', subtitle: 'Utility Payment', amount: -125.00, type: 'bill', time: '3 hrs ago', refId: 'BOA-TX-928469' },
    { id: 4, title: 'Ethio Telecom', subtitle: 'Mobile Recharge', amount: -200.00, type: 'bill', time: 'Yesterday', refId: 'BOA-TX-928468' },
    { id: 5, title: 'Transfer to Abebe', subtitle: 'Personal Transfer', amount: -5000.00, type: 'transfer', time: 'Yesterday', refId: 'BOA-TX-928467' },
  ],

  addTransaction: (tx) => {
    const newTx = {
      ...tx,
      title: sanitize(tx.title),
      subtitle: sanitize(tx.subtitle),
      refId: tx.refId || `BOA-TX-${Date.now().toString().slice(-6)}`,
      time: tx.time === 'Just now' ? Date.now() : (tx.time || Date.now()),
    };
    set((state) => {
      const newState = {
        transactions: [newTx, ...state.transactions],
        balance: state.balance + tx.amount,
      };
      _persistEncrypted({ balance: newState.balance, transactions: newState.transactions });
      return newState;
    });
  },

  // ===== Language (i18n) =====
  language: persisted.language ?? 'en',
  toggleLanguage: () => set((state) => {
    const langs = ['en', 'am', 'om', 'ti'];
    const nextIdx = (langs.indexOf(state.language) + 1) % langs.length;
    const lang = langs[nextIdx];
    _persistEncrypted({ language: lang });
    return { language: lang };
  }),
  setLanguage: (lang) => { _persistEncrypted({ language: lang }); set({ language: lang }); },

  // ===== Theme =====
  theme: persisted.theme ?? 'dark',
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    _persistEncrypted({ theme: nextTheme });
    return { theme: nextTheme };
  }),

  // ===== Notifications =====
  notifications: [
    { id: 1, type: 'transaction', title: 'Payment Received', titleAm: 'ክፍያ ደርሷል', desc: 'Salary deposit of 32,500 ETB from ABC Corp', descAm: 'ከABC Corp 32,500 ብር ደመወዝ ተቀማጭ', time: '2 min ago', read: false },
    { id: 2, type: 'security', title: 'Login from New Device', titleAm: 'ከአዲስ መሣሪያ መግቢያ', desc: 'Your account was accessed from Chrome on Windows', descAm: 'አካውንትዎ ከChrome በWindows ላይ ተደርሶበታል', time: '1 hr ago', read: false },
    { id: 3, type: 'bill', title: 'Electricity Bill Reminder', titleAm: 'የመብራት ክፍያ ማስታወሻ', desc: 'Your EEU meter balance is running low. Recharge now?', descAm: 'የEEU ቆጣሪ ቀሪ ሂሳብዎ እያለቀ ነው። አሁን ይሙሉ?', time: '3 hrs ago', read: false },
    { id: 4, type: 'vault', title: 'Document Verified', titleAm: 'ሰነድ ተረጋግጧል', desc: 'Your House Title Deed has been verified successfully', descAm: 'የቤት ካርታዎ በተሳካ ሁኔታ ተረጋግጧል', time: 'Yesterday', read: true },
    { id: 5, type: 'system', title: 'System Update', titleAm: 'የሲስተም ዝማኔ', desc: 'Abyssinia v1.1 is now available with enhanced AI Legal features', descAm: 'Abyssinia v1.1 በተሻሻለ AI Legal ባህሪ ተገኝቷል', time: 'Yesterday', read: true },
  ],
  addNotification: (n) => set((state) => ({
    notifications: [{ ...n, id: Date.now(), read: false }, ...state.notifications],
  })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
  })),
  markRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),
  unreadCount: () => get().notifications.filter(n => !n.read).length,

  // ===== Reminders =====
  reminders: persisted.reminders ?? [],
  addReminder: (r) => set((state) => {
    const newReminders = [{ ...r, id: Date.now(), createdAt: new Date().toISOString() }, ...state.reminders];
    _persistEncrypted({ reminders: newReminders });
    return { reminders: newReminders };
  }),
  deleteReminder: (id) => set((state) => {
    const newReminders = state.reminders.filter(r => r.id !== id);
    _persistEncrypted({ reminders: newReminders });
    return { reminders: newReminders };
  }),
  toggleReminderDone: (id) => set((state) => {
    const newReminders = state.reminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
    _persistEncrypted({ reminders: newReminders });
    return { reminders: newReminders };
  }),

  // ===== Splash seen =====
  splashSeen: persisted.splashSeen ?? false,
  setSplashSeen: () => { _persistEncrypted({ splashSeen: true }); set({ splashSeen: true }); },

  // ===== ATM Pending Code =====
  atmPendingCode: null,
  setAtmPendingCode: (code) => set({ atmPendingCode: code }),
  clearAtmPendingCode: () => set({ atmPendingCode: null }),
}));

// Encrypted persistence helper — writes async, fire-and-forget
async function _persistEncrypted(partial) {
  try {
    const existing = await readPersistedAsync('boa-state');
    await writePersisted({ ...existing, ...partial }, 'boa-state');
  } catch { /* noop */ }
}

// Async hydration — re-read encrypted data and merge into store
(async () => {
  try {
    const data = await readPersistedAsync('boa-state');
    if (data && Object.keys(data).length > 0) {
      useStore.setState({
        balance: data.balance ?? useStore.getState().balance,
        transactions: data.transactions ?? useStore.getState().transactions,
        language: data.language ?? useStore.getState().language,
        theme: data.theme ?? useStore.getState().theme,
        splashSeen: data.splashSeen ?? useStore.getState().splashSeen,
        reminders: data.reminders ?? useStore.getState().reminders,
        isAuthenticated: data.isAuthenticated ?? useStore.getState().isAuthenticated,
        _hydrated: true,
      });
    }
  } catch { /* noop */ }
})();

export default useStore;
