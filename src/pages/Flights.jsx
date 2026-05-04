import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plane, ArrowRight, Calendar, Users, CheckCircle } from 'lucide-react';
import useStore from '../store/useStore';
import useTranslation from '../hooks/useTranslation';
import './Flights.css';

const cityNames = { ADD: 'Addis Ababa', DXB: 'Dubai', NBO: 'Nairobi', JED: 'Jeddah', LHR: 'London', FRA: 'Frankfurt' };

export default function Flights() {
  const navigate = useNavigate();
  const t = useTranslation();
  const addTransaction = useStore((s) => s.addTransaction);
  const [tripType, setTripType] = useState('round');
  const [from, setFrom] = useState('ADD');
  const [to, setTo] = useState('DXB');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookingDone, setBookingDone] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setResults(null);
    setSelectedFlight(null);
    setBookingDone(false);
    setTimeout(() => {
      setIsSearching(false);
      setResults([
        { id: 1, airline: 'Ethiopian Airlines', flight: 'ET 602', depart: '08:45 AM', arrive: '12:30 PM', duration: '3h 45m', price: 42500, type: 'Direct' },
        { id: 2, airline: 'Ethiopian Airlines', flight: 'ET 604', depart: '14:20 PM', arrive: '18:15 PM', duration: '3h 55m', price: 45000, type: 'Direct' },
        { id: 3, airline: 'Fly Dubai', flight: 'FZ 22', depart: '22:00 PM', arrive: '02:10 AM', duration: '4h 10m', price: 38000, type: '1 Stop' }
      ]);
    }, 1500);
  };

  const handleBookFlight = (flight) => {
    setSelectedFlight(flight);
  };

  const confirmBooking = () => {
    const pax = parseInt(passengers) || 1;
    const total = selectedFlight.price * pax;
    addTransaction({
      id: Date.now(),
      title: `${selectedFlight.airline} ${selectedFlight.flight}`,
      subtitle: `${from} → ${to} • ${pax} passenger${pax > 1 ? 's' : ''}`,
      amount: -total,
      type: 'bill',
      time: 'Just now',
      refId: `ABY-FLT-${Date.now().toString().slice(-6)}`,
    });
    setBookingDone(true);
  };

  return (
    <div className="flights-container">
      <div className="flights-header">
        <button className="back-btn" onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
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

      {!selectedFlight && !bookingDone && (
        <div className="flights-search-card glass-panel">
          <div className="trip-types">
            <button className={tripType === 'round' ? 'active' : ''} onClick={() => setTripType('round')}>Round Trip</button>
            <button className={tripType === 'one' ? 'active' : ''} onClick={() => setTripType('one')}>One Way</button>
          </div>
          <div className="route-inputs">
            <div className="route-field">
              <span className="label">From</span>
              <select value={from} onChange={(e) => setFrom(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 28, fontWeight: 800, outline: 'none', width: '100%' }}>
                {Object.keys(cityNames).map(c => <option key={c} value={c} style={{ background: '#1a1520' }}>{c}</option>)}
              </select>
              <span className="city-name">{cityNames[from] || from}</span>
            </div>
            <div className="route-swap"><ArrowRight size={20} /></div>
            <div className="route-field">
              <span className="label">To</span>
              <select value={to} onChange={(e) => setTo(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 28, fontWeight: 800, outline: 'none', width: '100%' }}>
                {Object.keys(cityNames).map(c => <option key={c} value={c} style={{ background: '#1a1520' }}>{c}</option>)}
              </select>
              <span className="city-name">{cityNames[to] || to}</span>
            </div>
          </div>
          <div className="date-passengers">
            <div className="dp-field">
              <Calendar size={18} className="dp-icon" />
              <div className="dp-info">
                <span className="label">Departure</span>
                <input type="date" value={departDate} onChange={e => setDepartDate(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, outline: 'none' }} />
              </div>
            </div>
            {tripType === 'round' && (
              <div className="dp-field">
                <Calendar size={18} className="dp-icon" />
                <div className="dp-info">
                  <span className="label">Return</span>
                  <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, outline: 'none' }} />
                </div>
              </div>
            )}
            <div className="dp-field">
              <Users size={18} className="dp-icon" />
              <div className="dp-info">
                <span className="label">Passengers</span>
                <select value={passengers} onChange={e => setPassengers(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, outline: 'none' }}>
                  <option style={{ background: '#1a1520' }}>1</option><option style={{ background: '#1a1520' }}>2</option><option style={{ background: '#1a1520' }}>3</option><option style={{ background: '#1a1520' }}>4</option>
                </select>
              </div>
            </div>
          </div>
          <motion.button className="flight-search-btn" whileTap={{ scale: 0.96 }} onClick={handleSearch}>
            {isSearching ? <div className="spinner" /> : 'Search Flights'}
          </motion.button>
        </div>
      )}

      {results && !selectedFlight && !bookingDone && (
        <motion.div className="flights-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3>Available Flights</h3>
          {results.map((flight) => (
            <div key={flight.id} className="flight-card glass-panel">
              <div className="flight-top">
                <div className="airline-info"><Plane size={18} color="#FFC321" /><span className="airline-name">{flight.airline}</span></div>
                <span className="flight-price">{(flight.price * (parseInt(passengers) || 1)).toLocaleString()} ETB</span>
              </div>
              <div className="flight-times">
                <div className="time-block"><span className="time">{flight.depart}</span><span className="code">{from}</span></div>
                <div className="duration-line"><span className="dur-text">{flight.duration} • {flight.type}</span><div className="line"><Plane size={14} className="plane-icon" /></div></div>
                <div className="time-block right"><span className="time">{flight.arrive}</span><span className="code">{to}</span></div>
              </div>
              <button className="book-flight-btn" onClick={() => handleBookFlight(flight)}>Book Now</button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Booking Confirmation Step */}
      <AnimatePresence>
        {selectedFlight && !bookingDone && (
          <motion.div className="flights-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
              <h3 style={{ textAlign: 'center', marginBottom: 20 }}>Confirm Booking</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Flight</span><span style={{ fontWeight: 700 }}>{selectedFlight.airline} {selectedFlight.flight}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Route</span><span style={{ fontWeight: 700 }}>{from} → {to}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Passengers</span><span style={{ fontWeight: 700 }}>{passengers}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Per Ticket</span><span style={{ fontWeight: 700 }}>{selectedFlight.price.toLocaleString()} ETB</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}><span style={{ fontWeight: 800 }}>Total</span><span style={{ fontWeight: 800, color: '#FFC321', fontSize: 18 }}>{(selectedFlight.price * (parseInt(passengers) || 1)).toLocaleString()} ETB</span></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setSelectedFlight(null)} style={{ flex: 1, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Back</button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={confirmBooking} style={{ flex: 2, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Pay & Confirm</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {bookingDone && selectedFlight && (
          <motion.div className="flights-results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="glass-panel" style={{ padding: 32, borderRadius: 24, textAlign: 'center' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} style={{ background: 'rgba(16,185,129,0.1)', padding: 20, borderRadius: '50%', display: 'inline-flex', marginBottom: 16 }}><CheckCircle size={56} color="#10B981" /></motion.div>
              <h2 style={{ marginBottom: 4 }}>Flight Booked!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Your tickets have been confirmed</p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 14, textAlign: 'left', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ref</span><span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#FFC321' }}>ABY-FLT-{Date.now().toString().slice(-6)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Flight</span><span style={{ fontWeight: 700 }}>{selectedFlight.flight}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total</span><span style={{ fontWeight: 800, color: '#10B981' }}>{(selectedFlight.price * (parseInt(passengers) || 1)).toLocaleString()} ETB</span></div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/')} style={{ width: '100%', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg, #FFC321, #E5A900)', color: '#1a1520', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginBottom: 8 }}>Back to Home</motion.button>
              <button onClick={() => { setBookingDone(false); setSelectedFlight(null); setResults(null); }} style={{ width: '100%', padding: 14, borderRadius: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Search Another Flight</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
