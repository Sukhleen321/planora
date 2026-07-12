import { fetchAndClassifyPlaces } from '../services/openTripMapService.js';
import { scorePlace } from '../services/scoringEngine.js';
import { buildSchedule } from '../services/schedulerService.js';
import { optimizeItineraryRoutes } from '../services/routeOptimizer.js';
import { calculateBudget } from '../services/budgetEngine.js';
import { beautifyItinerary } from '../services/geminiService.js';
import Trip from '../models/Trip.js';
import PDFDocument from 'pdfkit';
import jwt from 'jsonwebtoken';

/**
 * Helper to determine budget tier based on user-entered budget value.
 * @param {Number} budget - Trip budget input
 * @returns {String} "low", "medium", or "high"
 */
const getBudgetTier = (budget) => {
  const b = Number(budget);
  if (b < 10000) return 'low';
  if (b < 30000) return 'medium';
  return 'high';
};

/**
 * Generate a complete, optimized, and beautified travel itinerary.
 */
export const generateTrip = async (req, res) => {
  try {
    const {
      destination,
      budget,
      days,
      travelers,
      travelType,
      interests,
      hotelPreference,
      travelPace
    } = req.body;

    // Validate request inputs
    if (!destination || !budget || !days || !travelers || !travelType || !hotelPreference || !travelPace) {
      return res.status(400).json({ message: 'Missing required trip parameters' });
    }

    // STEP 1: Fetch and classify places
    const { places, cityCenter } = await fetchAndClassifyPlaces(destination);

    // STEP 2: Score all places
    const userPrefs = {
      travelType,
      budget: getBudgetTier(budget),
      interests: Array.isArray(interests) ? interests : []
    };

    const scoredPlaces = places
      .map((place) => {
        const score = scorePlace(place, userPrefs, cityCenter);
        return { ...place, score };
      })
      .filter((place) => place.score !== -1)
      .sort((a, b) => b.score - a.score);

    // STEP 3: Build schedule
    const itinerary = buildSchedule(scoredPlaces, days, travelPace);

    // STEP 4: Optimize routes
    const optimizedItinerary = optimizeItineraryRoutes(itinerary, cityCenter);

    // STEP 5: Calculate budget breakdown
    const budgetBreakdown = calculateBudget(
      { budget, days, travelers, hotelPreference },
      optimizedItinerary
    );

    // STEP 6: Beautify descriptions using Gemini LLM
    const beautifiedItinerary = await beautifyItinerary(optimizedItinerary);

    // STEP 7: Save to MongoDB database
    const trip = new Trip({
      userId: req.user.id,
      destination,
      budget,
      days,
      travelers,
      travelType,
      interests: Array.isArray(interests) ? interests : [],
      hotelPreference,
      travelPace,
      generatedItinerary: beautifiedItinerary,
      userEditedItinerary: beautifiedItinerary, // copy to start
      budgetBreakdown
    });

    await trip.save();

    return res.status(201).json({ success: true, trip });
  } catch (error) {
    console.error('Error generating trip itinerary:', error);
    return res.status(500).json({ message: 'Error generating trip itinerary', error: error.message });
  }
};

/**
 * Retrieve all trips saved by the current user.
 */
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ trips });
  } catch (error) {
    console.error('Error fetching all trips:', error);
    return res.status(500).json({ message: 'Error fetching trips', error: error.message });
  }
};

/**
 * Retrieve a specific trip by its unique identifier.
 */
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Verify ownership
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.status(200).json({ trip });
  } catch (error) {
    console.error('Error fetching trip by ID:', error);
    return res.status(500).json({ message: 'Error fetching trip details', error: error.message });
  }
};

/**
 * Delete a specific saved trip.
 */
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Verify ownership
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Trip.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Trip deleted' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return res.status(500).json({ message: 'Error deleting trip', error: error.message });
  }
};

/**
 * Toggle the favorite state of a saved trip.
 */
export const toggleFavourite = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Verify ownership
    if (trip.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trip.isFavourite = !trip.isFavourite;
    await trip.save();

    return res.status(200).json({ isFavourite: trip.isFavourite });
  } catch (error) {
    console.error('Error toggling favorite flag:', error);
    return res.status(500).json({ message: 'Error updating favorite flag', error: error.message });
  }
};

