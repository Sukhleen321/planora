import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Beautifies the descriptions in the itinerary by sending them to Gemini.
 * @param {Object} itinerary - Full itinerary object containing days and slots
 * @returns {Object} Updated itinerary with beautified place descriptions, or original itinerary on failure
 */
export const beautifyItinerary = async (itinerary) => {
  if (!itinerary || !itinerary.days) {
    return itinerary;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing in environment variables. Returning itinerary unchanged.');
    return itinerary;
  }

  try {
    // 1. Extract only slots that have a place and a non-empty description
    const simplifiedArray = [];
    for (const day of itinerary.days) {
      if (day && Array.isArray(day.slots)) {
        for (const slot of day.slots) {
          if (
            slot &&
            slot.place &&
            slot.place.name &&
            slot.place.description &&
            slot.place.description.trim() !== ''
          ) {
            simplifiedArray.push({
              slotId: slot.slotId,
              placeName: slot.place.name,
              originalDescription: slot.place.description
            });
          }
        }
      }
    }

    // If there are no descriptions to beautify, return the itinerary immediately
    if (simplifiedArray.length === 0) {
      return itinerary;
    }

    // 2. Build the prompt
    const prompt = `You are a professional travel writer. 
I will give you a list of travel places with their descriptions.
Rewrite each description in warm, engaging, and professional English in 2-3 sentences.
DO NOT change any place names.
DO NOT add any new information or made up facts.
Only improve the language and tone of the description field.
Return ONLY a valid JSON array in this exact structure with no extra text, no markdown, no backticks:
[
  {
    slotId: string,
    newDescription: string
  }
]

Places: ${JSON.stringify(simplifiedArray)}`;

    // 3. Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 4. Clean potential Markdown tags from the output
    if (text) {
      text = text.trim();
      // Strip markdown block wrapping: ```json [...] ``` or ``` [...] ```
      if (text.startsWith('```')) {
        text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }
    }

    // 5. Parse JSON
    const parsedDescriptions = JSON.parse(text);
    if (!Array.isArray(parsedDescriptions)) {
      throw new Error('Gemini response is not a valid JSON array.');
    }

    // 6. Map slotIds to new descriptions
    const newDescriptionMap = new Map();
    for (const item of parsedDescriptions) {
      if (item && item.slotId && typeof item.newDescription === 'string') {
        newDescriptionMap.set(item.slotId, item.newDescription);
      }
    }

    // 7. Clone and update original itinerary
    const updatedItinerary = JSON.parse(JSON.stringify(itinerary));
    for (const day of updatedItinerary.days) {
      if (day && Array.isArray(day.slots)) {
        for (const slot of day.slots) {
          if (slot && slot.place && newDescriptionMap.has(slot.slotId)) {
            slot.place.description = newDescriptionMap.get(slot.slotId);
          }
        }
      }
    }

    return updatedItinerary;
  } catch (error) {
    console.error('Error in beautifyItinerary:', error);
    // Never crash because of Gemini, return original itinerary
    return itinerary;
  }
};
