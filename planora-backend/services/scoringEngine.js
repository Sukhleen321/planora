/**
 * Calculates the straight line distance between two coordinates in km using the Haversine formula.
 * @param {Object} coord1 - Start coordinates { lat, lng } or { lat, lon }
 * @param {Object} coord2 - End coordinates { lat, lng } or { lat, lon }
 * @returns {Number} Distance in kilometers
 */
export const haversineDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km

  const lat1 = coord1.lat;
  const lng1 = coord1.lng !== undefined ? coord1.lng : coord1.lon;
  
  const lat2 = coord2.lat;
  const lng2 = coord2.lng !== undefined ? coord2.lng : coord2.lon;

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Evaluates and scores a place based on user preferences and distance from the city center.
 * @param {Object} place - Classified place object
 * @param {Object} userPrefs - User preferences { travelType, budget, interests[] }
 * @param {Object} cityCenter - City center coordinates { lat, lng }
 * @returns {Number} Final calculated score, or -1 if the place is filtered out
 */
export const scorePlace = (place, userPrefs, cityCenter) => {
  // STEP 1 - HARD FILTER
  if (!place) {
    return -1;
  }

  // Check travel type compatibility
  if (!place.travelType || !place.travelType.includes(userPrefs.travelType)) {
    return -1;
  }

  // Check budget restrictions
  if (userPrefs.budget === 'low' && (place.costLevel === 'medium' || place.costLevel === 'high')) {
    return -1;
  }
  if (userPrefs.budget === 'medium' && place.costLevel === 'high') {
    return -1;
  }

  // Check if place is closed
  if (place.isClosed === true) {
    return -1;
  }

  // STEP 2 - SCORING
  let score = 0;

  // Interest match (+40)
  if (
    userPrefs.interests &&
    place.category &&
    userPrefs.interests.includes(place.category)
  ) {
    score += 40;
  }

  // Rating score (+25)
  // place.rate comes from OpenTripMap as 0-10
  const rate = place.rate !== undefined && place.rate !== null ? place.rate : 0;
  score += (rate / 10) * 25;

  // Budget match (+20)
  if (place.costLevel === userPrefs.budget) {
    score += 20;
  }

  // Proximity score (+15)
  const placeCoords = place.coordinates || { lat: place.lat, lng: place.lng !== undefined ? place.lng : place.lon };
  if (placeCoords && placeCoords.lat !== undefined && (placeCoords.lng !== undefined || placeCoords.lon !== undefined)) {
    const distance = haversineDistance(placeCoords, cityCenter);
    if (distance < 2) {
      score += 15;
    } else if (distance < 5) {
      score += 10;
    } else if (distance < 10) {
      score += 5;
    }
  }

  return score;
};