/**
 * Swap a place in a specific slot.
 */
export const swapPlace = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { slotId, newPlace } = req.body;
    let found = false;

    if (trip.userEditedItinerary && Array.isArray(trip.userEditedItinerary.days)) {
      for (const day of trip.userEditedItinerary.days) {
        if (Array.isArray(day.slots)) {
          for (const slot of day.slots) {
            if (slot.slotId === slotId) {
              slot.place = newPlace;
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
    }

    trip.isEdited = true;
    trip.markModified('userEditedItinerary');
    await trip.save();

    return res.status(200).json({ success: true, itinerary: trip.userEditedItinerary });
  } catch (error) {
    console.error('Error in swapPlace:', error);
    return res.status(500).json({ message: 'Error swapping place', error: error.message });
  }
};

/**
 * Remove a place from a specific slot.
 */
export const removePlace = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { slotId } = req.body;
    let found = false;

    if (trip.userEditedItinerary && Array.isArray(trip.userEditedItinerary.days)) {
      for (const day of trip.userEditedItinerary.days) {
        if (Array.isArray(day.slots)) {
          for (const slot of day.slots) {
            if (slot.slotId === slotId) {
              slot.place = null;
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
    }

    trip.isEdited = true;
    trip.markModified('userEditedItinerary');
    await trip.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in removePlace:', error);
    return res.status(500).json({ message: 'Error removing place', error: error.message });
  }
};

/**
 * Add a custom place to a specific slot.
 */
export const addCustomPlace = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { slotId, customPlace } = req.body;
    let found = false;

    if (trip.userEditedItinerary && Array.isArray(trip.userEditedItinerary.days)) {
      for (const day of trip.userEditedItinerary.days) {
        if (Array.isArray(day.slots)) {
          for (const slot of day.slots) {
            if (slot.slotId === slotId) {
              slot.place = { ...customPlace, isCustom: true };
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
    }

    trip.isEdited = true;
    trip.markModified('userEditedItinerary');
    await trip.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in addCustomPlace:', error);
    return res.status(500).json({ message: 'Error adding custom place', error: error.message });
  }
};

/**
 * Reorder slots in a specific day.
 */
export const reorderSlots = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { dayNumber, newSlotOrder } = req.body;

    if (trip.userEditedItinerary && Array.isArray(trip.userEditedItinerary.days)) {
      const day = trip.userEditedItinerary.days.find(d => d.dayNumber === Number(dayNumber));
      if (day && Array.isArray(day.slots)) {
        const slotMap = new Map(day.slots.map(s => [s.slotId, s]));
        day.slots = newSlotOrder.map(id => slotMap.get(id)).filter(Boolean);
      }
    }

    trip.isEdited = true;
    trip.markModified('userEditedItinerary');
    await trip.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in reorderSlots:', error);
    return res.status(500).json({ message: 'Error reordering slots', error: error.message });
  }
};

/**
 * Add a personal note to a slot.
 */
export const addNote = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const { slotId, note } = req.body;
    let found = false;

    if (trip.userEditedItinerary && Array.isArray(trip.userEditedItinerary.days)) {
      for (const day of trip.userEditedItinerary.days) {
        if (Array.isArray(day.slots)) {
          for (const slot of day.slots) {
            if (slot.slotId === slotId) {
              slot.userNote = note;
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
    }

    trip.markModified('userEditedItinerary');
    await trip.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in addNote:', error);
    return res.status(500).json({ message: 'Error adding note', error: error.message });
  }
};

/**
 * Reset userEditedItinerary back to generatedItinerary.
 */
export const resetToOriginal = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    trip.userEditedItinerary = trip.generatedItinerary;
    trip.isEdited = false;
    trip.markModified('userEditedItinerary');
    await trip.save();

    return res.status(200).json({ success: true, itinerary: trip.userEditedItinerary });
  } catch (error) {
    console.error('Error in resetToOriginal:', error);
    return res.status(500).json({ message: 'Error resetting itinerary', error: error.message });
  }
};

/**
 * Get place suggestions filtered by category and exclude already used names.
 */
export const getSuggestions = async (req, res) => {
  try {
    const { category, lat, lng, tripId } = req.query;

    if (!category || !lat || !lng || !tripId) {
      return res.status(400).json({ message: 'Missing query parameters' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const usedNames = new Set();
    const itinerary = trip.userEditedItinerary || trip.generatedItinerary;
    if (itinerary && Array.isArray(itinerary.days)) {
      itinerary.days.forEach(day => {
        if (Array.isArray(day.slots)) {
          day.slots.forEach(slot => {
            if (slot.place && slot.place.name) {
              usedNames.add(slot.place.name);
            }
          });
        }
      });
    }

    const { places } = await fetchAndClassifyPlaces({
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    });

    const filtered = (places || []).filter(place => 
      place.category === category && !usedNames.has(place.name)
    );

    const suggestions = filtered.slice(0, 5);

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error in getSuggestions:', error);
    return res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
  }
};

/**
 * Export trip details as PDF document.
 */
export const exportPDF = async (req, res) => {
  try {
    let userId = req.user?.id;

    // Check query token fallback if not already set by middleware
    if (!userId) {
      let token = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.query && req.query.token) {
        token = req.query.token;
      }

      if (!token) {
        return res.status(401).json({ message: 'No token, access denied' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=planora-trip.pdf');

    doc.pipe(res);

    doc.font('Helvetica-Bold').fontSize(24).text(`Your Planora Trip to ${trip.destination}`, { align: 'center' });
    doc.moveDown(2);

    const itinerary = trip.userEditedItinerary || trip.generatedItinerary;
    if (itinerary && Array.isArray(itinerary.days)) {
      itinerary.days.forEach(day => {
        doc.font('Helvetica-Bold').fontSize(18).text(`Day ${day.dayNumber}`, { underline: true });
        doc.moveDown(0.5);

        if (Array.isArray(day.slots)) {
          day.slots.forEach(slot => {
            doc.font('Helvetica-Bold').fontSize(12).text(`${slot.time}: `, { continued: true });
            
            if (slot.place) {
              doc.font('Helvetica').fontSize(12).text(`${slot.place.name}`);
              if (slot.place.description) {
                doc.font('Helvetica-Oblique').fontSize(10).text(`Description: ${slot.place.description}`, { indent: 15 });
              }
              if (slot.place.estimatedCost) {
                doc.font('Helvetica').fontSize(10).text(`Estimated Cost: $${slot.place.estimatedCost}`, { indent: 15 });
              }
            } else {
              doc.font('Helvetica').fontSize(12).text('Free time / Empty slot');
            }
            if (slot.userNote) {
              doc.font('Helvetica-Oblique').fontSize(10).fillColor('blue').text(`Note: ${slot.userNote}`, { indent: 15 }).fillColor('black');
            }
            doc.moveDown(0.5);
          });
        }
        doc.moveDown(1);
      });
    }

    doc.addPage();
    doc.font('Helvetica-Bold').fontSize(18).text('Budget Breakdown', { underline: true });
    doc.moveDown(1);

    const breakdown = trip.budgetBreakdown;
    if (breakdown) {
      doc.font('Helvetica-Bold').fontSize(12).text(`Hotel: `, { continued: true }).font('Helvetica').text(`$${breakdown.hotel || 0}`);
      doc.font('Helvetica-Bold').fontSize(12).text(`Food: `, { continued: true }).font('Helvetica').text(`$${breakdown.food || 0}`);
      doc.font('Helvetica-Bold').fontSize(12).text(`Transport: `, { continued: true }).font('Helvetica').text(`$${breakdown.transport || 0}`);
      doc.font('Helvetica-Bold').fontSize(12).text(`Activities: `, { continued: true }).font('Helvetica').text(`$${breakdown.activities || 0}`);
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(14).fillColor('green').text(`Total Cost: `, { continued: true }).text(`$${breakdown.total || 0}`).fillColor('black');
      doc.font('Helvetica-Bold').fontSize(14).text(`Remaining Budget: `, { continued: true }).text(`$${breakdown.remaining || 0}`);
    }

    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error exporting PDF', error: error.message });
    }
  }
};

/**
 * Public endpoint to share a trip details.
 */
export const shareTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const { destination, days, userEditedItinerary, budgetBreakdown } = trip;
    return res.status(200).json({ destination, days, userEditedItinerary, budgetBreakdown });
  } catch (error) {
    console.error('Error sharing trip:', error);
    return res.status(500).json({ message: 'Error sharing trip', error: error.message });
  }
};
