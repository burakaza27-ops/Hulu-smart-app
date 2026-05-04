import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Search,
  Lightbulb, Droplets, Smartphone, Landmark,
  FileText, Stamp, BadgeCheck, ScrollText,
  AlertTriangle, Car, Shield,
  GraduationCap, School, BookOpen,
  Receipt, CreditCard, Zap, Building2
} from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import './ServiceHub.css';

/* ─── Service Data ─────────────────────────────────────────────── */
const serviceCategories = [
  {
    id: 'utility',
    titleKey: 'hub.utility',
    icon: Lightbulb,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.04) 100%)',
    services: [
      { id: 'eeu',       nameKey: 'hub.eeu',       nameEn: 'Ethiopian Electric (EEU)',       icon: Zap,         color: '#F59E0B', accountLabel: 'Meter Number',     accountLabelKey: 'hub.meterNum' },
      { id: 'aawsa',     nameKey: 'hub.aawsa',     nameEn: 'Water & Sewerage (AAWSA)',      icon: Droplets,    color: '#3B82F6', accountLabel: 'Contract Number',  accountLabelKey: 'hub.contractNum' },
      { id: 'ethiotele', nameKey: 'hub.ethiotele', nameEn: 'Ethio Telecom / Safaricom',     icon: Smartphone,  color: '#10B981', accountLabel: 'Phone Number',     accountLabelKey: 'hub.phoneNum' },
    ],
  },
  {
    id: 'government',
    titleKey: 'hub.government',
    icon: Landmark,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.04) 100%)',
    services: [
      { id: 'mor',       nameKey: 'hub.mor',       nameEn: 'Revenue Authority (MOR)',       icon: Receipt,     color: '#8B5CF6', accountLabel: 'TIN Number',       accountLabelKey: 'hub.tinNum' },
      { id: 'bizlicense', nameKey: 'hub.bizlicense', nameEn: 'Business License Renewal',    icon: ScrollText,  color: '#6366F1', accountLabel: 'License Number',   accountLabelKey: 'hub.licenseNum' },
      { id: 'passport',  nameKey: 'hub.passport',  nameEn: 'Passport Payment',             icon: Stamp,       color: '#EC4899', accountLabel: 'Application ID',   accountLabelKey: 'hub.applicationId' },
      { id: 'docverify', nameKey: 'hub.docverify', nameEn: 'Document Verification',        icon: BadgeCheck,  color: '#14B8A6', accountLabel: 'Document Number',  accountLabelKey: 'hub.docNum' },
    ],
  },
  {
    id: 'traffic',
    titleKey: 'hub.traffic',
    icon: Car,
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.04) 100%)',
    services: [
      { id: 'aatraffic', nameKey: 'hub.aatraffic', nameEn: 'Addis Ababa Traffic',          icon: AlertTriangle, color: '#EF4444', accountLabel: 'Plate / Citation', accountLabelKey: 'hub.plateNum' },
      { id: 'fedpolice', nameKey: 'hub.fedpolice', nameEn: 'Federal Police',               icon: Shield,      color: '#F97316', accountLabel: 'Citation Number',  accountLabelKey: 'hub.citationNum' },
    ],
  },
  {
    id: 'education',
    titleKey: 'hub.education',
    icon: GraduationCap,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.04) 100%)',
    services: [
      { id: 'university', nameKey: 'hub.university', nameEn: 'Universities',               icon: GraduationCap, color: '#10B981', accountLabel: 'Student ID',     accountLabelKey: 'hub.studentId' },
      { id: 'privateschool', nameKey: 'hub.privateschool', nameEn: 'Private Schools',      icon: School,      color: '#06B6D4', accountLabel: 'Student ID',       accountLabelKey: 'hub.studentId' },
      { id: 'tvet',      nameKey: 'hub.tvet',      nameEn: 'TVET Institutions',            icon: BookOpen,    color: '#84CC16', accountLabel: 'Student ID',       accountLabelKey: 'hub.studentId' },
    ],
  },
];

/* ─── Stagger animations ──────────────────────────────────────── */
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

