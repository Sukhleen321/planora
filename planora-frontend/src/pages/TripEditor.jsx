import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import EditableDayCard from '../components/EditableDayCard';
import PlaceSuggestions from '../components/PlaceSuggestions';
import Spinner from '../components/Spinner';

export default function TripEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [swapModal, setSwapModal] = useState({
    open: false,
    slotId: null,
    category: '',
    lat: 0,
    lng: 0
  });

  const loadTrip = async () => {
    try {
      const response = await axiosInstance.get(`/trips/${id}`);
      setTrip(response.data.trip);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load itinerary details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Planora — Edit Trip";
    loadTrip();
  }, [id]);

  const handleReset = async () => {
    if (!window.confirm('Are you sure? This will undo all your changes.')) return;
    try {
      await axiosInstance.patch(`/trips/${id}/edit/reset`);
      toast.success('Reset to original itinerary');
      loadTrip();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset itinerary');
    }
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
    <div className="editor-page">
      <Navbar />
      <div className="editor-container">
        
        {/* Top bar */}
        <div className="editor-topbar">
          <div>
            <h1>Editing: {trip.destination}</h1>
            {trip.isEdited && <span className="modified-badge">Modified</span>}
          </div>
          <div className="editor-actions">
            <button onClick={handleReset} className="btn-danger-outline">
              Reset to Original
            </button>
            <button onClick={() => navigate(`/trip/${id}`)} className="btn btn-primary">
              View Trip
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions-bar">
          💡 Click 🔄 to swap a place • Click 🗑 to remove • Click + to add your own place • Click 📝 to add a note
        </div>

        {/* Days List */}
        <div className="editor-days">
          {trip.userEditedItinerary?.days?.map((day) => (
            <EditableDayCard
              key={day.dayNumber}
              day={day}
              tripId={id}
              onUpdate={loadTrip}
              onOpenSwap={(slotId, category, lat, lng) => 
                setSwapModal({ open: true, slotId, category, lat, lng })
              }
            />
          ))}
        </div>

      </div>

      {/* Place Suggestions Swap Modal */}
      {swapModal.open && (
        <PlaceSuggestions
          tripId={id}
          slotId={swapModal.slotId}
          category={swapModal.category}
          lat={swapModal.lat}
          lng={swapModal.lng}
          onClose={() => setSwapModal({ open: false, slotId: null, category: '', lat: 0, lng: 0 })}
          onUpdate={loadTrip}
        />
      )}
    </div>
  );
}
