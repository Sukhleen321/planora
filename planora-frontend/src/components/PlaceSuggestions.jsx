import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import Spinner from './Spinner';

export default function PlaceSuggestions({ tripId, slotId, category, lat, lng, onClose, onUpdate }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/trips/${tripId}/suggestions?category=${category}&lat=${lat}&lng=${lng}`
      );
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      toast.error('Failed to load alternative suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [tripId, slotId, category, lat, lng]);

  const pickSuggestion = async (place) => {
    try {
      await axiosInstance.patch(`/trips/${tripId}/edit/swap`, {
        slotId,
        newPlace: place
      });
      toast.success('Place swapped!');
      onClose();
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to swap place');
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>Choose a replacement</h3>
        <p className="modal-subtitle">Showing alternatives in this category</p>
        
        <div className="suggestions-list">
          {loading ? (
            <Spinner />
          ) : suggestions.length > 0 ? (
            suggestions.map((place, i) => (
              <div key={i} className="suggestion-item">
                <h4>{place.name}</h4>
                <div className="edit-slot-meta" style={{ marginBottom: '10px' }}>
                  <span className="category-badge">{place.category}</span>
                  <span>₹{place.estimatedCost}</span>
                </div>
                <button 
                  className="btn-sm btn-primary-sm" 
                  style={{ width: '100%' }} 
                  onClick={() => pickSuggestion(place)}
                >
                  Pick This
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
              No alternatives found for this category
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
