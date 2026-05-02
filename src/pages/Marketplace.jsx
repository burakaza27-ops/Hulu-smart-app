import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Utensils, Ticket, Zap, Car } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import './Marketplace.css';

export default function Marketplace() {
  const navigate = useNavigate();
  const t = useTranslation();

  const categories = [
    { id: 1, icon: Utensils, name: 'Food Delivery', color: '#F59E0B' },
    { id: 2, icon: ShoppingBag, name: 'Groceries', color: '#10B981' },
    { id: 3, icon: Ticket, name: 'Events & Movies', color: '#8B5CF6' },
    { id: 4, icon: Zap, name: 'Electronics', color: '#3B82F6' },
    { id: 5, icon: Car, name: 'Ride Hailing', color: '#EF4444' }
  ];

  const featured = [
    { id: 1, name: 'Tomoca Coffee 500g', price: 650, img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', merchant: 'Tomoca Coffee' },
    { id: 2, name: 'Cinema Ticket - VIP', price: 300, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', merchant: 'Century Cinema' },
    { id: 3, name: 'Kuriftu Spa Package', price: 3500, img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', merchant: 'Kuriftu Resorts' },
    { id: 4, name: 'Fresh Groceries Bundle', price: 1200, img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', merchant: 'Fresh Corner' }
  ];

  return (
    <div className="market-container">
      <div className="market-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="header-title">Abyssinia Marketplace</h2>
      </div>

      <div className="market-hero">
        <div className="market-search">
          <input type="text" placeholder="Search for food, groceries, tickets..." />
        </div>
      </div>

      <div className="categories-grid">
        {categories.map(cat => (
          <div key={cat.id} className="category-item">
            <div className="cat-icon" style={{ background: `${cat.color}20`, color: cat.color }}>
              <cat.icon size={24} />
            </div>
            <span>{cat.name}</span>
          </div>
        ))}
      </div>

      <div className="featured-section">
        <h3>Featured Offers</h3>
        <div className="featured-grid">
          {featured.map(item => (
            <motion.div key={item.id} className="market-card glass-panel" whileTap={{ scale: 0.98 }}>
              <div className="market-img">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="market-info">
                <span className="merchant">{item.merchant}</span>
                <h4>{item.name}</h4>
                <div className="market-bottom">
                  <span className="price">{item.price} ETB</span>
                  <button className="buy-btn">Buy</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
