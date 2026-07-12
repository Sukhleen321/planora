/**
 * Distributes scored places across days based on pace and slot timings.
 * @param {Array} scoredPlaces - Classified and scored places, sorted by score descending
 * @param {Number} days - Total days for the trip
 * @param {String} pace - Travel pace ("relaxed", "balanced", "packed")
 * @returns {Object} Structured itinerary with days and slots
 */
export const buildSchedule = (scoredPlaces, days, pace) => {
  const placesList = Array.isArray(scoredPlaces) ? scoredPlaces : [];
  const usedPlaceNames = new Set();
  const times = ['Morning', 'Afternoon', 'Evening', 'Night'];

  // Determine pace multiplier and maximum places per day
  let multiplier = 1;
  if (pace === 'relaxed') {
    multiplier = 0.6;
  } else if (pace === 'balanced') {
    multiplier = 1.0;
  } else if (pace === 'packed') {
    multiplier = 1.4;
  }

  const placesPerDay = Math.round(4 * multiplier);

  const daysArray = [];

  for (let d = 1; d <= days; d++) {
    let assignedCount = 0;
    const slots = [];

    for (const time of times) {
      const slotId = `day${d}-${time.toLowerCase()}`;
      let assignedPlace = null;

      // Assign place if budget/limit for the day permits
      if (assignedCount < placesPerDay) {
        // Find highest scored place matching slot time that hasn't been used yet
        const foundPlace = placesList.find(
          (place) =>
            place &&
            place.name &&
            place.bestTime &&
            place.bestTime.toLowerCase() === time.toLowerCase() &&
            !usedPlaceNames.has(place.name)
        );

        if (foundPlace) {
          assignedPlace = { ...foundPlace };
          usedPlaceNames.add(foundPlace.name);
          assignedCount++;
        }
      }

      slots.push({
        slotId,
        time,
        place: assignedPlace,
        userNote: ''
      });
    }

    daysArray.push({
      dayNumber: d,
      slots
    });
  }

  return {
    days: daysArray
  };
};
