import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import TripCard from '../components/TripCard';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadTrips = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/trips/all');
      // Set trips array from api response payload
      setTrips(response.data.trips || []);
    } catch (err) {
      toast.error('Failed to load trips');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Planora — Dashboard";
    loadTrips();
  }, []);

  // Computed metrics
  const filteredTrips = filter === 'favourites' 
    ? trips.filter(t => t.isFavourite) 
    : trips;

  const totalTrips = trips.length;
  const totalFavourites = trips.filter(t => t.isFavourite).length;
  const latestDestination = trips[0]?.destination || '—';

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-container">
        
        {/* Header Section */}
        <div className="dashboard-header">
          <div>
            <h1>Hello, {user?.name || 'Traveler'} 👋</h1>
            <p>Where are you heading next?</p>
          </div>
          <button onClick={() => navigate('/generate')} className="btn btn-primary">
            + Generate New Trip
          </button>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="dash-stat-card">
            <div className="dash-stat-icon">🗺️</div>
            <div className="dash-stat-info">
              <span className="dash-stat-number">{totalTrips}</span>
              <span className="dash-stat-label">Total Trips</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon">❤️</div>
            <div className="dash-stat-info">
              <span className="dash-stat-number">{totalFavourites}</span>
              <span className="dash-stat-label">Favourites</span>
            </div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-icon">📍</div>
            <div className="dash-stat-info">
              <span 
                className="dash-stat-number" 
                style={{ fontSize: latestDestination.length > 12 ? '20px' : '28px' }}
              >
                {latestDestination}
              </span>
              <span className="dash-stat-label">Latest Destination</span>
            </div>
          </div>
        </div>

        {/* Trips List Section */}
        <div className="trips-section">
          <div className="trips-header">
            <h2>Your Trips</h2>
            <div className="filter-tabs">
              <button 
                className={filter === 'all' ? 'filter-tab active' : 'filter-tab'} 
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={filter === 'favourites' ? 'filter-tab active' : 'filter-tab'} 
                onClick={() => setFilter('favourites')}
              >
                Favourites
              </button>
            </div>
          </div>

          {loading ? (
            <div className="trips-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✈️</div>
              <h3>No trips yet</h3>
              <p>Plan your first adventure with Planora</p>
              <button onClick={() => navigate('/generate')} className="btn btn-primary">
                Plan Your First Trip
              </button>
            </div>
          ) : (
            <div className="trips-grid">
              {filteredTrips.map(trip => (
                <TripCard 
                  key={trip._id} 
                  trip={trip} 
                  onUpdate={loadTrips} 
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
