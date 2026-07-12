import React, { useState } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';

export default function EditableDayCard({ day, tripId, onUpdate, onOpenSwap }) {
  const [openCustomSlot, setOpenCustomSlot] = useState(null);
  const [openNoteSlot, setOpenNoteSlot] = useState(null);
  const [customForm, setCustomForm] = useState({
    name: '',
    description: '',
    estimatedCost: 0,
    duration: 1
  });
  const [noteText, setNoteText] = useState('');

  const removePlace = async (slotId) => {
    try {
      await axiosInstance.patch(`/trips/${tripId}/edit/remove`, { slotId });
      toast.success('Place removed');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove place');
    }
  };

  const addCustomPlace = async (slotId) => {
    if (!customForm.name) {
      toast.error('Place name required');
      return;
    }
    try {
      await axiosInstance.patch(`/trips/${tripId}/edit/custom`, {
        slotId,
        customPlace: { ...customForm, isCustom: true }
      });
      toast.success('Custom place added');
      setOpenCustomSlot(null);
      setCustomForm({ name: '', description: '', estimatedCost: 0, duration: 1 });
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add custom place');
    }
  };

  const saveNote = async (slotId) => {
    try {
      await axiosInstance.patch(`/trips/${tripId}/edit/note`, {
        slotId,
        note: noteText
      });
      toast.success('Note saved');
      setOpenNoteSlot(null);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save note');
    }
  };

  return (
    <div className="edit-day-card">
      <h3>Day {day.dayNumber}</h3>
      <div className="edit-slots">
        {day.slots.map(slot => (
          <div key={slot.slotId} className={`edit-slot ${!slot.place ? 'empty' : ''}`}>
            <span className={`time-badge time-${slot.time.toLowerCase()}`}>{slot.time}</span>

            {slot.place ? (
              <div className="edit-slot-content">
                <h4>{slot.place.name}</h4>
                <div className="edit-slot-meta">
                  <span className="category-badge">{slot.place.category}</span>
                  <span>₹{slot.place.estimatedCost}</span>
                </div>
                <p className="edit-slot-desc">{slot.place.description || ''}</p>
                {slot.userNote && <p className="user-note">📝 {slot.userNote}</p>}

                {openNoteSlot === slot.slotId && (
                  <div className="note-input-wrapper">
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add a personal note..."
                    />
                    <div className="note-actions">
                      <button className="btn-sm btn-primary-sm" onClick={() => saveNote(slot.slotId)}>Save Note</button>
                      <button className="btn-sm btn-secondary-sm" onClick={() => setOpenNoteSlot(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="edit-slot-content">
                <p className="empty-slot-text">Empty slot</p>
                <button className="add-custom-btn" onClick={() => setOpenCustomSlot(openCustomSlot === slot.slotId ? null : slot.slotId)}>
                  + Add Custom Place
                </button>
                {openCustomSlot === slot.slotId && (
                  <div className="custom-form">
                    <input 
                      placeholder="Place name" 
                      value={customForm.name} 
                      onChange={e => setCustomForm({...customForm, name: e.target.value})} 
                    />
                    <textarea 
                      placeholder="Description" 
                      value={customForm.description} 
                      onChange={e => setCustomForm({...customForm, description: e.target.value})} 
                    />
                    <div className="custom-form-row">
                      <input 
                        type="number" 
                        placeholder="Cost ₹" 
                        value={customForm.estimatedCost} 
                        onChange={e => setCustomForm({...customForm, estimatedCost: Number(e.target.value)})} 
                      />
                      <input 
                        type="number" 
                        placeholder="Hours" 
                        value={customForm.duration} 
                        onChange={e => setCustomForm({...customForm, duration: Number(e.target.value)})} 
                      />
                    </div>
                    <button className="btn-sm btn-primary-sm" onClick={() => addCustomPlace(slot.slotId)}>Add Place</button>
                  </div>
                )}
              </div>
            )}

            <div className="edit-slot-actions">
              {slot.place && (
                <>
                  <button 
                    className="icon-btn" 
                    onClick={() => onOpenSwap(slot.slotId, slot.place.category, slot.place.coordinates.lat, slot.place.coordinates.lng)}
                  >
                    🔄
                  </button>
                  <button className="icon-btn" onClick={() => removePlace(slot.slotId)}>🗑</button>
                  <button className="icon-btn" onClick={() => {
                    setOpenNoteSlot(openNoteSlot === slot.slotId ? null : slot.slotId);
                    setNoteText(slot.userNote || '');
                  }}>
                    📝
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
