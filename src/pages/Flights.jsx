import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plane, ArrowRight, Calendar, Users, Briefcase, CheckCircle } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';
import './Flights.css';

export default function Flights() {
  const navigate = useNavigate();
  const t = useTranslation();
  const [tripType, setTripType] = useState('round'); // round, one
  const [from, setFrom] = useState('ADD');
  const [to, setTo] = useState('DXB');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setResults([
        { id: 1, airline: 'Ethiopian Airlines', flight: 'ET 602', depart: '08:45 AM', arrive: '12:30 PM', duration: '3h 45m', price: 42500, type: 'Direct' },
        { id: 2, airline: 'Ethiopian Airlines', flight: 'ET 604', depart: '14:20 PM', arrive: '18:15 PM', duration: '3h 55m', price: 45000, type: 'Direct' },
        { id: 3, airline: 'Fly Dubai', flight: 'FZ 22', depart: '22:00 PM', arrive: '02:10 AM', duration: '4h 10m', price: 38000, type: '1 Stop' }
      ]);
    }, 1500);
  };

  return (
    <div className="flights-container">
      <div className="flights-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2 className="header-title">Flight Booking</h2>
      </div>

      <div className="flights-hero">
        <img src="/ethiopian_airlines.png" alt="Ethiopian Airlines" className="hero-img" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="et-badge">Official Partner</div>
          <h1>Fly Ethiopian</h1>
          <p>Book flights globally directly from your Abyssinia account.</p>
        </div>
      </div>

      <div className="flights-search-card glass-panel">
        <div className="trip-types">
          <button className={tripType === 'round' ? 'active' : ''} onClick={() => setTripType('round')}>Round Trip</button>
          <button className={tripType === 'one' ? 'active' : ''} onClick={() => setTripType('one')}>One Way</button>
        </div>

        <div className="route-inputs">
          <div className="route-field">
            <span className="label">From</span>
            <input type="text" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="city-name">Addis Ababa</span>
          </div>
          <div className="route-swap">
            <ArrowRight size={20} />
          </div>
          <div className="route-field">
            <span className="label">To</span>
            <input type="text" value={to} onChange={(e) => setTo(e.target.value)} />
            <span className="city-name">Dubai</span>
          </div>
        </div>

        <div className="date-passengers">
          <div className="dp-field">
            <Calendar size={18} className="dp-icon" />
            <div className="dp-info">
              <span className="label">Departure</span>
              <span className="val">Oct 12, 2026</span>
            </div>
          </div>
          {tripType === 'round' && (
            <div className="dp-field">
              <Calendar size={18} className="dp-icon" />
              <div className="dp-info">
                <span className="label">Return</span>
                <span className="val">Oct 20, 2026</span>
              </div>
            </div>
          )}
          <div className="dp-field">
            <Users size={18} className="dp-icon" />
            <div className="dp-info">
              <span className="label">Passengers</span>
              <span className="val">1 Adult</span>
            </div>
          </div>
        </div>

        <motion.button 
          className="flight-search-btn"
          whileTap={{ scale: 0.96 }}
          onClick={handleSearch}
        >
          {isSearching ? <div className="spinner" /> : 'Search Flights'}
        </motion.button>
      </div>

      {results && (
        <motion.div className="flights-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3>Available Flights</h3>
          {results.map((flight) => (
            <div key={flight.id} className="flight-card glass-panel">
              <div className="flight-top">
                <div className="airline-info">
                  <Plane size={18} color="#FFC321" />
                  <span className="airline-name">{flight.airline}</span>
                </div>
                <span className="flight-price">{flight.price.toLocaleString()} ETB</span>
              </div>
              
              <div className="flight-times">
                <div className="time-block">
                  <span className="time">{flight.depart}</span>
                  <span className="code">{from}</span>
                </div>
                <div className="duration-line">
                  <span className="dur-text">{flight.duration} • {flight.type}</span>
                  <div className="line">
                    <Plane size={14} className="plane-icon" />
                  </div>
                </div>
                <div className="time-block right">
                  <span className="time">{flight.arrive}</span>
                  <span className="code">{to}</span>
                </div>
              </div>

              <button className="book-flight-btn">Book Now</button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
