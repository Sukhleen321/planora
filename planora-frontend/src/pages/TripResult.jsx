import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import BudgetPieChart from '../components/BudgetPieChart';
import MapView from '../components/MapView';
import Spinner from '../components/Spinner';

export default function TripResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  const loadTrip = async () => {
    try {
      const response = await axiosInstance.get(`/trips/${id}`);
      setTrip(response.data.trip);
      setIsFav(response.data.trip.isFavourite);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load itinerary details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Planora — Your Itinerary";
    loadTrip();
  }, [id]);

  const toggleFav = async () => {
    try {
      await axiosInstance.patch(`/trips/${id}/favourite`);
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favourites' : 'Added to favourites');
    } catch (err) {
      toast.error('Failed to update favourite status');
    }
  };

  const exportPDF = () => {
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5000/api/trips/${id}/export?token=${token}`);
  };

  const shareTrip = () => {
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const capitalize = (s) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <Spinner />
      </div>
    );
  }

  if (!trip) {
    return (
      <div 
        style={{ 
          textAlign: 'center', 
          padding: '6rem 2rem', 
          backgroundColor: 'var(--bg-primary)', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Trip not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Go back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="result-page">
      <Navbar />
      <div className="result-container">
        
        {/* Header */}
        <div className="result-header">
          <div>
            <h1>{trip.destination}</h1>
            <div className="trip-badges">
              <span className="info-badge">📅 {trip.days} Days</span>
              <span className="info-badge">👥 {trip.travelers} Travelers</span>
              <span className="info-badge">{capitalize(trip.travelType)}</span>
              <span className="info-badge">{capitalize(trip.travelPace)} Pace</span>
            </div>
          </div>
          <div className="result-actions">
            <button onClick={() => navigate(`/trip/${id}/edit`)} className="btn btn-secondary">
              ✏️ Edit Itinerary
            </button>
            <button onClick={exportPDF} className="btn btn-secondary">
              📄 Export PDF
            </button>
            <button onClick={toggleFav} className="icon-btn-lg">
              {isFav ? '❤️' : '🤍'}
            </button>
            <button onClick={shareTrip} className="icon-btn-lg">
              🔗
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="result-grid">
          
          {/* Itinerary Timeline */}
          <div className="itinerary-col">
            {trip.userEditedItinerary?.days?.map((day) => (
              <div key={day.dayNumber} className="day-card">
                <h3 className="day-title">Day {day.dayNumber}</h3>
                <div className="slots-list">
                  {day.slots.map((slot) => {
                    const isEmpty = !slot.place;
                    return (
                      <div key={slot.slotId} className={`slot-card ${isEmpty ? 'empty-slot' : ''}`}>
                        <span className={`time-badge time-${slot.time.toLowerCase()}`}>
                          {slot.time}
                        </span>
                        
                        {!isEmpty ? (
                          <div className="slot-content">
                            <h4>{slot.place.name}</h4>
                            <span className="category-badge">{slot.place.category}</span>
                            <div className="slot-meta">
                              <span>₹{slot.place.estimatedCost}</span>
                              <span>{slot.place.timeRequired} hrs</span>
                            </div>
                            <p className="slot-description">
                              {slot.place.description || 'No description available'}
                            </p>
                            {slot.userNote && (
                              <p className="user-note">
                                📝 {slot.userNote}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="slot-content">
                            <p className="empty-text">Free time — add your own plan</p>
                            <span onClick={() => navigate(`/trip/${id}/edit`)} className="add-link">
                              + Add a place
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Visualizations */}
          <div className="sidebar-col">
            
            {/* Budget Section */}
            <div className="sidebar-card">
              <h3>Budget Breakdown</h3>
              <BudgetPieChart data={trip.budgetBreakdown} />
              
              <div className="budget-list">
                <div className="budget-row">
                  <span>Hotel</span>
                  <span>₹{trip.budgetBreakdown?.hotel || 0}</span>
                </div>
                <div className="budget-row">
                  <span>Food</span>
                  <span>₹{trip.budgetBreakdown?.food || 0}</span>
                </div>
                <div className="budget-row">
                  <span>Transport</span>
                  <span>₹{trip.budgetBreakdown?.transport || 0}</span>
                </div>
                <div className="budget-row">
                  <span>Activities</span>
                  <span>₹{trip.budgetBreakdown?.activities || 0}</span>
                </div>
                
                <div className="budget-divider"></div>
                
                <div className="budget-row total">
                  <span>Total Spent</span>
                  <span>₹{trip.budgetBreakdown?.total || 0}</span>
                </div>
                <div className={`budget-row ${(trip.budgetBreakdown?.remaining || 0) >= 0 ? 'positive' : 'negative'}`}>
                  <span>Remaining</span>
                  <span>₹{trip.budgetBreakdown?.remaining || 0}</span>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="sidebar-card">
              <h3>Trip Map</h3>
              <MapView itinerary={trip.userEditedItinerary} />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
