import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';

export default function TripCard({ trip, onUpdate }) {
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(trip.isFavourite);

  const toggleFavourite = async (e) => {
    e.stopPropagation();
    try {
      await axiosInstance.patch(`/trips/${trip._id}/favourite`);
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favourites' : 'Added to favourites');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update favourite status');
    }
  };

  const deleteTrip = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this trip?')) return;
    try {
      await axiosInstance.delete(`/trips/${trip._id}`);
      toast.success('Trip deleted');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to delete trip');
    }
  };

  return (
    <div className="trip-card" onClick={() => navigate(`/trip/${trip._id}`)}>
      <div className="trip-card-top">
        <h3>{trip.destination}</h3>
        {trip.isEdited && <span className="badge-edited">Modified</span>}
      </div>
      <div className="trip-card-details">
        <span>📅 {trip.days} Days</span>
        <span>👥 {trip.travelers} Travelers</span>
        <span>💰 ₹{trip.budget}</span>
      </div>
      <span className="trip-type-badge">{trip.travelType}</span>
      <div className="trip-card-bottom">
        <span className="trip-date">{new Date(trip.createdAt).toLocaleDateString()}</span>
        <div className="trip-card-actions">
          <button className="icon-btn" onClick={toggleFavourite}>
            {isFav ? '❤️' : '🤍'}
          </button>
          <button className="icon-btn" onClick={deleteTrip}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
