import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, CheckCircle, Download, Share2, Printer,
  ShieldCheck, Clock, AlertCircle
} from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './PaymentFlow.css';

/**
 * Payment processing pipeline:
 * Step 0 → Enter account & amount
 * Step 1 → Review & confirm
 * Step 2 → Processing (simulated backend)
 * Step 3 → Success + digital receipt
 * Step -1 → Error state
 */
export default function PaymentFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();
  const addTransaction = useStore((s) => s.addTransaction);
  const balance = useStore((s) => s.balance);

  const service = location.state?.service;
  if (!service) {
    // Fallback if navigated directly
    return (
      <div className="pf-container">
        <div className="pf-error-state">
          <AlertCircle size={48} color="#EF4444" />
          <h3>{t('pay.noService', 'No service selected')}</h3>
          <button className="pf-primary-btn" onClick={() => navigate('/service-hub')}>
            {t('pay.goBack', 'Go to Service Hub')}
          </button>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState(0);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const receiptRef = useRef(null);

  const refId = `ABY-${Date.now().toString().slice(-8)}`;
  const timestamp = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  /* ── Step 0 → 1: Validate inputs ────────── */
  const handleReview = () => {
    if (!accountNumber.trim()) {
      setErrorMsg(t('pay.errAccount', 'Please enter a valid account number'));
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMsg(t('pay.errAmount', 'Please enter a valid amount'));
      return;
    }
    if (Number(amount) > balance) {
      setErrorMsg(t('pay.errBalance', 'Insufficient balance'));
      return;
    }
    setErrorMsg('');
    setStep(1);
  };

  /* ── Step 1 → 2 → 3: Process payment ────── */
  const handleConfirm = async () => {
    setStep(2);

    // Simulate backend payment processing
    await new Promise((resolve) => setTimeout(resolve, 2200));

    // Simulate success (with 95% chance for demo realism)
    const isSuccess = Math.random() > 0.05;

    if (isSuccess) {
      const receipt = {
        refId,
        service: t(service.nameKey, service.nameEn),
        accountNumber,
        amount: Number(amount),
        fee: 0,
        total: Number(amount),
        timestamp,
        status: 'Completed',
        customerName: customerName || 'N/A',
      };
      setReceiptData(receipt);

      // Persist transaction to store
      addTransaction({
        id: Date.now(),
        title: t(service.nameKey, service.nameEn),
        subtitle: `${t('pay.account', 'Acct')}: ${accountNumber}`,
        amount: -Number(amount),
        type: 'bill',
        time: 'Just now',
        refId,
      });

      setStep(3);
    } else {
      setErrorMsg(t('pay.failed', 'Payment failed. Please try again.'));
      setStep(-1);
    }
  };

  /* ── Receipt PDF download (simple) ──────── */
  const handleDownloadReceipt = () => {
    if (!receiptData) return;
    const text = [
      '═══════════════════════════════════',
      '       BANK OF ABYSSINIA',
      '       Digital Payment Receipt',
      '═══════════════════════════════════',
      '',
      `Reference:   ${receiptData.refId}`,
      `Service:     ${receiptData.service}`,
      `Account:     ${receiptData.accountNumber}`,
      `Customer:    ${receiptData.customerName}`,
      `Amount:      ${receiptData.amount.toLocaleString()} ETB`,
      `Fee:         ${receiptData.fee} ETB`,
      `Total:       ${receiptData.total.toLocaleString()} ETB`,
      `Date:        ${receiptData.timestamp}`,
      `Status:      ${receiptData.status}`,
      '',
      '═══════════════════════════════════',
      '  Thank you for using Abyssinia!',
      '═══════════════════════════════════',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${receiptData.refId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pf-container">
      {/* ── Header ─────────────────────────── */}
      <div className="pf-header">
        <button className="pf-back" onClick={() => step === 0 ? navigate(-1) : setStep(0)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="pf-title">{t(service.nameKey, service.nameEn)}</h2>
      </div>

      {/* ── Step Indicator ─────────────────── */}
      {step >= 0 && step < 3 && (
        <div className="pf-steps">
          {[t('pay.details', 'Details'), t('pay.review', 'Review'), t('pay.process', 'Process')].map((label, i) => (
            <div key={i} className={`pf-step ${step >= i ? 'active' : ''} ${step === i ? 'current' : ''}`}>
              <div className="pf-step-dot">{step > i ? <CheckCircle size={14} /> : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Step 0: Enter Details ──────────── */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="input" className="pf-body" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="pf-card glass-panel">
              <div className="pf-form-group">
                <label>{t(service.accountLabelKey, service.accountLabel)}</label>
                <input
                  type="text"
                  placeholder={t('pay.enterAccount', 'Enter account / meter number')}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="pf-form-group">
                <label>{t('pay.customerName', 'Customer Name')} <span className="optional">({t('pay.optional', 'optional')})</span></label>
                <input
                  type="text"
                  placeholder={t('pay.namePlaceholder', 'Full name of account holder')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="pf-form-group">
                <label>{t('bills.amount', 'Amount (ETB)')}</label>
                <div className="amount-input-wrap">
                  <span className="currency-tag">ETB</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="amount-input"
                  />
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="quick-amounts">
                {[100, 250, 500, 1000, 2500, 5000].map((qa) => (
                  <button key={qa} className={`qa-btn ${amount === String(qa) ? 'active' : ''}`} onClick={() => setAmount(String(qa))}>
                    {qa.toLocaleString()}
                  </button>
                ))}
              </div>

              {errorMsg && <div className="pf-error"><AlertCircle size={14} /> {errorMsg}</div>}

              <motion.button className="pf-primary-btn" whileTap={{ scale: 0.97 }} onClick={handleReview}>
                {t('bills.reviewPayment', 'Review Payment')}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Review ──────────────── */}
        {step === 1 && (
          <motion.div key="review" className="pf-body" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
            <div className="pf-card glass-panel">
              <div className="review-header">
                <ShieldCheck size={32} color="#10B981" />
                <h3>{t('pay.confirmDetails', 'Confirm Payment Details')}</h3>
              </div>

              <div className="review-rows">
                <div className="rr"><span>{t('bills.provider', 'Provider')}</span><span>{t(service.nameKey, service.nameEn)}</span></div>
                <div className="rr"><span>{t(service.accountLabelKey, service.accountLabel)}</span><span>{accountNumber}</span></div>
                {customerName && <div className="rr"><span>{t('pay.customerName', 'Customer')}</span><span>{customerName}</span></div>}
                <div className="rr"><span>{t('bills.paymentAmount', 'Amount')}</span><span className="rr-amt">{Number(amount).toLocaleString()} ETB</span></div>
                <div className="rr"><span>{t('bills.fee', 'Fee')}</span><span className="rr-free">{t('bills.free', 'Free')}</span></div>
                <div className="rr total"><span>{t('pay.total', 'Total')}</span><span>{Number(amount).toLocaleString()} ETB</span></div>
              </div>

              <div className="review-source">
                <span>{t('bills.from', 'From')}</span>
                <div className="source-account">
                  <div className="sa-logo">
                    <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
                      <g transform="translate(50,50)">
                        {[0, 60, 120, 180, 240, 300].map(a => (
                          <ellipse key={a} cx="0" cy="-22" rx="12" ry="22" fill="#FFC321" transform={`rotate(${a})`} />
                        ))}
                        <circle cx="0" cy="0" r="10" fill="#FFC321" />
                      </g>
                    </svg>
                  </div>
                  <div className="sa-info">
                    <span className="sa-name">Abyssinia Savings</span>
                    <span className="sa-num">****7842</span>
                  </div>
                </div>
              </div>

              {errorMsg && <div className="pf-error"><AlertCircle size={14} /> {errorMsg}</div>}

              <div className="review-actions">
                <button className="pf-secondary-btn" onClick={() => setStep(0)}>
                  {t('pay.edit', 'Edit')}
                </button>
                <motion.button className="pf-primary-btn" whileTap={{ scale: 0.97 }} onClick={handleConfirm}>
                  {t('bills.confirmPayment', 'Confirm Payment')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Processing ──────────── */}
        {step === 2 && (
          <motion.div key="processing" className="pf-body pf-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="pf-processing">
              <div className="pf-spinner-ring">
                <div className="ring-inner" />
              </div>
              <h3>{t('pay.processing', 'Processing Payment...')}</h3>
              <p>{t('pay.doNotClose', 'Please do not close this screen')}</p>
              <div className="pf-processing-steps">
                <motion.div className="ps-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <CheckCircle size={14} color="#10B981" /> {t('pay.step1', 'Validating account...')}
                </motion.div>
                <motion.div className="ps-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  <CheckCircle size={14} color="#10B981" /> {t('pay.step2', 'Connecting to provider...')}
                </motion.div>
                <motion.div className="ps-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                  <Clock size={14} color="#F59E0B" /> {t('pay.step3', 'Completing transaction...')}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Success + Receipt ───── */}
        {step === 3 && receiptData && (
          <motion.div key="success" className="pf-body pf-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="pf-success-card glass-panel" ref={receiptRef}>
              <motion.div
                className="pf-success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle size={56} color="#10B981" />
              </motion.div>

              <h2>{t('bills.success', 'Payment Successful!')}</h2>
              <p className="pf-success-subtitle">{t('pay.receiptReady', 'Your digital receipt is ready')}</p>

              {/* Receipt card */}
              <div className="receipt-card">
                <div className="receipt-header">
                  <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
                    <g transform="translate(50,50)">
                      {[0, 60, 120, 180, 240, 300].map(a => (
                        <ellipse key={a} cx="0" cy="-22" rx="12" ry="22" fill="#FFC321" transform={`rotate(${a})`} />
                      ))}
                      <circle cx="0" cy="0" r="10" fill="#FFC321" />
                    </g>
                  </svg>
                  <span>Bank of Abyssinia</span>
                </div>

                <div className="receipt-amount-display">
                  <span className="rad-label">{t('pay.amountPaid', 'Amount Paid')}</span>
                  <span className="rad-value">{receiptData.total.toLocaleString()} ETB</span>
                </div>

                <div className="receipt-rows">
                  <div className="rcpt-row"><span>{t('txd.reference', 'Reference')}</span><span className="mono">{receiptData.refId}</span></div>
                  <div className="rcpt-row"><span>{t('bills.provider', 'Provider')}</span><span>{receiptData.service}</span></div>
                  <div className="rcpt-row"><span>{t('pay.account', 'Account')}</span><span>{receiptData.accountNumber}</span></div>
                  {receiptData.customerName !== 'N/A' && (
                    <div className="rcpt-row"><span>{t('pay.customerName', 'Customer')}</span><span>{receiptData.customerName}</span></div>
                  )}
                  <div className="rcpt-row"><span>{t('txd.date', 'Date')}</span><span>{receiptData.timestamp}</span></div>
                  <div className="rcpt-row"><span>{t('txd.status', 'Status')}</span><span className="status-badge">{receiptData.status}</span></div>
                </div>
              </div>

              {/* Receipt actions */}
              <div className="receipt-actions">
                <button className="ra-btn" onClick={handleDownloadReceipt}>
                  <Download size={18} /> {t('pay.download', 'Download')}
                </button>
                <button className="ra-btn" onClick={() => navigator.share?.({ title: 'Receipt', text: `Payment ${receiptData.refId}` }).catch(() => {})}>
                  <Share2 size={18} /> {t('pay.share', 'Share')}
                </button>
                <button className="ra-btn" onClick={() => window.print?.()}>
                  <Printer size={18} /> {t('pay.print', 'Print')}
                </button>
              </div>

              <div className="pf-final-actions">
                <button className="pf-secondary-btn" onClick={() => navigate('/service-hub')}>
                  {t('pay.payAnother', 'Pay Another Bill')}
                </button>
                <motion.button className="pf-primary-btn" whileTap={{ scale: 0.97 }} onClick={() => navigate('/')}>
                  {t('bills.backHome', 'Back to Home')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Error State ────────────────── */}
        {step === -1 && (
          <motion.div key="error" className="pf-body pf-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="pf-error-card glass-panel">
              <AlertCircle size={56} color="#EF4444" />
              <h3>{t('pay.failedTitle', 'Payment Failed')}</h3>
              <p>{errorMsg}</p>
              <motion.button className="pf-primary-btn" whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}>
                {t('pay.tryAgain', 'Try Again')}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
