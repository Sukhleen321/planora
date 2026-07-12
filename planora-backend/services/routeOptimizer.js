import { haversineDistance } from './scoringEngine.js';

/**
 * Reorders a day's places using a greedy nearest-neighbor algorithm.
 * @param {Array} places - Array of non-null place objects for one day
 * @param {Object} startCoords - Starting coordinates { lat, lng }
 * @returns {Array} Reordered place objects
 */
export const optimizeRoute = (places, startCoords) => {
  if (!places || places.length === 0) {
    return [];
  }

  const unvisited = [...places];
  const route = [];
  let currentPos = { ...startCoords };

  while (unvisited.length > 0) {
    let minDistance = Infinity;
    let minIndex = -1;

    for (let i = 0; i < unvisited.length; i++) {
      const place = unvisited[i];
      const placeCoords = place.coordinates || {
        lat: place.lat,
        lng: place.lng !== undefined ? place.lng : place.lon
      };

      const dist = haversineDistance(currentPos, placeCoords);
      if (dist < minDistance) {
        minDistance = dist;
        minIndex = i;
      }
    }

    if (minIndex !== -1) {
      const nextPlace = unvisited[minIndex];
      route.push(nextPlace);
      
      // Update currentPos to the next place's coordinates
      currentPos = nextPlace.coordinates || {
        lat: nextPlace.lat,
        lng: nextPlace.lng !== undefined ? nextPlace.lng : nextPlace.lon
      };
      
      unvisited.splice(minIndex, 1);
    } else {
      // Safeguard against infinite loops if anything goes wrong
      break;
    }
  }

  return route;
};

/**
 * Optimizes the routes for each day in the entire itinerary.
 * @param {Object} itinerary - Full itinerary object
 * @param {Object} cityCenter - Coordinates of the city center / starting point { lat, lng }
 * @returns {Object} Updated itinerary object with optimized routes per day
 */
export const optimizeItineraryRoutes = (itinerary, cityCenter) => {
  if (!itinerary || !itinerary.days) {
    return itinerary;
  }

  // Create a deep copy of the itinerary to avoid unexpected side effects
  const updatedItinerary = JSON.parse(JSON.stringify(itinerary));

  for (const day of updatedItinerary.days) {
    const nonNullSlotIndexes = [];
    const placesToOptimize = [];

    // Find the slots containing places and keep track of their indices
    day.slots.forEach((slot, index) => {
      if (slot && slot.place) {
        nonNullSlotIndexes.push(index);
        placesToOptimize.push(slot.place);
      }
    });

    if (placesToOptimize.length > 0) {
      // Optimize route starting from the city center / hotel
      const optimizedPlaces = optimizeRoute(placesToOptimize, cityCenter);

      // Map optimized places back to original non-null slots
      nonNullSlotIndexes.forEach((slotIndex, i) => {
        day.slots[slotIndex].place = optimizedPlaces[i];
      });
    }
  }

  return updatedItinerary;
};
