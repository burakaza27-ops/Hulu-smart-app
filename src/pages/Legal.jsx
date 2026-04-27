import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, Send, Bot, User, FileText, PenTool, Sparkles,
  ChevronRight, BookOpen, Briefcase, Home as HomeIcon, Car
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import useTranslation from '../hooks/useTranslation';
import BiometricPrompt from '../components/BiometricPrompt';
import { showToast } from '../components/Toast';
import './Legal.css';

export default function Legal() {
  const t = useTranslation();
  
  const templateCards = [
    { title: 'House Rental', subtitle: 'Residential lease agreement', icon: HomeIcon, color: '#FFC321' },
    { title: 'Employment', subtitle: 'Employment contract', icon: Briefcase, color: '#10B981' },
    { title: 'Vehicle Sale', subtitle: 'Vehicle purchase deed', icon: Car, color: '#3B82F6' },
    { title: 'NDA', subtitle: 'Non-disclosure agreement', icon: BookOpen, color: '#8B5CF6' },
  ];

  const initialMessages = [
    { id: 1, type: 'bot', text: t('legal.greeting'), time: '9:41 AM' }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [signed, setSigned] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const OPENROUTER_API_KEY = "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";

  const getLocalResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('rent') || q.includes('lease') || q.includes('house') || q.includes('ቤት') || q.includes('ኪራይ'))
      return 'Based on Ethiopian Civil Code Articles 2610-2619, I\'m preparing a legally compliant lease agreement for you. Here is your document:';
    if (q.includes('employ') || q.includes('job') || q.includes('work') || q.includes('ስራ'))
      return 'I\'ll draft an employment contract compliant with Ethiopian Labour Proclamation No. 1156/2019, covering probation, working hours, and leave. Here is your document:';
    if (q.includes('nda') || q.includes('confidential'))
      return 'Drafting an NDA under Ethiopian Civil Code Article 2049. Here is your document:';
    if (q.includes('vehicle') || q.includes('car') || q.includes('መኪና'))
      return 'Preparing a Vehicle Sale Agreement per Ethiopian Property Law. Here is your document:';
    if (q.includes('land') || q.includes('property') || q.includes('መሬት'))
      return 'Per Art. 40.3 of the Constitution, I can draft a leasehold agreement compliant with Proclamation No. 721/2011. Here is your document:';
    if (q.includes('business') || q.includes('company'))
      return 'I can help with business formation under the Ethiopian Commercial Code. Options include PLC (min. 5 shareholders, 15,000 ETB capital), Share Company, or Sole Proprietorship. Which interests you?';
    return 'I understand your legal question. Let me analyze the relevant Ethiopian law and draft a comprehensive document for you. Here is your document:';
  };

  const handleSend = async () => {
    if (!inputVal.trim()) return;
    const query = inputVal;
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    let botText = '';
    try {
      const apiMessages = [
        { role: "system", content: "You are an AI legal assistant for Abyssinia Smart Service Hub in Ethiopia. You speak Amharic, Oromo, Tigrinya, and English. You draft contracts based on Ethiopian law. Keep responses concise (under 200 words). If the user asks for a document or provides details for a contract, end your reply with 'Here is your document:' to trigger the document sheet." },
        ...messages.filter(m => m.type === 'user' || m.type === 'bot').slice(-6).map(m => ({
          role: m.type === 'bot' ? 'assistant' : 'user',
          content: m.text
        })),
        { role: "user", content: query }
      ];
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemma-2-9b-it:free", messages: apiMessages, max_tokens: 400 })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) {
        botText = data.choices[0].message.content;
      } else {
        botText = getLocalResponse(query);
      }
    } catch {
      botText = getLocalResponse(query);
    }

    setIsTyping(false);
    const botReply = {
      id: Date.now() + 1,
      type: 'bot',
      text: botText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, botReply]);
    if (botText.toLowerCase().includes('here is your document:')) {
      setTimeout(() => setShowDraft(true), 800);
    }
  };

  const handleTemplate = async (template) => {
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: `Draft a ${template.title} contract for me in Ethiopia`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const fallback = `I'll prepare a ${template.title} agreement. I need a few details:\n\n1. Full names of both parties\n2. Address or relevant property details\n3. Monthly amount or financial terms in ETB\n4. Duration of the agreement\n\nPlease provide these details, or I can use standard terms for a quick preview.`;
    let botText = fallback;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemma-2-9b-it:free",
          messages: [
            { role: "system", content: "You are an AI legal assistant for Abyssinia in Ethiopia. Ask the user for the missing details needed for this contract in a clear numbered list. Keep it under 150 words." },
            { role: "user", content: `Draft a ${template.title} contract for me in Ethiopia` }
          ],
          max_tokens: 300,
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.choices?.[0]?.message?.content) botText = data.choices[0].message.content;
      }
    } catch { /* use fallback */ }

    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: Date.now() + 1, type: 'bot', text: botText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleVerified = () => {
    setShowBio(false);
    setSigned(true);
    setTimeout(() => {
        setShowDraft(false);
        const botReply = {
            id: Date.now() + 2,
            type: 'bot',
            text: 'Contract successfully signed and saved securely to your Vault.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botReply]);
        setSigned(false);
    }, 1500);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div className="legal-page" variants={container} initial="hidden" animate="show">
      <Header title={t('legal.title')} subtitle={t('legal.subtitle')} showAvatar={false} />

      {messages.length <= 1 && (
        <motion.div variants={item} className="templates-scroll" style={{ marginBottom: 20 }}>
          {templateCards.map((tmpl, i) => {
            const Icon = tmpl.icon;
            return (
              <motion.div
                key={i}
                className="template-card glass-panel"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleTemplate(tmpl)}
              >
                <div className="tmpl-icon" style={{ background: `${tmpl.color}18`, color: tmpl.color }}>
                  <Icon size={20} />
                </div>
                <div className="tmpl-info">
                  <span className="tmpl-title">{tmpl.title}</span>
                  <span className="tmpl-sub">{tmpl.subtitle}</span>
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="chat-messages">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`chat-bubble ${msg.type}`}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              layout
            >
              <div className="bubble-avatar">
                {msg.type === 'bot' ? (
                  <div className="bot-avatar"><Bot size={16} /></div>
                ) : (
                  <div className="user-avatar"><User size={16} /></div>
                )}
              </div>
              <div className="bubble-content">
                <p className="bubble-text">{msg.text}</p>
                <span className="bubble-time">{msg.time}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div className="chat-bubble bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bubble-avatar">
              <div className="bot-avatar"><Bot size={16} /></div>
            </div>
            <div className="typing-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showDraft && (
          <>
            <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDraft(false)} />
            <motion.div
              className="draft-sheet glass-panel"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="sheet-handle" />
              <div className="draft-header">
                <div className="draft-badge">
                  <Sparkles size={14} />
                  <span>AI Generated</span>
                </div>
                <h3>Rental Agreement</h3>
                <p className="subtitle">Compliant with Ethiopian Civil Code</p>
              </div>
              <div className="draft-body" style={{ position: 'relative' }}>
                <p className="draft-text">
                  <strong>የቤት ኪራይ ውል</strong><br/><br/>
                  ይህ ውል ከዚህ ቀጥሎ "አከራይ" ተብሎ የሚጠራው ________________ እና "ተከራይ" ተብሎ
                  የሚጠራው ________________ መካከል በ________________ ዓ.ም. በ___________ ወር
                  ___________ ቀን ተፈራርመዋል።<br/><br/>
                  <strong>አንቀጽ 1 - የኪራይ ዕቃው</strong><br/>
                  አከራዩ በ________________ ክፍለ ከተማ የሚገኘውን ________________ ክፍል ያለውን ቤት
                  ለተከራዩ በኪራይ ሰጥቷል።<br/><br/>
                  <strong>አንቀጽ 2 - የኪራይ ዋጋ</strong><br/>
                  የወርሃዊ የኪራይ ዋጋ ________________ ብር (__________ETB) ሲሆን ክፍያው
                  በየወሩ ________________ ቀን ይከፈላል።
                </p>
                {signed && (
                   <motion.div 
                     initial={{ scale: 3, opacity: 0, rotate: -20 }} 
                     animate={{ scale: 1, opacity: 1, rotate: -20 }} 
                     style={{ position: 'absolute', bottom: 20, right: 20, color: '#10B981', border: '3px solid #10B981', padding: '5px 15px', borderRadius: 8, fontSize: '24px', fontWeight: 'bold' }}
                   >
                     SIGNED
                   </motion.div>
                )}
              </div>
              <div className="draft-actions">
                <motion.button className="btn-primary" whileTap={{ scale: 0.95 }} onClick={() => setShowBio(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <PenTool size={18} /> {t('legal.signDigitally')}
                </motion.button>
                <motion.button className="btn-secondary" whileTap={{ scale: 0.95 }} onClick={() => { setShowDraft(false); showToast('Contract saved to your Vault securely'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                  <FileText size={18} /> {t('legal.saveToVault')}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="chat-input-wrap">
        <div className="chat-input-bar glass-panel">
          <input
            type="text"
            placeholder={t('legal.inputPlaceholder')}
            className="chat-input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <motion.button
            className="send-btn"
            whileTap={{ scale: 0.85 }}
            onClick={handleSend}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>

      <BiometricPrompt
        open={showBio}
        onVerified={handleVerified}
        onCancel={() => setShowBio(false)}
        mode="fingerprint"
      />
    </motion.div>
  );
}
