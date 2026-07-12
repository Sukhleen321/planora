const categoryMap = {
  // --- Beaches ---
  beaches: {
    travelType: ["friends", "family", "couple", "solo"],
    costLevel: "low",
    timeRequired: 3,
    bestTime: "morning",
    category: "beach"
  },
  
  // --- History / Culture ---
  museums: {
    travelType: ["family", "solo", "couple"],
    costLevel: "medium",
    timeRequired: 2,
    bestTime: "afternoon",
    category: "history"
  },
  historic_architecture: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "history"
  },
  fortifications: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "history"
  },
  monuments: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "morning",
    category: "history"
  },
  archaeological_sites: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "history"
  },
  ruins: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "history"
  },
  castles: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "history"
  },
  palaces: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "medium",
    timeRequired: 2,
    bestTime: "morning",
    category: "history"
  },
  art_galleries: {
    travelType: ["family", "solo", "couple"],
    costLevel: "medium",
    timeRequired: 2,
    bestTime: "afternoon",
    category: "history"
  },

  // --- Adventure / Entertainment ---
  amusements: {
    travelType: ["family", "friends"],
    costLevel: "high",
    timeRequired: 4,
    bestTime: "afternoon",
    category: "adventure"
  },
  water_parks: {
    travelType: ["family", "friends"],
    costLevel: "high",
    timeRequired: 4,
    bestTime: "afternoon",
    category: "adventure"
  },
  theme_parks: {
    travelType: ["family", "friends"],
    costLevel: "high",
    timeRequired: 4,
    bestTime: "afternoon",
    category: "adventure"
  },

  // --- Food ---
  restaurants: {
    travelType: ["friends", "family", "couple", "solo"],
    costLevel: "medium",
    timeRequired: 1,
    bestTime: "evening",
    category: "food"
  },
  foods: {
    travelType: ["friends", "family", "couple", "solo"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "evening",
    category: "food"
  },
  cafes: {
    travelType: ["friends", "family", "couple", "solo"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "afternoon",
    category: "food"
  },

  // --- Nightlife ---
  bars: {
    travelType: ["friends", "couple"],
    costLevel: "medium",
    timeRequired: 2,
    bestTime: "night",
    category: "nightlife"
  },
  nightclubs: {
    travelType: ["friends", "couple"],
    costLevel: "high",
    timeRequired: 4,
    bestTime: "night",
    category: "nightlife"
  },

  // --- Shopping ---
  shops: {
    travelType: ["friends", "family", "couple"],
    costLevel: "medium",
    timeRequired: 2,
    bestTime: "afternoon",
    category: "shopping"
  },
  markets: {
    travelType: ["friends", "family", "couple", "solo"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "evening",
    category: "shopping"
  },

  // --- Religion ---
  churches: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "morning",
    category: "religion"
  },
  temples: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "morning",
    category: "religion"
  },
  cathedrals: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "morning",
    category: "religion"
  },
  mosques: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "morning",
    category: "religion"
  },
  synagogues: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "morning",
    category: "religion"
  },

  // --- Nature ---
  zoos: {
    travelType: ["family", "friends"],
    costLevel: "medium",
    timeRequired: 3,
    bestTime: "morning",
    category: "nature"
  },
  aquariums: {
    travelType: ["family", "friends"],
    costLevel: "medium",
    timeRequired: 3,
    bestTime: "morning",
    category: "nature"
  },
  nature_reserves: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 3,
    bestTime: "morning",
    category: "nature"
  },
  waterfalls: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "nature"
  },
  gardens: {
    travelType: ["family", "solo", "couple"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "nature"
  },
  viewpoints: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 1,
    bestTime: "morning",
    category: "nature"
  },
  parks: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "nature"
  },
  forests: {
    travelType: ["solo", "friends", "couple"],
    costLevel: "low",
    timeRequired: 3,
    bestTime: "morning",
    category: "nature"
  },
  lakes: {
    travelType: ["family", "solo", "couple", "friends"],
    costLevel: "low",
    timeRequired: 2,
    bestTime: "morning",
    category: "nature"
  }
};

/**
 * Maps raw OpenTripMap category strings into custom metadata.
 * @param {Object} place - Raw place object from OpenTripMap
 * @returns {Object|null} - Decoded place object spread with metadata, or null if no classification exists
 */
export const classifyPlace = (place) => {
  if (!place || !place.kinds) {
    return null;
  }

  // Split comma-separated kinds string
  const kindsArray = place.kinds.split(',').map((kind) => kind.trim());

  // Loop through kinds to find the first match in categoryMap
  for (const kind of kindsArray) {
    // 1. Direct match (e.g. "ruins" -> "ruins")
    if (categoryMap[kind]) {
      return {
        ...place,
        ...categoryMap[kind]
      };
    }

    // 2. Singular to plural "s" match (e.g. "museum" -> "museums")
    const pluralS = kind + 's';
    if (categoryMap[pluralS]) {
      return {
        ...place,
        ...categoryMap[pluralS]
      };
    }

    // 3. Singular to plural "es" match (e.g. "beach" -> "beaches", "church" -> "churches")
    if (kind.endsWith('ch') || kind.endsWith('sh') || kind.endsWith('s') || kind.endsWith('x') || kind.endsWith('z')) {
      const pluralEs = kind + 'es';
      if (categoryMap[pluralEs]) {
        return {
          ...place,
          ...categoryMap[pluralEs]
        };
      }
    }

    // 4. Singular to plural "ies" match (e.g. "gallery" -> "galleries")
    if (kind.endsWith('y')) {
      const pluralIes = kind.slice(0, -1) + 'ies';
      if (categoryMap[pluralIes]) {
        return {
          ...place,
          ...categoryMap[pluralIes]
        };
      }
    }
  }

  return null;
};

