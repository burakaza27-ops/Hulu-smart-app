import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Utensils, Ticket, Zap, Car, Search, CheckCircle, X, Minus, Plus } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './Marketplace.css';

const categories = [
  { id: 'all', icon: ShoppingBag, name: 'All', color: '#FFC321' },
  { id: 'food', icon: Utensils, name: 'Food', color: '#F59E0B' },
  { id: 'grocery', icon: ShoppingBag, name: 'Groceries', color: '#10B981' },
  { id: 'events', icon: Ticket, name: 'Events', color: '#8B5CF6' },
  { id: 'electronics', icon: Zap, name: 'Electronics', color: '#3B82F6' },
  { id: 'ride', icon: Car, name: 'Rides', color: '#EF4444' },
];

const allProducts = [
  { id: 1, name: 'Tomoca Coffee 500g', price: 650, img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=60', merchant: 'Tomoca Coffee', cat: 'grocery' },
  { id: 2, name: 'Cinema Ticket - VIP', price: 300, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=60', merchant: 'Century Cinema', cat: 'events' },
  { id: 3, name: 'Kuriftu Spa Package', price: 3500, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=60', merchant: 'Kuriftu Resorts', cat: 'food' },
  { id: 4, name: 'Fresh Groceries Bundle', price: 1200, img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=60', merchant: 'Fresh Corner', cat: 'grocery' },
  { id: 5, name: 'Wireless Earbuds', price: 4500, img: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?auto=format&fit=crop&w=500&q=60', merchant: 'Tech Hub ET', cat: 'electronics' },
  { id: 6, name: 'Ride to Bole (5km)', price: 180, img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=500&q=60', merchant: 'RIDE ET', cat: 'ride' },
];

export default function Marketplace() {
  const navigate = useNavigate();
  const t = useTranslation();
  const addTransaction = useStore((s) => s.addTransaction);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const filtered = allProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.merchant.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (activeCat === 'all' || p.cat === activeCat);
  });

  const addToCart = (product) => {
    setCart(prev => ({ ...prev, [product.id]: { ...product, qty: (prev[product.id]?.qty || 0) + 1 } }));
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id]?.qty > 1) { next[id] = { ...next[id], qty: next[id].qty - 1 }; }
      else { delete next[id]; }
      return next;
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleCheckout = () => {
    cartItems.forEach(item => {
      addTransaction({
        id: Date.now() + item.id,
        title: item.name,
        subtitle: `${item.merchant} • x${item.qty}`,
        amount: -(item.price * item.qty),
        type: 'bill',
        time: 'Just now',
        refId: `ABY-MKT-${Date.now().toString().slice(-6)}`,
      });
    });
    setOrderSuccess(true);
    setCart({});
  };

  return (
    <div className="market-container">
      <div className="market-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
        <h2 className="header-title">{t('dash.market', 'Marketplace')}</h2>
        {cartCount > 0 && (
          <button onClick={() => setShowCart(true)} style={{ marginLeft: 'auto', position: 'relative', background: 'rgba(255,195,33,0.15)', border: '1px solid rgba(255,195,33,0.3)', borderRadius: 12, padding: '8px 14px', color: '#FFC321', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShoppingBag size={16} /> {cartCount}
          </button>
        )}
      </div>

      {!orderSuccess && (
        <>
          <div className="market-hero">
            <div className="market-search">
              <Search size={18} style={{ color: 'var(--text-muted)', marginRight: 8, flexShrink: 0 }} />
              <input type="text" placeholder="Search for food, groceries, tickets..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="categories-grid">
            {categories.map(cat => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.id} className={`category-item ${activeCat === cat.id ? 'active-cat' : ''}`} onClick={() => setActiveCat(cat.id)}>
                  <div className="cat-icon" style={{ background: activeCat === cat.id ? `${cat.color}30` : `${cat.color}15`, color: cat.color, border: activeCat === cat.id ? `2px solid ${cat.color}` : '2px solid transparent' }}>
                    <CatIcon size={22} />
                  </div>
                  <span>{cat.name}</span>
                </div>
              );
            })}
          </div>

          <div className="featured-section">
            <h3>{activeCat === 'all' ? 'Featured Offers' : categories.find(c => c.id === activeCat)?.name}</h3>
            <div className="featured-grid">
              {filtered.map(item => (
                <motion.div key={item.id} className="market-card glass-panel" whileTap={{ scale: 0.98 }}>
                  <div className="market-img"><img src={item.img} alt={item.name} /></div>
                  <div className="market-info">
                    <span className="merchant">{item.merchant}</span>
                    <h4>{item.name}</h4>
                    <div className="market-bottom">
                      <span className="price">{item.price.toLocaleString()} ETB</span>
                      {cart[item.id] ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => removeFromCart(item.id)} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                          <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{cart[item.id].qty}</span>
                          <button onClick={() => addToCart(item)} style={{ width: 28, height: 28, borderRadius: 8, background: '#FFC321', border: 'none', color: '#1a1520', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button className="buy-btn" onClick={() => addToCart(item)}>Add</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No items found.</p>}
            </div>
          </div>

          {/* Floating checkout bar */}
          <AnimatePresence>
            {cartCount > 0 && !showCart && (
              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                style={{ position: 'fixed', bottom: 20, left: 20, right: 20, background: 'linear-gradient(135deg, #FFC321, #E5A900)', borderRadius: 16, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 60, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
                onClick={() => setShowCart(true)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShoppingBag size={20} color="#1a1520" />
                  <span style={{ color: '#1a1520', fontWeight: 800, fontSize: 15 }}>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
                </div>
                <span style={{ color: '#1a1520', fontWeight: 800, fontSize: 16 }}>{cartTotal.toLocaleString()} ETB →</span>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Cart Sheet */}
      <AnimatePresence>
        {showCart && !orderSuccess && (
          <motion.div className="equb-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 90, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20 }}>
            <motion.div className="glass-panel" initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: '24px 24px 20px 20px', maxHeight: '70vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3>Your Cart</h3><button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button></div>
              {cartItems.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>Your cart is empty</p> : (
                <>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <img src={item.img} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.price.toLocaleString()} × {item.qty}</div></div>
                      <span style={{ fontWeight: 700, color: '#FFC321' }}>{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}><span style={{ fontWeight: 800 }}>Total</span><span style={{ fontWeight: 800, color: '#FFC321', fontSize: 20 }}>{cartTotal.toLocaleString()} ETB</span></div>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleCheckout} style={{ width: '100%', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Pay with Abyssinia</motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Success */}
      {orderSuccess && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="glass-panel" style={{ padding: 32, borderRadius: 24, textAlign: 'center', width: '100%', maxWidth: 400 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} style={{ background: 'rgba(16,185,129,0.1)', padding: 20, borderRadius: '50%', display: 'inline-flex', marginBottom: 16 }}><CheckCircle size={56} color="#10B981" /></motion.div>
            <h2>Order Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>Your items have been purchased successfully</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/')} style={{ width: '100%', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginBottom: 8 }}>Back to Home</motion.button>
            <button onClick={() => { setOrderSuccess(false); }} style={{ width: '100%', padding: 14, borderRadius: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Continue Shopping</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
