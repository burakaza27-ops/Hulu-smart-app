import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Calendar, MapPin, Star, Users, CheckCircle, Navigation } from 'lucide-react';
import Header from '../components/Header';
import useTranslation from '../hooks/useTranslation';
import './Hotels.css';

const hotels = [
  {
    id: 1,
    name: 'Skylight Hotel Addis',
    location: 'Bole, Addis Ababa',
    rating: 4.8,
    reviews: 1245,
    price: 18500,
    currency: 'ETB',
    image: '/hotel_addis.png',
    features: ['Pool', 'Spa', 'Airport Shuttle', 'Free WiFi'],
    type: 'Luxury'
  },
  {
    id: 2,
    name: 'Sheraton Addis',
    location: 'Kirkos, Addis Ababa',
    rating: 4.9,
    reviews: 2108,
    price: 25000,
    currency: 'ETB',
    image: '/hotel_room_luxury.png',
    features: ['Luxury Suite', 'Fine Dining', 'Live Music', 'Pool'],
    type: 'Luxury'
  },
  {
    id: 3,
    name: 'Haile Resort Hawassa',
    location: 'Hawassa, Ethiopia',
    rating: 4.7,
    reviews: 856,
    price: 12000,
    currency: 'ETB',
    image: '/resort_ethiopia.png',
    features: ['Lake View', 'Boat Ride', 'Spa', 'Family Friendly'],
    type: 'Resort'
  }
];

export default function Hotels() {
  const navigate = useNavigate();
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingStep, setBookingStep] = useState(0); // 0: list, 1: details, 2: success

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBook = () => {
    setBookingStep(2); // Show success
  };

  const closeBooking = () => {
    setBookingStep(0);
    setSelectedHotel(null);
  };

  return (
    <div className="hotels-container">
      {bookingStep === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hotels-list-view">
          <div className="hotels-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={24} />
            </button>
            <h2 className="header-title">Abyssinia Travels</h2>
          </div>

          <div className="hotels-hero">
            <img src="/hotel_addis.png" alt="Travel Ethiopia" className="hero-img" />
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1>Discover Ethiopia</h1>
              <p>Book world-class hotels with your Abyssinia account instantly.</p>
            </div>
          </div>

          <div className="search-section">
            <div className="search-bar glass-panel">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search destination or hotel name..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-chips">
              <button className="chip active">All</button>
              <button className="chip">Addis Ababa</button>
              <button className="chip">Resorts</button>
              <button className="chip">Luxury</button>
            </div>
          </div>

          <div className="hotels-list">
            {filteredHotels.map((hotel, idx) => (
              <motion.div 
                key={hotel.id} 
                className="hotel-card glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => { setSelectedHotel(hotel); setBookingStep(1); }}
              >
                <div className="hotel-img-wrapper">
                  <img src={hotel.image} alt={hotel.name} />
                  <div className="hotel-badge">{hotel.type}</div>
                </div>
                <div className="hotel-info">
                  <div className="hotel-title-row">
                    <h3>{hotel.name}</h3>
                    <div className="hotel-rating">
                      <Star size={14} fill="#FFC321" color="#FFC321" />
                      <span>{hotel.rating}</span>
                    </div>
                  </div>
                  <p className="hotel-location"><MapPin size={14} /> {hotel.location}</p>
                  <div className="hotel-footer">
                    <span className="hotel-price">
                      <strong>{hotel.price.toLocaleString()}</strong> {hotel.currency} <span>/ night</span>
                    </span>
                    <button className="book-btn">View</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {bookingStep === 1 && selectedHotel && (
          <motion.div 
            className="hotel-detail-view"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="detail-hero">
              <img src={selectedHotel.image} alt={selectedHotel.name} />
              <button className="detail-back-btn" onClick={() => setBookingStep(0)}>
                <ChevronLeft size={24} />
              </button>
              <div className="detail-hero-gradient" />
            </div>

            <div className="detail-content">
              <div className="detail-header">
                <h2>{selectedHotel.name}</h2>
                <div className="detail-rating">
                  <Star size={16} fill="#FFC321" color="#FFC321" />
                  <span>{selectedHotel.rating} ({selectedHotel.reviews} reviews)</span>
                </div>
                <p className="detail-location"><Navigation size={16} /> {selectedHotel.location}</p>
              </div>

              <div className="detail-features glass-panel">
                {selectedHotel.features.map((f, i) => (
                  <div key={i} className="feature-item">
                    <CheckCircle size={16} color="#10B981" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="booking-form glass-panel">
                <h3>Reservation Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label><Calendar size={16}/> Check-in</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label><Calendar size={16}/> Check-out</label>
                    <input type="date" />
                  </div>
                  <div className="form-group full-width">
                    <label><Users size={16}/> Guests</label>
                    <select>
                      <option>1 Adult, 0 Children</option>
                      <option>2 Adults, 0 Children</option>
                      <option>2 Adults, 1 Child</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="price-summary glass-panel">
                <div className="summary-row">
                  <span>Price per night</span>
                  <span>{selectedHotel.price.toLocaleString()} ETB</span>
                </div>
                <div className="summary-row">
                  <span>Taxes & Fees</span>
                  <span>{(selectedHotel.price * 0.15).toLocaleString()} ETB</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>{(selectedHotel.price * 1.15).toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            <div className="detail-bottom-bar glass-panel">
              <div className="bottom-price">
                <span className="label">Total</span>
                <span className="value">{(selectedHotel.price * 1.15).toLocaleString()} ETB</span>
              </div>
              <motion.button 
                className="confirm-book-btn"
                whileTap={{ scale: 0.95 }}
                onClick={handleBook}
              >
                Pay & Book Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingStep === 2 && (
          <motion.div 
            className="booking-success-view glass-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="success-content">
              <motion.div 
                className="success-icon-wrap"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle size={64} color="#10B981" />
              </motion.div>
              <h2>Booking Confirmed!</h2>
              <p>Your reservation at {selectedHotel?.name} has been paid successfully using your Abyssinia One-Card.</p>
              
              <div className="receipt-card">
                <div className="receipt-row"><span>Booking ID</span> <span>#ABY-{Math.floor(Math.random()*10000)}</span></div>
                <div className="receipt-row"><span>Amount Paid</span> <span>{(selectedHotel?.price * 1.15).toLocaleString()} ETB</span></div>
              </div>

              <motion.button 
                className="done-btn"
                whileTap={{ scale: 0.95 }}
                onClick={closeBooking}
              >
                Back to Hotels
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
