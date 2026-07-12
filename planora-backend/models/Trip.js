import mongoose from 'mongoose';

/*
Itinerary structure:
{
  days: [
    {
      dayNumber: 1,
      slots: [
        {
          slotId: "day1-morning",
          time: "Morning",
          place: {
            name: String,
            category: String,
            coordinates: { lat, lng },
            estimatedCost: Number,
            duration: Number (hours),
            description: String,
            isCustom: Boolean
          },
          userNote: String
        }
      ]
    }
  ]
}
*/

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  days: {
    type: Number,
    required: true,
  },
  travelers: {
    type: Number,
    required: true,
  },
  travelType: {
    type: String,
    enum: ['solo', 'friends', 'family', 'couple'],
    required: true,
  },
  interests: {
    type: [String],
    default: [],
  },
  hotelPreference: {
    type: String,
    enum: ['budget', 'standard', 'luxury'],
    required: true,
  },
  travelPace: {
    type: String,
    enum: ['relaxed', 'balanced', 'packed'],
    required: true,
  },
  generatedItinerary: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  userEditedItinerary: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  budgetBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  isFavourite: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