/* ─── Component ────────────────────────────────────────────────── */
export default function ServiceHub() {
  const navigate = useNavigate();
  const t = useTranslation();
  const [search, setSearch] = useState('');
  const [expandedCat, setExpandedCat] = useState(null);

  const toggleCategory = (id) => setExpandedCat(expandedCat === id ? null : id);

  const handleServiceClick = (service) => {
    navigate('/payment', { state: { service } });
  };

  /* Filter by search */
  const filteredCategories = serviceCategories.map(cat => ({
    ...cat,
    services: cat.services.filter(s =>
      t(s.nameKey, s.nameEn).toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.services.length > 0);

  return (
    <div className="hub-container">
      {/* Header */}
      <div className="hub-top-bar">
        <button className="hub-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <div className="hub-top-text">
          <h2>{t('hub.title', 'Service Hub')}</h2>
          <span className="hub-subtitle">{t('hub.subtitle', 'Pay anything in Ethiopia — instantly')}</span>
        </div>
      </div>

      {/* Search */}
      <div className="hub-search-wrap">
        <div className="hub-search glass-panel">
          <Search size={18} className="hub-search-icon" />
          <input
            type="text"
            placeholder={t('hub.searchPlaceholder', 'Search services...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Quick stats ribbon */}
      <div className="hub-ribbon">
        <div className="ribbon-item">
          <span className="ri-val">12+</span>
          <span className="ri-lbl">{t('hub.services', 'Services')}</span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-item">
          <span className="ri-val">0%</span>
          <span className="ri-lbl">{t('hub.fee', 'Service Fee')}</span>
        </div>
        <div className="ribbon-divider" />
        <div className="ribbon-item">
          <span className="ri-val">24/7</span>
          <span className="ri-lbl">{t('hub.availability', 'Available')}</span>
        </div>
      </div>

      {/* Category list */}
      <motion.div className="hub-categories" variants={container} initial="hidden" animate="show">
        {filteredCategories.map((cat) => {
          const CatIcon = cat.icon;
          const isExpanded = expandedCat === cat.id;
          return (
            <motion.div key={cat.id} variants={item} className="hub-cat-card glass-panel">
              {/* Category header (expandable) */}
              <button className="cat-header" onClick={() => toggleCategory(cat.id)}>
                <div className="cat-icon-wrap" style={{ background: `${cat.color}18`, color: cat.color }}>
                  <CatIcon size={22} />
                </div>
                <div className="cat-text">
                  <h3>{t(cat.titleKey)}</h3>
                  <span className="cat-count">{cat.services.length} {t('hub.servicesAvail', 'services')}</span>
                </div>
                <motion.div
                  className="cat-chevron"
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={20} />
                </motion.div>
              </button>

              {/* Expandable service list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="cat-services"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {cat.services.map((service) => {
                      const SvcIcon = service.icon;
                      return (
                        <motion.button
                          key={service.id}
                          className="svc-item"
                          onClick={() => handleServiceClick(service)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="svc-icon" style={{ background: `${service.color}15`, color: service.color }}>
                            <SvcIcon size={18} />
                          </div>
                          <span className="svc-name">{t(service.nameKey, service.nameEn)}</span>
                          <ChevronRight size={16} className="svc-arrow" />
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Payments */}
      <div className="hub-recent">
        <h3>{t('hub.recentPayments', 'Recent Payments')}</h3>
        <div className="recent-list">
          {[
            { name: 'Ethiopian Electric', amt: 450, date: '2 days ago', icon: Zap, color: '#F59E0B' },
            { name: 'Ethio Telecom', amt: 200, date: '5 days ago', icon: Smartphone, color: '#10B981' },
            { name: 'AAU Tuition', amt: 8500, date: '1 week ago', icon: GraduationCap, color: '#3B82F6' },
          ].map((rp, i) => {
            const RPIcon = rp.icon;
            return (
              <div key={i} className="rp-item glass-panel">
                <div className="rp-icon" style={{ background: `${rp.color}15`, color: rp.color }}>
                  <RPIcon size={18} />
                </div>
                <div className="rp-info">
                  <span className="rp-name">{rp.name}</span>
                  <span className="rp-date">{rp.date}</span>
                </div>
                <span className="rp-amount">-{rp.amt.toLocaleString()} ETB</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
