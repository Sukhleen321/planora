**PLANORA — Intelligent Travel Planning Platform**
Complete Project Build Plan

What Is Planora?
Planora is a full-stack travel itinerary generator. The user enters their destination, budget, number of days, travel type, and interests — and the app generates a complete day-by-day itinerary with a budget breakdown and optimized route.
[The key difference from other travel apps: the recommendation logic is entirely custom-built. An LLM is used only to beautify the final text output, not to generate any decisions.]

Tech Stack 
LayerTechnologyFrontendReact.js + Tailwind CSS + AxiosBackendNode.js + Express.jsDatabaseMongoDB + MongooseAuthJWT + bcryptPlaces DataOpenTripMap API (free)MapsLeaflet.js + OpenStreetMap (free)LLMGemini API (free tier)PDF ExportPDFKitDeploymentRender (backend) + Vercel (frontend)

**Folder Structure**
planora-backend/
├── server.js
├── .env
├── routes/
├── controllers/
├── models/
│   ├── User.js
│   └── Trip.js
├── middleware/
│   └── authMiddleware.js
└── services/
    ├── openTripMapService.js
    ├── classifierService.js
    ├── scoringEngine.js
    ├── schedulerService.js
    ├── budgetEngine.js
    ├── routeOptimizer.js
    ├── promptEngine.js
    └── geminiService.js

planora-frontend/
└── src/
    ├── pages/
    │   ├── Landing.jsx
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   ├── Dashboard.jsx
    │   ├── TripGenerator.jsx
    │   ├── TripResult.jsx
    │   └── TripEditor.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── TripCard.jsx
    │   ├── ItineraryView.jsx
    │   ├── EditableDayCard.jsx
    │   ├── PlaceSuggestions.jsx
    │   ├── BudgetPieChart.jsx
    │   └── MapView.jsx
    ├── context/
    │   └── AuthContext.jsx
    └── api/
        └── axios.js

**Database Models**

**User**
name, email (unique), password (bcrypt hashed), createdAt, savedTrips[]

**Trip**
userId, destination, budget, days, travelers, travelType, interests[],
hotelPreference, travelPace, generatedItinerary, userEditedItinerary,
budgetBreakdown, isFavourite, isEdited, createdAt
The trip stores two versions of the itinerary — generatedItinerary (original, never touched) and userEditedItinerary (what the user customizes). Reset always copies original back.

Itinerary Shape
Each day has slots (Morning / Afternoon / Evening / Night). Each slot has a unique slotId so edit endpoints can target exactly the right place.

**API Routes**

Auth
POST  /api/auth/signup
POST  /api/auth/login
POST  /api/auth/forgot-password

Trips
POST   /api/trips/generate
GET    /api/trips/all
GET    /api/trips/:id
DELETE /api/trips/:id
PATCH  /api/trips/:id/favourite
GET    /api/trips/:id/export
GET    /api/trips/:id/share

Edit / Customize
PATCH  /api/trips/:id/edit/swap
PATCH  /api/trips/:id/edit/remove
PATCH  /api/trips/:id/edit/reorder
PATCH  /api/trips/:id/edit/custom
PATCH  /api/trips/:id/edit/note
PATCH  /api/trips/:id/edit/reset
GET    /api/trips/:id/suggestions

**The 7 Backend Engines**

Engine 1 — Fetch Places (openTripMapService.js)
Call OpenTripMap API with destination coordinates. Fetch up to 100 places within a 10km radius. Then call the detail endpoint for each top place to get full description, hours, and image.

Engine 2 — Classifier (classifierService.js)
Map raw OpenTripMap category strings into your own metadata. Each place gets tagged with travel type compatibility, cost level, time required, best time of day, and your own category label. You build this as a lookup object — this is your classifier.

Engine 3 — Scoring Engine (scoringEngine.js)
Every classified place gets a score from 0 to 100.
SignalPointsInterest matches user preference+40High rating from OpenTripMapup to +25Cost fits user budget+20Close to city centerup to +15Too expensive for budget-30Place is closed-100. Sort all places by score descending. Top places go to the scheduler.

Engine 4 — Scheduler (schedulerService.js)
Distribute top-scored places across days without repeating any place. Each day has four slots: Morning, Afternoon, Evening, Night. Assign places to slots based on their best-time tag. Respect time required — don't overfill a slot. Pace setting (relaxed / balanced / packed) controls how many places go in per day.

Engine 5 — Budget Engine (budgetEngine.js)
Calculate full cost breakdown: hotel (based on preference tier × nights), food (daily estimate × travelers × days), local transport (daily estimate × days), activity entry fees (summed from itinerary). Return total spent, remaining budget, and a pie chart data array for the frontend.

Engine 6 — Route Optimizer (routeOptimizer.js)
Reorder places within each day using greedy nearest-neighbor algorithm. Start from hotel coordinates. Find the closest unvisited attraction using the Haversine distance formula. Move to it. Repeat until all places for the day are ordered. Simple, fast, and much better than random order.

Engine 7 — Gemini Beautifier (geminiService.js)
After all logic is done, send only the description fields to Gemini with a strict prompt: rewrite in engaging English, do not change any place names, order, costs, or timings. Return the same JSON structure. LLM formats — it does not decide anything.

Edit / Customize Feature
After the itinerary is generated, the user can fully customize it from the UI.

What the user can do
Swap a place — click any slot, see 5 alternative suggestions from the API, pick one
Remove a place — delete any slot, it becomes an empty slot
Add custom place — type any place manually into an empty slot
Reorder within a day — drag and drop slots to rearrange
Add a note — attach a personal note to any slot ("book tickets in advance")
Reset to original — one button restores the original AI-generated itinerary

For more accurate recommendation:
**Step 1 — Hard Filter (before scoring even starts)**
Before any place gets a score, eliminate places that don't meet hard requirements.
If user said LOW budget → remove all HIGH cost places entirely
If user said FAMILY     → remove all places tagged family: false entirely
These places don't even enter the scoring system. Gone before scoring begins.
**Step 2 — Scoring (on the filtered list only)**
Now score only the places that passed the filter. Budget and family match are already guaranteed so you don't even need those as scoring signals anymore — scoring now just ranks by rating, distance, interest match etc.

**How it works in the backend:**

Every slot has a unique slotId
Edit endpoints receive the slotId and update only userEditedItinerary in MongoDB
generatedItinerary is never modified after creation
isEdited flag is set to true whenever any change is made
Reset endpoint copies generatedItinerary back into userEditedItinerary
Suggestions endpoint fetches alternatives from OpenTripMap filtered by category, excluding places already in the itinerary

UI components needed
EditableDayCard.jsx — renders one day with swap / remove / note buttons on each slot, drag handle for reordering
PlaceSuggestions.jsx — modal that shows 5 alternative places when user clicks Swap
TripEditor.jsx — the full editing page that holds all day cards and the Reset button at the top


**All Features**

**Auth**
Signup / Login / JWT
Forgot password
Protected routes

**Trip Generation**
Multi-step form (destination → budget/travelers → interests/pace)
Full 7-engine pipeline
Save to MongoDB on generation

**Trip Management**
Dashboard with all saved trips
Favourite / unfavourite
Delete trip
Stats: total trips, average budget, favourite destination

**Customize**
Swap place with suggestions
Remove place
Add custom place
Drag and drop reorder
Personal notes on slots
Reset to original
isEdited badge shown on trip card

**Extras**
Leaflet.js map with markers and route
Budget pie chart with Recharts
PDF export
Shareable public link
Mobile responsive