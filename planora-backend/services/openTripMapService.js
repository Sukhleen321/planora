import { classifyPlace } from './classifierService.js';

/**
 * Geocodes a city name using OpenStreetMap Nominatim API.
 * @param {String} cityName - Name of the city to geocode
 * @returns {Object} Coordinates { lat, lng }
 */
export const geocodeCity = async (cityName) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Planora/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error("City not found");
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    return { lat, lng };
  } catch (error) {
    console.error('Error in geocodeCity:', error);
    throw error;
  }
};

/**
 * Coordinates geocoding, radius fetch, details download, and classification for a city.
 * @param {String} cityName - Name of the city
 * @returns {Object} Classified places and cityCenter coordinates
 */
export const fetchAndClassifyPlaces = async (cityNameOrCoords) => {
  try {
    // 1. Geocode city name to coordinates (or use direct coordinates if provided)
    let cityCenter;
    if (typeof cityNameOrCoords === 'object' && cityNameOrCoords !== null && cityNameOrCoords.lat && cityNameOrCoords.lng) {
      cityCenter = cityNameOrCoords;
    } else {
      cityCenter = await geocodeCity(cityNameOrCoords);
    }
    const { lat, lng } = cityCenter;

    // 2. Fetch raw places from Overpass API
    const query = `[out:json][timeout:30];
(
  node["tourism"](around:20000,${lat},${lng});
  node["amenity"~"restaurant|cafe|bar|nightclub|place_of_worship"](around:20000,${lat},${lng});
  node["leisure"](around:20000,${lat},${lng});
  node["natural"~"beach|water|coastline|waterfall"](around:20000,${lat},${lng});
  node["historic"](around:20000,${lat},${lng});
  way["natural"~"beach|coastline"](around:20000,${lat},${lng});
  way["tourism"](around:20000,${lat},${lng});
);
out center 200;`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Planora/1.0"
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API failed with status: ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    // Parse the response elements array
    const mappedPlaces = elements
      .filter((el) => el.tags && el.tags.name) // Filter out any element with no name
      .map((el) => {
        const id = el.id;
        const tags = el.tags;
        const kinds = tags.tourism || tags.amenity || tags.leisure || tags.natural || tags.historic || "attraction";
        const description = tags["description:en"] || tags["description"] || tags["wikipedia"] || tags["name"] || "";
        const placeLat = el.type === 'way' && el.center ? el.center.lat : el.lat;
        const placeLon = el.type === 'way' && el.center ? el.center.lon : el.lon;

        return {
          name: tags.name,
          xid: id.toString(),
          kinds: kinds,
          coordinates: { lat: placeLat, lng: placeLon },
          rating: 5,
          description: description,
          estimatedCost: 300,
          isClosed: false
        };
      });

    // Take top 100 results to increase classification candidate pool
    const top100 = mappedPlaces.slice(0, 100);

    // Run classifyPlace on each one and filter out nulls
    const classifiedPlaces = top100
      .map((place) => classifyPlace(place))
      .filter((place) => place !== null);

    console.log(`Number of places that passed classification: ${classifiedPlaces.length}`);

    return {
      places: classifiedPlaces,
      cityCenter: { lat, lng }
    };
  } catch (error) {
    console.error(`Error in fetchAndClassifyPlaces for city ${cityName}:`, error);
    throw error;
  }
};
