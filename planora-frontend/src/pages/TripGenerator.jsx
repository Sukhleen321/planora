import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';

const LOADING_MESSAGES = [
  'Fetching real places...',
  'Scoring attractions...',
  'Building your itinerary...',
  'Optimizing your route...',
  'Almost ready...'
];

export default function TripGenerator() {
  const navigate = useNavigate();

  // Generator states
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    travelers: 2,
    budget: '',
    travelType: '',
    hotelPreference: '',
    interests: [],
    travelPace: ''
  });

  useEffect(() => {
    document.title = "Planora — Plan Your Trip";
  }, []);

  // Validation helper
  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.destination.trim()) {
        toast.error('Destination is required');
        return false;
      }
      if (!formData.days || formData.days < 1 || formData.days > 7) {
        toast.error('Duration must be between 1 and 7 days');
        return false;
      }
      if (!formData.travelers || formData.travelers < 1) {
        toast.error('Travelers count must be at least 1');
        return false;
      }
    } else if (step === 2) {
      if (!formData.budget || formData.budget < 1000) {
        toast.error('Budget is required and must be at least ₹1,000');
        return false;
      }
      if (!formData.travelType) {
        toast.error('Please select a travel type');
        return false;
      }
      if (!formData.hotelPreference) {
        toast.error('Please select a hotel preference');
        return false;
      }
    } else if (step === 3) {
      if (formData.interests.length < 1) {
        toast.error('Please select at least 1 interest');
        return false;
      }
      if (!formData.travelPace) {
        toast.error('Please select a travel pace');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingMessage(LOADING_MESSAGES[0]);

    let messageIndex = 0;
    const intervalId = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2000);

    try {
      const response = await axiosInstance.post('/trips/generate', formData);
      clearInterval(intervalId);
      toast.success('Itinerary generated successfully!');
      
      // Navigate to result screen
      if (response.data && response.data.trip) {
        navigate(`/trip/${response.data.trip._id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      clearInterval(intervalId);
      setLoading(false);
      toast.error(err.response?.data?.message || 'Failed to generate itinerary');
    }
  };

  const toggleInterest = (interest) => {
    const isSelected = formData.interests.includes(interest);
    setFormData({
      ...formData,
      interests: isSelected
        ? formData.interests.filter(i => i !== interest)
        : [...formData.interests, interest]
    });
  };

  // UI Emojis and formatting helpers
  function getTypeEmoji(type) { 
    return { solo: '🧍', friends: '👥', family: '👨👩👧', couple: '💑' }[type]; 
  }

  function getHotelEmoji(h) { 
    return { budget: '🏨', standard: '🏩', luxury: '🏰' }[h]; 
  }

  function getInterestEmoji(i) { 
    return { beach: '🏖', history: '🏛', food: '🍜', nature: '🌿', adventure: '🧗', shopping: '🛍', nightlife: '🌙', religion: '🕌' }[i]; 
  }

  function capitalize(s) { 
    return s.charAt(0).toUpperCase() + s.slice(1); 
  }

  function getBudgetTier(b) { 
    const num = Number(b);
    return num < 10000 ? 'Budget Trip 🎒' : num <= 30000 ? 'Standard Trip ✈️' : 'Luxury Trip 💎'; 
  }

  return (
    <div className="generator-page">
      <Navbar />
      <div className="generator-container">
        
        {/* Progress Bar */}
        <div className="progress-bar-wrapper">
          <div className="progress-bar" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
        </div>
        <div className="step-indicator">Step {currentStep} of 3</div>

        {/* STEP 1: Core Details */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Where are you headed?</h2>
            
            <div className="form-group">
              <label>Destination</label>
              <input 
                type="text"
                className="input"
                value={formData.destination} 
                onChange={e => setFormData({ ...formData, destination: e.target.value })} 
                placeholder="e.g. Jaipur, Manali, Goa..." 
              />
            </div>
            
            <div className="form-group">
              <label>Trip Duration (Days)</label>
              <div className="number-badges">
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <button 
                    key={d} 
                    type="button"
                    className={`number-badge ${formData.days === d ? 'selected' : ''}`} 
                    onClick={() => setFormData({ ...formData, days: d })}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Number of Travelers</label>
              <div className="counter">
                <button 
                  type="button" 
                  className="counter-btn"
                  onClick={() => setFormData({ ...formData, travelers: Math.max(1, formData.travelers - 1) })}
                >
                  −
                </button>
                <span>{formData.travelers}</span>
                <button 
                  type="button" 
                  className="counter-btn"
                  onClick={() => setFormData({ ...formData, travelers: formData.travelers + 1 })}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Budget & Accommodations */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>What's your budget?</h2>
            
            <div className="form-group">
              <label>Trip Budget (₹ INR)</label>
              <input 
                type="number" 
                className="input"
                value={formData.budget} 
                onChange={e => setFormData({ ...formData, budget: e.target.value })} 
                placeholder="e.g. 15000" 
              />
              {formData.budget && (
                <div style={{ marginTop: '12px' }}>
                  <span className="budget-tier">{getBudgetTier(formData.budget)}</span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Travel Companion Type</label>
              <div className="option-grid-2x2">
                {['solo', 'friends', 'family', 'couple'].map(type => (
                  <div 
                    key={type} 
                    className={`option-card ${formData.travelType === type ? 'selected' : ''}`} 
                    onClick={() => setFormData({ ...formData, travelType: type })}
                  >
                    <div className="option-icon">{getTypeEmoji(type)}</div>
                    <div className="option-label">{capitalize(type)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Hotel Tier Preference</label>
              <div className="option-row-3">
                {['budget', 'standard', 'luxury'].map(hotel => (
                  <div 
                    key={hotel} 
                    className={`option-card ${formData.hotelPreference === hotel ? 'selected' : ''}`} 
                    onClick={() => setFormData({ ...formData, hotelPreference: hotel })}
                  >
                    <div className="option-icon">{getHotelEmoji(hotel)}</div>
                    <div className="option-label">{capitalize(hotel)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Interests & Pace */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>What do you love?</h2>
            
            <div className="form-group">
              <label>Select Interests (Choose 1 or more)</label>
              <div className="chips-grid">
                {['beach', 'history', 'food', 'nature', 'adventure', 'shopping', 'nightlife', 'religion'].map(interest => (
                  <button 
                    key={interest} 
                    type="button"
                    className={`chip ${formData.interests.includes(interest) ? 'selected' : ''}`} 
                    onClick={() => toggleInterest(interest)}
                  >
                    {getInterestEmoji(interest)} {capitalize(interest)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Preferred Travel Pace</label>
              <div className="pace-options">
                {[
                  { value: 'relaxed', emoji: '😌', label: 'Relaxed', desc: 'Few activities, lots of rest' },
                  { value: 'balanced', emoji: '⚖️', label: 'Balanced', desc: 'Mix of activities and downtime' },
                  { value: 'packed', emoji: '🚀', label: 'Packed', desc: 'Maximum experiences every day' }
                ].map(pace => (
                  <div 
                    key={pace.value} 
                    className={`pace-card ${formData.travelPace === pace.value ? 'selected' : ''}`} 
                    onClick={() => setFormData({ ...formData, travelPace: pace.value })}
                  >
                    <span className="pace-emoji">{pace.emoji}</span>
                    <div>
                      <div className="pace-title">{pace.label}</div>
                      <div className="pace-desc">{pace.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-nav">
          <button type="button" className="btn btn-secondary" onClick={handleBack}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            {currentStep === 3 ? 'Generate My Trip 🚀' : 'Next'}
          </button>
        </div>

      </div>

      {/* Loading Overlay */}
      <div className={`loading-overlay ${loading ? 'active' : ''}`}>
        <div className="loading-content">
          <div className="loading-plane">✈️</div>
          <p className="loading-message">{loadingMessage}</p>
        </div>
      </div>
    </div>
  );
}
