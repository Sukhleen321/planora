/**
 * Calculates the complete budget breakdown for a trip.
 * @param {Object} userPrefs - User preferences { budget, days, travelers, hotelPreference }
 * @param {Object} itinerary - Full itinerary object containing days and slots
 * @returns {Object} Cost breakdown details and pie chart data
 */
export const calculateBudget = (userPrefs, itinerary) => {
  const days = Number(userPrefs?.days) || 0;
  const travelers = Number(userPrefs?.travelers) || 0;
  const hotelPref = userPrefs?.hotelPreference || 'budget';
  const totalBudget = Number(userPrefs?.budget) || 0;

  // Hotel Costs mapping
  const hotelRates = {
    budget: 800,
    standard: 2000,
    luxury: 6000
  };

  const hotelRate = hotelRates[hotelPref] !== undefined ? hotelRates[hotelPref] : hotelRates.budget;
  const hotelCost = hotelRate * days;

  // Food Cost: 500 per person per day
  const foodCost = 500 * travelers * days;

  // Transport Cost: 500 per day flat estimate
  const transportCost = 500 * days;

  // Activity Cost: Sum of estimated cost of all scheduled places multiplied by travelers
  let activitiesSum = 0;
  if (itinerary && Array.isArray(itinerary.days)) {
    for (const day of itinerary.days) {
      if (day && Array.isArray(day.slots)) {
        for (const slot of day.slots) {
          if (slot && slot.place && typeof slot.place.estimatedCost === 'number') {
            activitiesSum += slot.place.estimatedCost;
          }
        }
      }
    }
  }
  const activitiesCost = activitiesSum * travelers;

  // Totals
  const totalSpent = hotelCost + foodCost + transportCost + activitiesCost;
  const remaining = totalBudget - totalSpent;

  return {
    hotel: hotelCost,
    food: foodCost,
    transport: transportCost,
    activities: activitiesCost,
    total: totalSpent,
    remaining: remaining,
    pieData: [
      { name: 'Hotel', value: hotelCost },
      { name: 'Food', value: foodCost },
      { name: 'Transport', value: transportCost },
      { name: 'Activities', value: activitiesCost }
    ]
  };
};
